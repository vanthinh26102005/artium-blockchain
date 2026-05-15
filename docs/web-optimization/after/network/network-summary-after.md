# Network/API After Summary

Generated at: 2026-05-07T16:03:59.621Z
Base URL: http://localhost:3000
API host: api.dgpthinh.io.vn
Checkout artwork ID: 477a93ea-b6b0-4e32-8122-2bfca3666c50
Capture note: rerun with a clean Chrome profile after verifying production API CORS returns HTTP 200. Screenshots show page data rendered successfully; API requests below are all successful.

| Scenario | Requests | Encoded transfer | API requests | API >=400 | Screenshot |
|---|---:|---:|---:|---:|---|
| discover-first-load | 77 | 660.1 KiB | 2 | 0 | discover-first-load.png |
| discover-artworks-scroll | 132 | 303.4 KiB | 3 | 0 | discover-artworks-scroll.png |
| discover-events-tab | 59 | 43.7 KiB | 2 | 0 | discover-events-tab.png |
| checkout-first-load | 54 | 3202.8 KiB | 2 | 0 | checkout-first-load.png |

## API Requests

### discover-first-load
| Method | Status | Transfer | URL |
|---|---:|---:|---|
| GET | 200 | 0.6 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 5.1 KiB | https://api.dgpthinh.io.vn/artwork?skip=0&take=18&status=ACTIVE&sortBy=likeCount&sortOrder=desc |

### discover-artworks-scroll
| Method | Status | Transfer | URL |
|---|---:|---:|---|
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 4.4 KiB | https://api.dgpthinh.io.vn/artwork?skip=0&take=18&status=ACTIVE |
| GET | 200 | 4.6 KiB | https://api.dgpthinh.io.vn/artwork?skip=18&take=18&status=ACTIVE |

### discover-events-tab
| Method | Status | Transfer | URL |
|---|---:|---:|---|
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 1.0 KiB | https://api.dgpthinh.io.vn/events/discover |

### checkout-first-load
| Method | Status | Transfer | URL |
|---|---:|---:|---|
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 0.9 KiB | https://api.dgpthinh.io.vn/artwork/477a93ea-b6b0-4e32-8122-2bfca3666c50 |
