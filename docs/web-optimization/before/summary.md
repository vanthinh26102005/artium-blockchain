# Web Optimization Before Evidence

## Measurement Context

- Branch: chore/web-optimization-evidence
- Commit: 67b28e6f
- Measured at: 2026-05-07 17:47:53 +07
- Node/npm: v24.14.0 / 11.9.0
- FE: local production build at http://localhost:3000
- BE: https://api.dgpthinh.io.vn
- Checkout artwork ID: 477a93ea-b6b0-4e32-8122-2bfca3666c50
- Browser: Google Chrome headless via Lighthouse and Chrome DevTools Protocol

## Lighthouse Before

| Page/report | Performance | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| discover-desktop | 71 | 0.3 s | 2.3 s | 0 ms | 0.32 | 1.0 s |
| discover-mobile | 57 | 1.1 s | 5.1 s | 60 ms | 1.077 | 1.1 s |
| checkout-desktop | 66 | 1.3 s | 6.3 s | 140 ms | 0 | 2.0 s |
| checkout-mobile | 50 | 3.1 s | 23.2 s | 790 ms | 0 | 3.4 s |

Evidence: `lighthouse/*.report.html`, `lighthouse/*.report.json`, `lighthouse/lighthouse-summary-before.md`.

## Bundle Before

| Route | Raw route assets | Files |
| --- | ---: | ---: |
| /_app | 810.5 KiB raw | 15 |
| /discover | 1039.0 KiB raw | 16 |
| /checkout/[artworkId] | 344.4 KiB raw | 4 |

Evidence: `bundle/build-output-before.txt`, `bundle/route-size-before.txt`, `bundle/top-chunks-before.txt`, `bundle/build-size-before.txt`.

## Network/API Before

| Scenario | Requests | Encoded transfer | API requests | Failed/API >=400 | Screenshot |
| --- | ---: | ---: | ---: | ---: | --- |
| checkout-first-load | 60 | 2787.6 KiB | 2 | 0 | network/checkout-first-load.png |
| discover-artworks-scroll | 139 | 3446.4 KiB | 3 | 0 | network/discover-artworks-scroll.png |
| discover-events-tab | 65 | 18.2 KiB | 2 | 0 | network/discover-events-tab.png |
| discover-first-load | 84 | 2338.8 KiB | 2 | 0 | network/discover-first-load.png |

Browser requests from local FE to production BE succeeded on `http://localhost:3000`; the CORS check is saved in `network/api-cors-check-before.txt` and includes `access-control-allow-origin: http://localhost:3000`.

Evidence: `network/*.network.json`, `network/*.png`, `network/network-summary-before.md`, `network/artwork-candidates-before.json`, `network/checkout-artwork-http-before.txt`.

## RPC Before

| Item | Status | Evidence |
| --- | --- | --- |
| Automated MetaMask RPC count | Not captured in headless CLI because MetaMask is unavailable | `rpc/rpc-count-before.txt` |
| Manual MetaMask checkout attempt | Captured via user-provided console screenshot; transaction signature was rejected/cancelled | `rpc/rpc-count-before.txt` |
| Manual counter snippet | Ready for browser profile with MetaMask | `rpc/rpc-counter-snippet.js` |

Manual console evidence showed: `MetaMask - RPC Error: MetaMask Tx Signature: User denied transaction signature.` This confirms the before wallet flow reaches MetaMask signing, then exits through a rejection/cancel path when the user cancels due to insufficient funds.

## Observed Before Bottlenecks

- `/discover` route assets are high at about 1039.0 KiB raw and include a 299.9 KiB route chunk.
- Mobile Lighthouse is weaker than desktop: Discover 57 and Checkout 50.
- Discover mobile CLS is high at 1.077.
- Checkout mobile LCP is high at 23.2 s and TBT is 790 ms.
- Discover scenarios trigger repeated artwork page loads during scroll: first page and next page requests are visible in network evidence.
