class TTLCache {
  constructor({ ttl = 60000, max = 500 } = {}) {
    this.ttl = ttl;
    this.max = max;
    this.store = new Map();
  }

  #isExpired(entry) {
    return entry.expiresAt !== 0 && entry.expiresAt < Date.now();
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (this.#isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    entry.lastAccessed = Date.now();
    return entry.value;
  }

  set(key, value, { ttl } = {}) {
    const effectiveTtl = typeof ttl === 'number' ? ttl : this.ttl;
    const expiresAt = effectiveTtl > 0 ? Date.now() + effectiveTtl : 0;

    if (this.store.size >= this.max) {
      this.#evictLeastRecentlyUsed();
    }

    this.store.set(key, {
      value,
      expiresAt,
      lastAccessed: Date.now()
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  #evictLeastRecentlyUsed() {
    let lruKey = null;
    let oldest = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (this.#isExpired(entry)) {
        this.store.delete(key);
        return;
      }

      if (entry.lastAccessed < oldest) {
        oldest = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey !== null) {
      this.store.delete(lruKey);
    }
  }
}

export const userSearchCache = new TTLCache({ ttl: 60_000, max: 250 });
export const dashboardLinkCache = new TTLCache({ ttl: 120_000, max: 500 });
