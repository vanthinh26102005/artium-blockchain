# Network/API Before Summary

Generated at: 2026-05-07T10:46:03.472Z
Base URL: http://localhost:3000
API host: api.dgpthinh.io.vn
Checkout artwork ID: 477a93ea-b6b0-4e32-8122-2bfca3666c50

| Scenario | Requests | Encoded transfer | API requests | Failed/API >=400 | Screenshot |
| --- | ---: | ---: | ---: | ---: | --- |
| discover-first-load | 84 | 2338.8 KiB | 2 | 0 | discover-first-load.png |
| discover-artworks-scroll | 139 | 3446.4 KiB | 3 | 0 | discover-artworks-scroll.png |
| discover-events-tab | 65 | 18.2 KiB | 2 | 0 | discover-events-tab.png |
| checkout-first-load | 60 | 2787.6 KiB | 2 | 0 | checkout-first-load.png |

## API Requests

### discover-first-load
| Method | Status | Transfer | URL |
| --- | ---: | ---: | --- |
| GET | 200 | 0.6 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 5.0 KiB | https://api.dgpthinh.io.vn/artwork?skip=0&take=18&status=ACTIVE&sortBy=likeCount&sortOrder=desc |

### discover-artworks-scroll
| Method | Status | Transfer | URL |
| --- | ---: | ---: | --- |
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 4.2 KiB | https://api.dgpthinh.io.vn/artwork?skip=0&take=18&status=ACTIVE |
| GET | 200 | 4.5 KiB | https://api.dgpthinh.io.vn/artwork?skip=18&take=18&status=ACTIVE |

### discover-events-tab
| Method | Status | Transfer | URL |
| --- | ---: | ---: | --- |
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 1.0 KiB | https://api.dgpthinh.io.vn/events/discover |

### checkout-first-load
| Method | Status | Transfer | URL |
| --- | ---: | ---: | --- |
| GET | 200 | 0.3 KiB | http://localhost:3000/api/auth/session |
| GET | 200 | 0.9 KiB | https://api.dgpthinh.io.vn/artwork/477a93ea-b6b0-4e32-8122-2bfca3666c50 |
