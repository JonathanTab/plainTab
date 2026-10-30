import { browser } from 'wxt/browser';

/**
 * Finds the best icon for a page the way an installed app would: its web manifest icons,
 * then apple-touch-icon, then the largest <link rel="icon">, then /favicon.ico. Keyed by the
 * full page URL, because apps on one origin (/files/, /sheets/) have different icons.
 */

const CACHE_KEY = 'plaintab-favicon-cache';
const HIT_TTL = 14 * 24 * 3600 * 1000;
const MISS_TTL = 24 * 3600 * 1000;
const FETCH_TIMEOUT = 6000;
const MAX_CONCURRENT = 4;
const TARGET_SIZE = 128; // the smallest icon at least this big (tiles show 32px; this stays sharp on retina)

type CacheEntry = { icon: string | null; at: number };
type Cache = Record<string, CacheEntry>;
type Candidate = { href: string; size: number; svg?: boolean };

let cache: Cache | null = null;
const inflight = new Map<string, Promise<string | null>>();
let active = 0;
const waiting: Array<() => void> = [];

function pageKey(url: string): string {
    const u = new URL(url);
    u.hash = '';
    return u.toString();
}

async function loadCache(): Promise<Cache> {
    if (!cache) {
        const r = await browser.storage.local.get(CACHE_KEY);
        cache = (r[CACHE_KEY] as Cache | undefined) ?? {};
    }
    return cache;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
function saveCacheSoon(): void {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => browser.storage.local.set({ [CACHE_KEY]: cache }), 500);
}

/** The cached result: a URL, null (looked, found nothing), or undefined (unknown or stale). */
export async function getCachedIcon(url: string): Promise<string | null | undefined> {
    let entry: CacheEntry | undefined;
    try {
        entry = (await loadCache())[pageKey(url)];
    } catch {
        return null; // not a URL we can look up (about:, place:, ...)
    }
    if (!entry) return undefined;
    const ttl = entry.icon ? HIT_TTL : MISS_TTL;
    return Date.now() - entry.at < ttl ? entry.icon : undefined;
}

async function slot<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= MAX_CONCURRENT) await new Promise<void>((r) => waiting.push(r));
    active++;
    try {
        return await fn();
    } finally {
        active--;
        waiting.shift()?.();
    }
}

async function fetchText(url: string): Promise<{ text: string; finalUrl: string } | null> {
    try {
        const res = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(FETCH_TIMEOUT) });
        if (!res.ok) return null;
        return { text: await res.text(), finalUrl: res.url || url };
    } catch {
        return null;
    }
}

/** The smaller side of the largest size an icon declares; 0 for "any" (SVG) or none. */
function declaredSize(sizes: string | null | undefined): number {
    let best = 0;
    for (const s of (sizes ?? '').split(/\s+/)) {
        const m = /^(\d+)x(\d+)$/i.exec(s);
        if (m) best = Math.max(best, Math.min(Number(m[1]), Number(m[2])));
    }
    return best;
}

/** The smallest candidate at least TARGET_SIZE, else the largest; scalable or unsized ones last. */
function pick(cands: Candidate[]): string | null {
    const sized = cands.filter((c) => c.size > 0).sort((a, b) => a.size - b.size);
    const enough = sized.find((c) => c.size >= TARGET_SIZE);
    const scalable = cands.find((c) => c.svg || c.size === 0);
    return (enough ?? scalable ?? sized[sized.length - 1])?.href ?? null;
}

function resolve(href: string, base: string): string | null {
    try {
        const u = new URL(href, base);
        return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
    } catch {
        return null;
    }
}

const isSvg = (href: string, type?: string | null) => type === 'image/svg+xml' || /\.svg(\?|$)/i.test(href);

async function manifestIcon(manifestUrl: string): Promise<string | null> {
    const got = await fetchText(manifestUrl);
    if (!got) return null;
    try {
        const manifest = JSON.parse(got.text) as {
            icons?: Array<{ src?: string; sizes?: string; type?: string; purpose?: string }>;
        };
        const cands: Candidate[] = [];
        for (const icon of manifest.icons ?? []) {
            const purpose = icon.purpose ?? 'any';
            if (!icon.src || !/\bany\b/.test(purpose)) continue; // maskable/monochrome icons are padded or flat
            const href = resolve(icon.src, got.finalUrl);
            if (href) cands.push({ href, size: declaredSize(icon.sizes), svg: isSvg(href, icon.type) });
        }
        return pick(cands);
    } catch {
        return null;
    }
}

async function discover(url: string): Promise<string | null> {
    const page = await fetchText(url);
    if (!page) return null;
    const doc = new DOMParser().parseFromString(page.text, 'text/html');
    const base = resolve(doc.querySelector('base[href]')?.getAttribute('href') ?? '', page.finalUrl) ?? page.finalUrl;

    const manifestHref = doc.querySelector('link[rel~="manifest" i][href]')?.getAttribute('href');
    const manifestUrl = manifestHref ? resolve(manifestHref, base) : null;
    if (manifestUrl) {
        const fromManifest = await manifestIcon(manifestUrl);
        if (fromManifest) return fromManifest;
    }

    const links = [...doc.querySelectorAll('link[href]')];
    const collect = (rel: RegExp): Candidate[] =>
        links
            .filter((l) => rel.test(l.getAttribute('rel') ?? ''))
            .flatMap((l) => {
                const href = resolve(l.getAttribute('href')!, base);
                return href ? [{ href, size: declaredSize(l.getAttribute('sizes')), svg: isSvg(href, l.getAttribute('type')) }] : [];
            });
    return (
        pick(collect(/(^|\s)apple-touch-icon(-precomposed)?(\s|$)/i)) ??
        pick(collect(/(^|\s)(shortcut\s+)?icon(\s|$)/i)) ??
        resolve('/favicon.ico', base)
    );
}

/** Looks the icon up (one lookup per page at a time), caches the answer, and returns it. */
export function discoverIcon(url: string): Promise<string | null> {
    let key: string;
    try {
        key = pageKey(url);
    } catch {
        return Promise.resolve(null);
    }
    let p = inflight.get(key);
    if (!p) {
        p = slot(() => discover(url))
            .catch(() => null)
            .then(async (icon) => {
                (await loadCache())[key] = { icon, at: Date.now() };
                saveCacheSoon();
                return icon;
            })
            .finally(() => inflight.delete(key));
        inflight.set(key, p);
    }
    return p;
}
