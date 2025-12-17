# Testing Knowledge Base

## Testing Frameworks & Structure Patterns

### Testing Framework

- **Primary Framework**: Jest with TypeScript support (ts-jest)
- **NestJS Testing**: Uses `@nestjs/testing` module for dependency injection and module testing
- **Test Types**: Unit tests (`.spec.ts`) and End-to-End tests (`.e2e-spec.ts`)
- **Test Runner**: Jest with custom configuration for TypeScript transformation

### Directory Structure Patterns

```
apps/
  {service-name}/
    src/
      *.spec.ts           # Unit tests co-located with source files
      test/
        *.spec.ts         # Additional unit tests
    test/
      jest-e2e.json       # E2E test configuration
      *.e2e-spec.ts       # End-to-end tests
```

### Test File Naming Conventions

- Unit Tests: `*.spec.ts` (co-located with source files)
- End-to-End Tests: `*.e2e-spec.ts` (in dedicated test directories)
- Configuration Files: `jest-e2e.json` for E2E test configuration

### Project Test Configuration

- Root Jest configuration in `package.json` for unit tests
- Individual `jest-e2e.json` files per service for E2E tests
- Module mapping for shared libraries: `@app/common`
- Test roots include both `libs/` and `apps/` directories

## Test Organization Patterns & Type Categorization

### Test Categories

- **Unit Tests**: Service layer tests, controller tests, repository tests
- **Integration Tests**: Component interaction tests using NestJS TestingModule
- **End-to-End Tests**: Full application flow tests (configured per service)

### Test Structure Patterns

- **Describe Blocks**: Organized by class/function with nested describe blocks for methods
- **Test Lifecycle**: Consistent `beforeEach` for module setup, `afterEach` for cleanup
- **Dependency Injection**: Uses NestJS `Test.createTestingModule()` for dependency management

### Test Organization by Layer

- **Controllers**: Focus on HTTP request/response handling and dependency injection
- **Services**: Business logic testing with mocked dependencies
- **Repositories**: Data access layer testing with mocked models and database operations

### Service Coverage Areas

- **analytic-service**: Audit logging, change tracking, query operations
- **auth-service**: Authentication, token generation and validation
- **configuration-service**: CLS context management, analytics client integration

## Test Execution Commands & Workflows

### Primary Test Commands

```bash
# Run all unit tests
npm run test

# Run tests in watch mode for development
npm run test:watch

# Run tests with coverage reporting
npm run test:cov

# Run tests in debug mode
npm run test:debug

# Run end-to-end tests (currently configured for model-gateway)
npm run test:e2e
```

### Test Configuration Files

- **Root Configuration**: Jest config in `package.json` for unit tests
- **E2E Configuration**: Individual `jest-e2e.json` per service
- **Coverage Directory**: `./coverage` for coverage reports
- **Test Environment**: Node.js environment for all tests

### Test Execution Patterns

- **Unit Tests**: Use `testRegex: ".*\\.spec\\.ts$"` pattern
- **E2E Tests**: Use `testRegex: ".e2e-spec.ts$"` pattern
- **Transform**: TypeScript files processed via `ts-jest`
- **Module Resolution**: Supports path mapping for shared libraries

## Mocking Strategies & Test Utilities

### Mocking Approaches

- **Service Mocking**: Mock objects with `jest.fn()` for method stubs
- **Provider Replacement**: Use `useValue` in NestJS TestingModule for dependency injection
- **Database Mocking**: Mock Mongoose models using `getModelToken()` from `@nestjs/mongoose`
- **Method Chaining**: Mock fluent interfaces for database query builders

### Common Mock Patterns

```typescript
// Service/Repository Mock Object
const mockService = {
  methodName: jest.fn(),
  anotherMethod: jest.fn().mockResolvedValue(returnValue),
};

// Database Model Mock
const mockModel = {
  find: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
};
```

### Test Lifecycle Management

- **Setup**: `beforeEach` with NestJS `Test.createTestingModule()`
- **Cleanup**: `afterEach` with `jest.clearAllMocks()`
- **Module Compilation**: Async module creation and dependency retrieval
- **Mock Reset**: Consistent mock state cleanup between tests

### Mock Configuration Patterns

- **Return Values**: `mockResolvedValue()` for async operations
- **Error Simulation**: `mockRejectedValue()` for error testing
- **Call Verification**: `toHaveBeenCalledWith()` and `toHaveBeenCalledTimes()`
- **Spy Functions**: Individual method mocking with `jest.fn()`

## Test Data Management & Environment Setup

### Test Data Patterns

- **Inline Test Data**: Test data defined directly within test cases
- **Object Literal Fixtures**: Simple object structures for DTO and entity testing
- **Dynamic Test Data**: Generated test data with timestamps and IDs
- **Mock Result Objects**: Structured response objects for service layer testing

### Test Data Examples

```typescript
// DTO Test Data
const testDto = {
  entityName: 'test-entity',
  entityId: 123,
  clientId: 'test-client-id',
  requestId: 'test-request-id',
  operation: 'INSERT' as any,
};

// Mock Response Data
const mockResult = {
  data: [] as ChangeTrackingDocument[],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};
```

### Environment Setup

- **Test Environment**: Node.js environment configured in Jest
- **Database Isolation**: Mocked database models prevent real database access
- **No External Dependencies**: All external services mocked at test boundaries
- **Memory-Based Testing**: Tests run entirely in memory without persistent state

### Data Management Strategies

- **No Shared State**: Each test creates its own data instances
- **Automatic Cleanup**: Mock state reset in `afterEach` lifecycle hooks
- **Timestamp Handling**: Custom date objects for temporal testing
- **ID Generation**: Simple string/number IDs for test scenarios
