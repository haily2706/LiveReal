---
mode: agent
model: Claude Sonnet 4.5
tools: [
    "edit",
    "search",
    "runCommands", 
    "todos"
]
---


# SDLC Workflow Setup

<roleContext>
You are an expert agent responsible for executing the SDLC workflow. Follow the instructions precisely.
</roleContext>

<objectives>
<primary>Configure the agent's workflow by following the setup instructions.</primary>
</objectives>

<importantReminders>
Use your Todo Management tool to track task progress throughout this workflow execution.
</importantReminders>

<executionFlow>
WORKFLOW METHODOLOGY:
1. VALIDATE pre-workflow tasks.
2. EXECUTE workflow phases sequentially.
3. INTEGRATE post-workflow tasks.
</executionFlow>

<preWorkflowTasks>
BEFORE STARTING: Execute these validation and setup tasks in sequence. Stop and report if any task fails.
    <task title="Placeholder"></task>
</preWorkflowTasks>

<phases>
Execute the following phases sequentially. Complete each phase entirely before proceeding to the next.
    <phase number="1" name="Setup Required Files">
        <task id="1.1" title="Setup VS Code Settings">
            If the `.vscode/settings.json` file does not exist, copy `.github/settings.json` to `.vscode/settings.json`.
            Otherwise, merge the settings from `.github/settings.json` into the existing `.vscode/settings.json` file.
        </task>
        <task id="1.2" title="Setup MCP Settings">
            If the `.github/mcp.json` file does not exist, copy `.github/mcp.json` to `.vscode/mcp.json`.
            Otherwise, merge the settings from `.github/mcp.json` into the existing `.vscode/mcp.json` file.
        </task>
    </phase>
    <phase number="2" name="Revise Coding Onboarding Prompt Files">
        <task id="2.1" title="Analyze Project Tech Stack">
            Review the codebase to identify the technology stack, including programming languages, frameworks, and libraries.
        </task>
        <task id="2.2" title="Understand Project Structure and Design">
            Analyze the project structure, design patterns, and code organization to understand cross-cutting concerns.
        </task>
        <task id="2.3" title="Revise Frontend Onboarding Prompt">
            If the project includes frontend code, read `.github/prompts/sdlc.1.onboarding-coding-FE.prompt.md` and revise its content to provide better guidance for the agent.
        </task>
        <task id="2.4" title="Revise Backend Onboarding Prompt">
            If the project includes backend code, read `.github/prompts/sdlc.1.onboarding-coding-BE.prompt.md` and revise its content to provide better guidance for the agent.
        </task>
    </phase>
    <phase number="3" name="Revise Unit Testing Onboarding Prompt Files">
        <task id="3.1" title="Analyze Testing Framework">
            Explore the project's testing structure and identify the frameworks in use.
        </task>
        <task id="3.2" title="Revise Testing Onboarding Prompt">
            If the project has tests, read `.github/prompts/sdlc.1.onboarding-testing.prompt.md` and revise its content to provide better guidance for the agent.
        </task>
    </phase>
    <phase number="4" name="Revise File Filter Patterns">
        <task id="4.1" title="Update Coding File Filter">
         Update the Git filter to include only the coding file extensions used in the project. Exclude test files where applicable in the following files:
            - `.github/prompts/reflections/sdlc.3.implementation-coding-quality.reflection.md`
            - `.github/prompts/sdlc.4a.plan-code-review-coding.prompt.md`
            - `.github/prompts/sdlc.5a.plan-unit-test.prompt.md`
            - `.github/prompts/sdlc.6.create-pull-request.prompt.md`
            - `.github/prompts/reflections/sdlc.7.coding-quality.reflection.md`
        </task>
        <task id="4.2" title="Update Testing File Filter">
         Update the Git filter to include only the testing file extensions used in the project. Exclude coding files where applicable in the following files:
            - `.github/prompts/sdlc.4a.plan-code-review-testing.prompt.md`
            - `.github/prompts/reflections/sdlc.5.implementation-testing-quality.reflection.md`
            - `.github/prompts/reflections/sdlc.7.coding-quality.reflection.md`
        </task>
    </phase>
</phases>

<postWorkflowTasks>
AFTER COMPLETING ALL PHASES: Execute the following tasks:
    <task title="Execute Reflection Workflow">
        READ and FOLLOW the `.github/prompts/reflections/sdlc.workflow-setup-reflection` workflow.
    </task>
</postWorkflowTasks>

<constraints>
ABSOLUTE RESTRICTIONS: Never violate these rules.
- Never limit pattern discovery; scan the entire codebase.
- Document all discovered patterns.
- Ensure correct filters are applied for coding and testing files respectively.
- Never modify core system files during analysis.
</constraints>

<executionInstructions>
<command>EXECUTE NOW: Begin autonomous execution of all tasks, following the methodology above.</command>
<autonomyLevel>Full autonomous execution with high-level progress reporting only.</autonomyLevel>
</executionInstructions>
