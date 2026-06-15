/** Deterministic pseudo-random generator from a string seed. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle with a stable seed (same seed → same order). */
export function shuffleCars<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  const random = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SESSION_SEED_KEY = 'cars-browse-shuffle-seed';

export function getCarsBrowseShuffleSeed(filterKey: string): string {
  let sessionSeed = sessionStorage.getItem(SESSION_SEED_KEY);
  if (!sessionSeed) {
    sessionSeed = String(Date.now());
    sessionStorage.setItem(SESSION_SEED_KEY, sessionSeed);
  }
  return `${sessionSeed}:${filterKey}`;
}
