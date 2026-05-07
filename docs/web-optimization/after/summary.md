# Web Optimization Evidence - After

Phase 3 after measurements for local production frontend connected to production backend.

## Conditions

- Measured at: 23:03:59 7/5/2026 Asia/Ho_Chi_Minh (2026-05-07T16:03:59.621Z)
- Branch: chore/web-optimization-evidence
- Commit: 67b28e6fe316c9730c484c50ea5badf7f6630422
- Node/npm: v24.14.0 / 11.9.0
- FE: local production server at `http://localhost:3000`
- BE: production API `https://api.dgpthinh.io.vn`
- Checkout artwork ID: 477a93ea-b6b0-4e32-8122-2bfca3666c50
- API CORS check: `after/network/api-cors-check-after.txt` returns HTTP/2 200 with `access-control-allow-origin: http://localhost:3000`.
- Network screenshots were rerun after confirming the page renders data correctly with a clean Chrome profile.

## Lighthouse After

| Page | Performance | FCP | LCP | TBT | CLS | Speed Index | Evidence |
|---|---:|---:|---:|---:|---:|---:|---|
| Discover desktop | 81 | 335 ms | 1.7 s | 0 ms | 0.230 | 771 ms | after/lighthouse/discover-desktop.report.html/json |
| Discover mobile | 79 | 1.5 s | 5.5 s | 47 ms | 0.000 | 2.3 s | after/lighthouse/discover-mobile.report.html/json |
| Checkout desktop | 74 | 332 ms | 4.7 s | 143 ms | 0.000 | 1.1 s | after/lighthouse/checkout-desktop.report.html/json |
| Checkout mobile | 53 | 1.5 s | 20.9 s | 985 ms | 0.002 | 2.0 s | after/lighthouse/checkout-mobile.report.html/json |

## Network/API After

| Scenario | Requests | Transfer | API requests | API >=400 | Evidence |
|---|---:|---:|---:|---:|---|
| discover-first-load | 77 | 660.1 KiB | 2 | 0 | after/network/discover-first-load.network.json + .png |
| discover-artworks-scroll | 132 | 303.4 KiB | 3 | 0 | after/network/discover-artworks-scroll.network.json + .png |
| discover-events-tab | 59 | 43.7 KiB | 2 | 0 | after/network/discover-events-tab.network.json + .png |
| checkout-first-load | 54 | 3202.8 KiB | 2 | 0 | after/network/checkout-first-load.network.json + .png |

## Bundle After

| Route | Files | Raw size | Evidence |
|---|---:|---:|---|
| /_app | 16 | 811.5 KiB | after/bundle/route-size-after.txt |
| /discover | 14 | 608.0 KiB | after/bundle/route-size-after.txt |
| /checkout/[artworkId] | 5 | 344.6 KiB | after/bundle/route-size-after.txt |

## RPC After

- Automated mock-provider checkpoint: checkout first load before selecting wallet made `0` `window.ethereum.request` calls.
- Evidence: `after/rpc/rpc-count-after.txt`, `after/rpc/checkout-first-load-after.png`.
- Manual MetaMask reject screenshot is still required if the report needs a real extension transaction-cancel artifact.

## Observed Bottlenecks After

- Discover initial route bundle is reduced substantially, and Discover mobile CLS is resolved in this Lighthouse run.
- Checkout mobile LCP improves slightly, but large checkout/client-side payment dependencies still dominate the page.
- Some remote Unsplash image URLs may return 404 during capture; these are static image resources from backend data, not production API failures.
