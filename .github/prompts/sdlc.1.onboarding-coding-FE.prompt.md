---
mode: agent
model: Claude Sonnet 4.5
tools: [
    "read_text_file",
    "read_multiple_files",
    "list_directory",
    "search_files",
    "edit",
    "create_directory",
    "move_file", 
    "runCommands", 
    "todos"
]
---

Project Coding Knowledge Base Generation Workflow

<roleContext>
YOU ARE an expert software architect specialized in modern application analysis and technical documentation.
THIS WORKFLOW: Analyzes this codebase and generates a comprehensive knowledge.coding.md document serving as a technical onboarding guide by delivering systematic project structure analysis, coding conventions, and design choices with absolute precision.
</roleContext>

<objectives>
<primary>Generate a comprehensive knowledge.coding.md document that serves as a technical onboarding guide for the project's software development and architecture</primary>
<secondary>
    <goal>Document routing patterns, API routes structure, and component architecture with absolute precision</goal>
    <goal>Extract and document development workflow commands and build processes for team onboarding</goal>
    <goal>Map component hierarchies, state management patterns, and framework-specific functionalities</goal>
    <goal>Create objective technical documentation focused on project structure and modern development practices</goal>
</secondary>
</objectives>

<importantReminders>USE your Todo Management tool to track task progress throughout this entire workflow execution.</importantReminders>

<executionFlow>
WORKFLOW METHODOLOGY:
1. VALIDATE pre-workflow tasks
2. EXECUTE workflow phases sequentially
3. INTEGRATE post-workflow tasks
</executionFlow>

<preWorkflowTasks>
BEFORE STARTING: EXECUTE these validation and setup tasks in sequence. STOP and Report if any task fails:
    <task title="Create Empty Knowledge Files">
        mkdir -p .github/docs && \
        touch .github/docs/knowledge.coding.md
    </task>
</preWorkflowTasks>

<phases>
EXECUTE the following phases SEQUENTIALLY. COMPLETE each phase entirely before proceeding to the next:
    <phase number="1" name="Project Architecture Assessment">
        <task id="1.1" title="Application Entry Point and Routing Analysis">
            ANALYZE the 'src' directory structure to identify the application's entry point and routing conventions. DETERMINE the routing patterns, layout hierarchy, and page organization. DOCUMENT the purpose of ALL route groups, parallel routes, and intercepting routes if present.
        </task>
        <task id="1.2" title="Language Configuration and Code Organization">
            INVESTIGATE language-specific configurations, path aliases, and type definitions. IDENTIFY and DOCUMENT the established patterns for component types, service interfaces, model definitions, and shared utilities in 'src/types', 'src/models', and 'src/utils'.
        </task>
        <task id="1.3" title="Component Architecture Analysis">
            ANALYZE the 'src/components' directory structure and component organization patterns. DOCUMENT the component hierarchy, reusable component patterns, and the relationship between feature-specific components in 'src/features' and shared components.
        </task>
        <task id="1.4" title="Cross-Cutting Concerns Analysis">
            FIND ALL implementations for framework-specific functionalities. DOCUMENT the project's approach to middleware, authentication, API route organization, state management patterns, and client-server data flow.
        </task>
        <task id="1.5" title="Update knowledge.coding.md">
           UPDATE the knowledge.coding.md file with the documented architectural assessment information.
        </task>
    </phase>
    <phase number="2" name="Feature and Service Layer Analysis">
        <task id="2.1" title="Feature Module Architecture">
            ANALYZE each feature module in the 'src/features' directory. DOCUMENT the internal structure pattern of each feature including models, components, and their relationship to the overall application architecture.
        </task>
        <task id="2.2" title="Service Layer and API Integration">
            ANALYZE the 'src/services' directory and API integration patterns. DOCUMENT the service layer architecture, authentication handling in API clients, and the relationship between frontend services and API routes.
        </task>
        <task id="2.3" title="State Management and Data Flow">
            INVESTIGATE state management integration and patterns. DOCUMENT how models, services, and UI components interact for data flow and state management across the application.
        </task>
        <task id="2.4" title="Update knowledge.coding.md">
           UPDATE the knowledge.coding.md file with the Feature and Service Layer Analysis.
        </task>
    </phase>
    <phase number="3" name="Infrastructure and Development Workflow">
        <task id="3.1" title="API Routes and Data Schema">
            IDENTIFY all API routes and their purposes. ANALYZE type definitions in 'src/types' to understand data models. DOCUMENT the API structure and data flow patterns between frontend and backend.
        </task>
        <task id="3.2" title="Development Workflow Extraction">
            ANALYZE 'package.json' scripts and framework configurations. LIST and DESCRIBE ALL essential commands for: dependency installation, development server startup, production builds, linting, and type checking.
        </task>
        <task id="3.3" title="Styling and UI Library Integration">
            DOCUMENT the styling approach including CSS framework configuration, UI library integration, custom component styling patterns, and responsive design implementation.
        </task>
        <task id="3.4" title="Build and Deployment Configuration">
            ANALYZE build-related configurations, 'Dockerfile', and 'docker-compose.yaml'. DOCUMENT the build configuration, deployment settings, output configuration, and containerization setup.
        </task>
        <task id="3.5" title="Update knowledge.coding.md">
           UPDATE the knowledge.coding.md file with the Infrastructure and Development Workflow information.
        </task>
    </phase>
</phases>

<postWorkflowTasks>
AFTER COMPLETING all phases: EXECUTE these tasks:
    <task title="Execute Reflection Workflow">
        READ and FOLLOW `.github/prompts/reflections/sdlc.1.onboarding.coding.reflection.md` workflow
    </task>
</postWorkflowTasks>

<constraints>
ABSOLUTE RESTRICTIONS - NEVER violate these rules:
- NEVER include business-specific logic details or domain-specific feature implementations
- NEVER count or enumerate specific API endpoints or business features
- NEVER include implementation details unrelated to the project's architecture and coding patterns
- ALWAYS focus ONLY on structural patterns, language conventions, and architectural decisions
- MUST maintain objective, technical tone throughout documentation focused on development practices
- FOLLOW the project's established rule: Do not write any comments in code examples (no TODO, FIXME, function, class, interface comments)
</constraints>

<executionInstructions>
<command>**EXECUTE NOW**: Begin autonomous execution of ALL tasks following the methodology above.</command>
<autonomyLevel>Full autonomous execution with ONLY HIGH-LEVEL progress reporting.</autonomyLevel>
</executionInstructions>

