<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Code Quality Is a Release Gate
- Template principle 2 -> II. Tests Define Expected Behavior
- Template principle 3 -> III. User Experience Stays Consistent
- Template principle 4 -> IV. Performance Budgets Are Explicit
Added sections:
- Product & Performance Standards
- Development Workflow & Review Gates
Removed sections:
- Template principle 5 placeholder
Templates requiring updates:
- Updated .specify/templates/plan-template.md
- Updated .specify/templates/spec-template.md
- Updated .specify/templates/tasks-template.md
- Checked .specify/templates/commands/*.md (directory absent; no update required)
Runtime guidance requiring updates:
- Checked AGENTS.md (already delegates to current plan; no principle reference changed)
Follow-up TODOs: none
-->

# Easy Waiter Constitution

## Core Principles

### I. Code Quality Is a Release Gate
Production code MUST be simple, readable, cohesive, and consistent with the
existing architecture. Changes MUST keep ownership boundaries clear, avoid
duplicated business logic, and use established project patterns before adding
new abstractions. Linting, formatting, static checks, and code review findings
that affect correctness, maintainability, security, or operability MUST be
resolved before release.

Rationale: sustainable delivery depends on code that future contributors can
understand, test, and change without hidden coupling or avoidable rewrites.

### II. Tests Define Expected Behavior
Every feature MUST include automated tests for its acceptance scenarios,
business rules, and regressions introduced or fixed by the change. Tests MUST
be planned before implementation, mapped to user stories or requirements, and
run successfully before a change is considered complete. Test suites SHOULD use
the smallest reliable scope, but integration or end-to-end tests are REQUIRED
when behavior crosses module, service, persistence, or user-interface
boundaries.

Rationale: tests are the executable contract for expected behavior and the
primary protection against regressions during future changes.

### III. User Experience Stays Consistent
User-facing changes MUST preserve the product's established interaction
patterns, visual hierarchy, language, accessibility expectations, and error
handling conventions. New screens, flows, and states MUST specify loading,
empty, validation, success, and failure behavior when applicable. A feature is
not complete until its primary user journeys are independently verifiable and
do not degrade existing journeys.

Rationale: consistent experience reduces user confusion and keeps the product
usable as features evolve.

### IV. Performance Budgets Are Explicit
Every feature plan MUST define measurable performance expectations or state why
no new performance budget is applicable. Changes that affect startup time,
request latency, rendering responsiveness, memory use, data volume, or
background work MUST include validation tasks and MUST not exceed agreed
budgets without documented approval. Performance fixes MUST include a
reproducible before-and-after measurement.

Rationale: performance is a product requirement, not an afterthought, and it
must be measurable to be managed.

## Product & Performance Standards

Specifications MUST define user value, acceptance scenarios, measurable
success criteria, relevant accessibility expectations, and performance budgets
in product terms before implementation planning begins. Requirements MUST be
testable and traceable to user stories or explicit system constraints.

Implementation plans MUST record the selected architecture, quality checks,
test strategy, user-experience risks, and performance validation approach. Any
intentional tradeoff against a principle MUST be documented in the plan's
complexity tracking section with the simpler alternative considered.

## Development Workflow & Review Gates

Work MUST proceed in independently testable user-story increments. Each
increment MUST include implementation, tests, and validation evidence before
the next dependent increment is treated as complete. Shared foundations MAY be
built first only when they unblock multiple stories and have their own checks.

Reviews MUST verify code quality, test coverage, user-experience consistency,
and performance impact. Releases MUST not proceed while required checks are
failing, acceptance scenarios are unverified, or principle violations are
undocumented.

## Governance

This constitution supersedes conflicting process guidance in this repository.
All feature specifications, plans, task lists, reviews, and release decisions
MUST comply with these principles.

Amendments require a documented change to this file, a Sync Impact Report, and
updates to affected templates or runtime guidance in the same change. Version
changes follow semantic versioning:

- MAJOR: backward-incompatible principle removals or redefinitions.
- MINOR: new principles, sections, or materially expanded governance.
- PATCH: clarifications, wording changes, or non-semantic corrections.

Compliance MUST be checked during planning, task generation, implementation
review, and release readiness. Any approved exception MUST identify the
principle affected, reason for the exception, mitigation, owner, and review
date.

**Version**: 1.0.0 | **Ratified**: 2026-05-24 | **Last Amended**: 2026-05-24
