---
title: Task Orchestration and Cost Optimization
activation: always_on
priority: high
---

# Agent Orchestration Guidelines

This project strictly follows cost optimization and efficient resource management for AI agents. All agents MUST adhere to the following rules when assigning tasks or spawning subagents.

## 1. Subagent Model Selection
- Do NOT default to using the 'pro' model for all subagents.
- For simple tasks such as codebase research, file reading, log analysis, or web searching, ALWAYS invoke subagents with the `flash` or `flash_lite` model.
- Reserve the `pro` model exclusively for complex tasks like architectural design, deep reasoning, or large-scale refactoring.

## 2. Subagent Reuse
- Before invoking a new subagent, check if there is an existing idle subagent capable of handling the task.
- Use the `send_message` tool to assign new tasks to existing subagents rather than creating a new conversation context, which incurs additional initialization overhead.

## 3. Resource Cleanup
- When a subagent or background task is no longer needed and its purpose has been fulfilled, immediately terminate it using the `manage_subagents` (kill) or `manage_task` (kill) tools to free up resources.

## 4. Workspace Management
- When invoking subagents, default to `Workspace: 'inherit'` or `'share'` unless an isolated branch is strictly necessary for destructive testing. Avoid unnecessary workspace branching.
