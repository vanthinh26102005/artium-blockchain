interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: <T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<T>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}
