const LocalStorageHelper = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

export default LocalStorageHelper;
