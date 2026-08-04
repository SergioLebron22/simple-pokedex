// tcgdex's set/series/card data barely changes, so cache raw responses in
// sessionStorage to avoid re-fetching dozens (sometimes hundreds) of requests
// every time a page that depends on it is revisited in the same session.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Storage full/unavailable (private browsing etc.) — safe to skip caching.
  }
}

export async function cachedFetchJson(key, url) {
  const cached = readCache(key);
  if (cached) return cached;
  const data = await fetch(url).then(r => r.ok ? r.json() : Promise.reject());
  writeCache(key, data);
  return data;
}

// Runs `fn` over `items` with at most `limit` in flight at once — used for
// batches large enough (100-250+ requests, e.g. one per card in a big set)
// that firing them all at once risks overwhelming the browser/tcgdex.
export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
