# Testing Patterns

**Analysis Date:** 2026-04-21

---

## Backend Testing (NestJS Microservices)

### Test Framework

**Runner:** Jest 30
- Config: inline in `BE/package.json` (`"jest"` key) — no separate jest.config file
- Transform: `ts-jest` for TypeScript compilation
- Test environment: `node`

**Type definitions:** `@types/jest`, `@types/supertest`

**Run Commands:**
```bash
# From BE/ directory
yarn test              # Run all spec files once
yarn test:watch        # Watch mode
yarn test:cov          # Run with coverage report
yarn test:debug        # Debug mode (--inspect-brk)
yarn test:e2e          # E2E tests (separate jest-e2e.json config)
```

### Test File Location

- **Pattern:** `*.spec.ts` (enforced by `"testRegex": ".*\\.spec\\.ts$"`)
- **Roots:** `apps/` and `libs/` directories
- **Co-located** with source (same directory as the file under test)
- **Current state:** No `.spec.ts` files exist in `apps/` or `libs/` — **test coverage is zero**

### Jest Configuration (`BE/package.json`)

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
    "roots": ["<rootDir>/apps/", "<rootDir>/libs/"],
    "moduleNameMapper": {
      "^@app/rabbitmq(|/.*)$": "<rootDir>/libs/rabbitmq/src/$1",
      "^@app/metrics(|/.*)$": "<rootDir>/libs/metrics/src/$1",
      "^@app/common(|/.*)$": "<rootDir>/libs/common/src/$1",
      "^@app/outbox(|/.*)$": "<rootDir>/libs/outbox/src/$1",
      "^@app/auth(|/.*)$": "<rootDir>/libs/auth/src/$1"
    }
  }
}
```

The `moduleNameMapper` maps all `@app/*` path aliases for Jest — note that `@app/blockchain` and `@app/api-clients` are **not mapped**, which would cause test failures for files importing those libs.

### Testing Infrastructure Available

Although no tests are written yet, the following testing libraries are installed:
- `@nestjs/testing` — for `Test.createTestingModule()`
- `jest` — runner
- `ts-jest` — TypeScript transformation
- `supertest` — HTTP integration testing

### Expected NestJS Unit Test Pattern (standard)

When adding tests, follow the `@nestjs/testing` module pattern:
```typescript
// Example: LoginByEmail.command.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LoginByEmailHandler } from './LoginByEmail.command.handler';
import { IUserRepository } from '../../domain';

describe('LoginByEmailHandler', () => {
  let handler: LoginByEmailHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginByEmailHandler,
        {
          provide: IUserRepository,
          useValue: {
            findByEmail: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<LoginByEmailHandler>(LoginByEmailHandler);
    userRepository = module.get(IUserRepository);
  });

  it('should throw unauthorized when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(RpcException);
  });
});
```

### Mocking Patterns (Inferred)

- **Repository mocks:** `jest.fn()` for each method, injected via `useValue` in test module
- **RpcExceptionHelper:** Real implementation, or jest.spyOn if needed
- **Logger:** Can be mocked via `{ provide: Logger, useValue: { log: jest.fn(), error: jest.fn() } }`
- **Service mocks:** Same `useValue` pattern with `jest.fn()` stubs

---

## Smart Contract Testing (Hardhat)

### Test Framework

**Runner:** Hardhat + Mocha
- Config: `BE/smart-contracts/hardhat.config.ts`
- Test location: `BE/smart-contracts/test/`
- Single test file: `BE/smart-contracts/test/ArtAuctionEscrow.test.ts`

**Assertion Library:** Chai 4 (`expect` style)
- `@nomicfoundation/hardhat-chai-matchers` — extends Chai with `revertedWithCustomError`, `emit`, etc.
- `@nomicfoundation/hardhat-network-helpers` — `time`, `loadFixture`

**Run Commands:**
```bash
# From BE/smart-contracts/ directory
yarn test              # Run all Hardhat tests
yarn compile           # Compile Solidity contracts first
npx hardhat node       # Start local Hardhat node for manual testing
```

### Test File Organization

```
BE/smart-contracts/
├── contracts/           # Solidity source files
│   └── ArtAuctionEscrow.sol
├── test/
│   └── ArtAuctionEscrow.test.ts  # Single test file for the contract
├── scripts/             # Deploy scripts
├── typechain-types/     # Auto-generated TypeScript types for contracts
└── hardhat.config.ts
```

### Test Structure Pattern

```typescript
// BE/smart-contracts/test/ArtAuctionEscrow.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ArtAuctionEscrow } from "../typechain-types";

describe("ArtAuctionEscrow", function () {
  // Constants at top of describe block
  const ORDER_ID = "order-001";
  const RESERVE_PRICE = ethers.parseEther("1.0");

  // State enum mirrors contract enum
  const State = { Started: 0, Ended: 1, Shipped: 2, ... };

  // Fixture: base deployment
  async function deployFixture() {
    const [owner, seller, bidder1, bidder2, arbiter, platformWallet] =
      await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
    const artAuction = await Factory.deploy(arbiter.address, platformWallet.address, PLATFORM_FEE_BPS);
    return { artAuction, owner, seller, bidder1, bidder2, arbiter, platformWallet };
  }

  // Fixture chaining: each builds on the previous state
  async function auctionCreatedFixture() {
    const base = await deployFixture();
    await base.artAuction.connect(base.seller).createAuction(...);
    return base;
  }

  async function auctionEndedFixture() {
    const base = await auctionCreatedFixture();
    await time.increase(DURATION + 1);       // Hardhat time manipulation
    await base.artAuction.connect(base.seller).endAuction(ORDER_ID);
    return base;
  }

  // Test suites grouped by contract function
  describe("createAuction", function () {
    it("Tạo phiên đấu giá thành công", async function () {
      const { artAuction, seller } = await loadFixture(deployFixture);

      await expect(artAuction.connect(seller).createAuction(...))
        .to.emit(artAuction, "AuctionStarted");            // event assertion

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.seller).to.equal(seller.address);
    });

    it("Revert nếu orderId đã tồn tại", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(seller).createAuction(ORDER_ID, ...)
      ).to.be.revertedWithCustomError(artAuction, "AuctionAlreadyExists");  // custom error
    });
  });
});
```

### Key Hardhat Testing Patterns

**Fixtures:** Use `loadFixture()` for efficient test isolation — Hardhat snapshots chain state:
```typescript
const { artAuction, seller } = await loadFixture(deployFixture);
```

**Fixture chaining:** Each lifecycle state is its own fixture function that calls the previous:
- `deployFixture` → `auctionCreatedFixture` → `auctionEndedFixture` → `auctionShippedFixture` → `auctionDisputedFixture`

**Time manipulation:**
```typescript
await time.increase(DURATION + 1);  // advance block timestamp
```

**Signer interaction:**
```typescript
await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("2.0") });
```

**Custom error assertions:**
```typescript
await expect(tx).to.be.revertedWithCustomError(contract, "AuctionAlreadyExists");
```

**Event assertions:**
```typescript
await expect(tx).to.emit(artAuction, "AuctionStarted");
```

**TypeChain:** Contracts are typed via generated `typechain-types/` — no `any` casts needed:
```typescript
import { ArtAuctionEscrow } from "../typechain-types";
```

### Test Language Note
Smart contract test descriptions are written in **Vietnamese** (the project team's native language). This is consistent throughout `ArtAuctionEscrow.test.ts`:
- `"Tạo phiên đấu giá thành công"` (Auction created successfully)
- `"Revert nếu orderId đã tồn tại"` (Revert if orderId already exists)

---

## Frontend Testing

**No frontend testing is configured.** The `FE/artium-web/package.json` contains no test framework dependencies (no Jest, Vitest, Playwright, Cypress, or Testing Library). The `"scripts"` only include `dev`, `build`, `start`, `lint`.

---

## Coverage

### Backend
- **Target:** None enforced (no threshold configured)
- **Collection:** `collectCoverageFrom: ["**/*.(t|j)s"]` — all TS/JS files
- **Output:** `BE/coverage/` directory
- **Current coverage:** 0% (no spec files exist)

### Smart Contracts
- `solidity-coverage` package is installed but no coverage target is configured
- Run: `npx hardhat coverage` from `BE/smart-contracts/`

---

## Test Types

### Unit Tests (Backend)
- **Scope:** Single handler/service in isolation
- **Location:** Co-located as `*.spec.ts` next to the source file
- **Pattern:** `Test.createTestingModule()` with mocked dependencies
- **Status:** Not implemented — infrastructure ready, no tests written

### Integration / E2E Tests (Backend)
- **Config:** `BE/apps/backend/test/jest-e2e.json` (referenced in `test:e2e` script)
- **Tool:** `supertest` for HTTP request simulation
- **Status:** Config file path referenced but not confirmed present

### Smart Contract Tests
- **Scope:** Full contract state-machine coverage (constructor → create → bid → end → ship → dispute → resolve)
- **Isolation:** `loadFixture()` resets chain state per test
- **Status:** Implemented in `BE/smart-contracts/test/ArtAuctionEscrow.test.ts`

---

## Adding New Tests

### Backend Handler Test (template)
Place at: `BE/apps/{service-name}/src/application/commands/handlers/MyAction.command.handler.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { MyActionHandler } from './MyAction.command.handler';
import { IMyRepository } from '../../../domain/interfaces';
import { RpcExceptionHelper } from '@app/common';

describe('MyActionHandler', () => {
  let handler: MyActionHandler;
  let repo: jest.Mocked<{ findById: jest.Mock; create: jest.Mock }>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyActionHandler,
        { provide: IMyRepository, useValue: { findById: jest.fn(), create: jest.fn() } },
      ],
    }).compile();

    handler = module.get(MyActionHandler);
    repo = module.get(IMyRepository);
  });

  it('should execute successfully', async () => {
    repo.findById.mockResolvedValue({ id: '1' });
    const result = await handler.execute(new MyActionCommand('1'));
    expect(result).toBeDefined();
  });
});
```

### Smart Contract Test (template)
Add new `describe` block in `BE/smart-contracts/test/ArtAuctionEscrow.test.ts` following the fixture pattern, or create a new `test/*.test.ts` file for a new contract.

---

*Testing analysis: 2026-04-21*
