# LLM Proxy Microservice - Technical Knowledge Base

## Project Architecture

### Overall Architecture Pattern
This project follows a **NestJS Monorepo Microservices Architecture** pattern with the following characteristics:

- **Monorepo Structure**: Multiple applications and shared libraries managed within a single repository
- **Microservices Design**: Each application serves as an independent microservice with distinct responsibilities
- **Shared Common Library**: Centralized utilities, DTOs, entities, and cross-cutting concerns
- **TypeScript/NestJS Framework**: Built on NestJS framework providing decorative IoC, middleware, and enterprise patterns

### Top-Level Directory Structure

#### Core Directories
- **`apps/`**: Contains all individual microservice applications
- **`libs/`**: Shared libraries and common utilities across applications  
- **`nginx/`**: Reverse proxy configuration and SSL certificates
- **`litellm/`**: LiteLLM proxy configuration and custom callbacks
- **`logs/`**: Application and error log files

#### Configuration & Tooling
- **Root config files**: Package management, build tools, linting, testing, and deployment configurations
- **`.github/`**: Workflows, documentation, and development process automation

### Application Services
The monorepo contains the following microservices:

1. **`model-gateway`**: Primary entry point and LLM model routing
2. **`auth-service`**: Authentication and authorization management
3. **`configuration-service`**: System configuration and settings management
4. **`analytic-service`**: Analytics and usage tracking
5. **`logger-service`**: Centralized logging service
6. **`usage-control`**: Usage limits and rate limiting
7. **`continue-proxy`**: Continue IDE integration proxy

## Shared Code Conventions

### Common Library Structure (`libs/common/`)
The shared library follows a domain-driven organization pattern:

#### Data Layer
- **`entities/`**: Database entity definitions
- **`repositories/`**: Data access layer implementations  
- **`schemas/`**: Database schema definitions
- **`mongodb/`**: MongoDB-specific implementations and abstractions
- **`relational-database/`**: SQL database configurations and utilities

#### Application Layer
- **`dtos/`**: Data Transfer Objects for API contracts
- **`interfaces/`**: TypeScript interface definitions
- **`constants/`**: System-wide constants and enums
- **`decorators/`**: Custom NestJS decorators

#### Infrastructure Layer
- **`cache/`**: Redis caching service implementation
- **`logger/`**: Centralized logging module
- **`file-service/`**: File handling utilities
- **`jwt-strategy/`**: JWT authentication strategies and guards
- **`cryto/`**: Cryptographic utilities
- **`utils/`**: General utility functions

#### Cross-Cutting Concerns
- **`exception-filter/`**: Global exception handling
- **`health-check/`**: Application health monitoring

### Import Pattern
The common library uses barrel exports through `index.ts` files, allowing clean imports:
```typescript
import { Entity, Repository, Logger } from '@app/common';
```

## Cross-Cutting Concerns Implementation

### Logging Strategy
- **Framework**: NestJS Logger with Pino integration (`nestjs-pino`)
- **Implementation**: Abstract repository classes include standardized logging
- **Location**: `libs/common/src/logger/`
- **Pattern**: Structured logging with error context and request tracing

### Exception Handling
- **Global Filters**: Centralized exception handling for REST and RPC
- **Location**: `libs/common/src/exception-filter/`
- **Implementation**: 
  - `global-exception.filter.ts` for HTTP exceptions
  - `rpc-exception.filter.ts` for microservice communication exceptions

### Authentication & Authorization
- **Strategy**: JWT-based authentication with role-based access control
- **Implementation**: Multiple JWT strategies:
  - **User Authentication**: `JwtUserVerifierGuard`
  - **Admin Authentication**: `JwtAdminVerifierGuard`  
- **Key Management**: Both symmetric and asymmetric key providers
- **Location**: `libs/common/src/jwt-strategy/`

### Caching
- **Technology**: Redis with NestJS Cache Manager
- **Service**: `RedisCacheService` providing standardized cache operations
- **Features**: Single and bulk operations, TTL support
- **Location**: `libs/common/src/cache/`

### Configuration Management
- **Framework**: NestJS Config with Joi validation
- **Pattern**: Environment-based configuration with schema validation
- **Implementation**: Distributed across individual service modules

### Database Abstraction
- **MongoDB**: Abstract repository pattern with error handling
- **PostgreSQL**: TypeORM integration for relational data
- **Pattern**: Repository pattern with standardized CRUD operations
- **Location**: `libs/common/src/mongodb/` and `libs/common/src/repositories/`

## Application-Level Design Patterns

### Service Architecture Design
All microservices follow a consistent **NestJS Module-Based Architecture** with standardized patterns:

#### Standard Application Structure
Each application implements the following layered architecture:

**1. Presentation Layer**
- **Controllers**: Handle HTTP requests and route to appropriate services
- **DTOs**: Request/response data transfer objects  
- **Decorators**: Custom validation and transformation logic

**2. Business Logic Layer**
- **Services**: Core business logic implementation
- **Providers**: Specialized utility providers for domain-specific operations
- **Modules**: Dependency injection and service orchestration

**3. Data Access Layer**
- **Repositories**: Data persistence abstractions
- **Entities**: Domain model definitions

### Individual Application Designs

#### Model Gateway (`apps/model-gateway/`)
**Purpose**: Primary API gateway for LLM model interactions
**Pattern**: Gateway/Proxy with Provider Strategy

**Internal Structure**:
- **`constants/`**: Service identifiers and configuration
- **`providers/`**: LLM provider implementations (LLM, Embeddings, FIM, Rerank)
- **`services/`**: Business logic (Usage Control, Message Logging, Connection Management)
- **`guards/`**: Request authorization and validation
- **`interceptors/`**: Request/response transformation and logging

**Key Responsibilities**:
- Route requests to appropriate LLM providers
- Implement usage control and rate limiting
- Handle streaming responses and token counting
- Manage LLM connection configurations

#### Authentication Service (`apps/auth-service/`)
**Purpose**: Centralized authentication and OAuth integration
**Pattern**: OAuth Adapter with JWT Token Management

**Internal Structure**:
- **`continue-oauth-adapter/`**: OAuth flow integration for Continue IDE
- **`provider/`**: JWT token generation and validation providers
- **`test/`**: Authentication workflow testing

**Key Responsibilities**:
- OAuth 2.0 flow implementation
- JWT token lifecycle management
- User authentication and session management

#### Configuration Service (`apps/configuration-service/`)
**Purpose**: System configuration and settings management
**Pattern**: Configuration Repository with Event-Driven Updates

**Internal Structure**:
- **`modules/`**: Feature-specific configuration modules
- **`event-listener/`**: Configuration change event handlers
- **`subcribers/`**: Database event subscribers
- **`strategies/`**: Configuration loading strategies
- **`enums/`**: Configuration type definitions

**Key Responsibilities**:
- Manage system-wide configuration settings
- Handle dynamic configuration updates
- Initialize default configurations
- Provide configuration validation

#### Analytics Service (`apps/analytic-service/`)
**Purpose**: Usage analytics and reporting
**Pattern**: Simple Repository with Data Aggregation

**Internal Structure**:
- **`dto/`**: Analytics data transfer objects
- **`interfaces/`**: Analytics contract definitions
- **Repository**: Direct data access for analytics queries

**Key Responsibilities**:
- Collect and aggregate usage statistics
- Generate analytics reports
- Track system performance metrics

#### Continue Proxy (`apps/continue-proxy/`)
**Purpose**: Integration proxy for Continue IDE
**Pattern**: Multi-Controller Proxy with Workspace Management

**Internal Structure**:
- **`strategies/`**: Different proxy handling strategies
- **`services/`**: Proxy business logic
- **`repositories/`**: IDE session and workspace data management
- **Multiple Controllers**: Separate controllers for IDE and workspace interactions

**Key Responsibilities**:
- Proxy requests between Continue IDE and backend services
- Manage IDE workspace sessions
- Handle IDE-specific authentication flows

#### Usage Control (`apps/usage-control/`)
**Purpose**: Rate limiting and usage quota management
**Pattern**: Provider-Based Rate Limiting with Entity Management

**Internal Structure**:
- **`providers/`**: Rate limiting algorithm implementations
- **`entities/`**: Usage tracking domain models
- **`repositories/`**: Usage data persistence

**Key Responsibilities**:
- Implement rate limiting algorithms
- Track usage quotas and limits
- Enforce usage policies

#### Logger Service (`apps/logger-service/`)
**Purpose**: Centralized logging aggregation
**Pattern**: Minimal Logging Aggregator

**Internal Structure**:
- Simple service structure for log aggregation
- Integration with external logging systems

**Key Responsibilities**:
- Aggregate logs from all microservices
- Provide centralized log querying
- Handle log retention and archiving

## Data Infrastructure and External Dependencies

### Database Architecture

#### PostgreSQL Entities (Relational Data)
The system uses PostgreSQL for structured, transactional data with the following entities:

- **`User`**: User account and profile information
- **`Role`**: User role and permission definitions
- **`Team`**: Team/group management and membership
- **`LLM`**: Language model definitions and configurations
- **`LLMConnection`**: LLM provider connection settings
- **`RateLimit`**: Rate limiting rules and quotas
- **`ContinueConfiguration`**: Continue IDE specific configurations
- **`DailyUsageTracking`**: Daily usage metrics and limits

All entities extend `AbstractEntity` providing common fields (id, createdAt, updatedAt).

#### MongoDB Collections (Document Data)
MongoDB is used for analytics and unstructured data:

- **`analytic`**: Usage analytics, logs, and metrics collection

### External Service Integrations

#### HTTP Client Integrations
- **LLM Providers**: External language model APIs (OpenAI, Claude, etc.)
- **OAuth Providers**: Authentication service integrations
- **Continue IDE**: Direct integration with Continue IDE workspace

#### Infrastructure Dependencies
- **Redis**: Session caching, rate limiting, and temporary data storage
- **PostgreSQL**: Primary relational database for application data
- **MongoDB**: Analytics and logging data storage
- **Nginx**: Reverse proxy, SSL termination, and load balancing
- **LiteLLM**: External LLM proxy service for model routing

### Container Architecture
- **Microservice Containers**: Each app runs in isolated Docker containers
- **Database Containers**: Separate containers for PostgreSQL, MongoDB, and Redis
- **Proxy Container**: Nginx reverse proxy for request routing
- **Configuration UI**: Separate frontend application for system management

## Development Workflow

### Essential Development Commands

#### Dependency Management
```bash
# Install dependencies
pnpm install

# Update dependencies  
pnpm update
```

#### Development Server
```bash
# Start all services in development mode
docker-compose up -d

# Start specific service in watch mode
pnpm run start:dev [service-name]

# Start with debugging enabled
pnpm run start:debug [service-name]
```

#### Build & Production
```bash
# Build all applications
pnpm run build

# Build specific application
nest build [app-name]

# Start production with build
./start-prod.sh

# Start production without rebuild
./start-no-build.sh
```

#### Code Quality & Testing
```bash
# Run linting
pnpm run lint

# Format code
pnpm run format

# Type checking
pnpm run type-check
pnpm run type-check:watch

# Run tests
pnpm run test
pnpm run test:watch
pnpm run test:cov

# Run end-to-end tests
pnpm run test:e2e
```

#### Development Environment Setup
1. **Prerequisites**: Docker, Docker Compose, Node.js, pnpm
2. **Environment Configuration**: Copy and configure `.env` files for each service
3. **Database Setup**: Databases auto-initialize via Docker Compose
4. **Service Dependencies**: Start infrastructure services before application services

#### Git Workflow
- **Commit Standards**: Conventional commits with commitlint validation
- **Pre-commit Hooks**: Automated linting and formatting via husky and lint-staged
- **Staged Changes**: `pnpm run precommit` for manual pre-commit validation

### Deployment Architecture
- **Development**: Docker Compose with volume mounts for hot reloading
- **Production**: Docker Compose with built images and optimized configurations
- **Orchestration**: Shell scripts for automated deployment workflows
