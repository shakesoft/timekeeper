declare global {
  interface Window {
    L?: (key: string, ...args: unknown[]) => string;
  }
}

export function L(key: string, ...args: unknown[]): string {
  try {
    const fn = window.L;
    if (!fn) return key;

    if (args.length === 1 && Array.isArray(args[0])) {
      return fn(key, ...args[0]);
    }

    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
      return fn(key, ...Object.values(args[0]));
    }

    return fn(key, ...args);
  } catch {
    return key;
  }
}

export default L;
