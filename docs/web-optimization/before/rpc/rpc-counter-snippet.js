(() => {
  if (!window.ethereum || typeof window.ethereum.request !== 'function') {
    console.warn('[RPC Counter] window.ethereum is not available. Open this page in a browser profile with MetaMask.');
    window.__artiumRpcCounts = {};
    return;
  }

  const originalRequest = window.ethereum.request.bind(window.ethereum);
  const counts = {};
  const calls = [];

  window.ethereum.request = async (args) => {
    const method = args?.method ?? 'unknown';
    counts[method] = (counts[method] ?? 0) + 1;
    calls.push({ method, params: args?.params ?? null, at: new Date().toISOString() });
    console.log('[RPC Counter]', method, 'count=', counts[method]);
    return originalRequest(args);
  };

  window.__artiumRpcCounts = counts;
  window.__artiumRpcCalls = calls;
  window.__printArtiumRpcCounts = () => {
    console.table(counts);
    return { counts, calls };
  };

  console.log('[RPC Counter] Installed. Run window.__printArtiumRpcCounts() after the checkout flow.');
})();
