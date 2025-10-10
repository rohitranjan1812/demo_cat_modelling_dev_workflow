# Strategic Action Plan: Testing and Integration

## Objective
Deliver a seamlessly integrated, efficient simulation tool via deep testing, documentation, and targeted hardening.

## Phases

1) Foundation (Week 1)
- Finalize testing strategy (this repo)
- Wire test infra: Jest, mongodb-memory-server, fast-check
- Add critical unit tests for engine invariants

2) Schema & Data Integrity (Week 1-2)
- Add model tests for SimulationRun, SimulationEvent, Exposure, Hazard, Vulnerability
- Backfill fixtures/factories; ensure required fields and enums enforced

3) Integration (Week 2)
- In-memory MongoDB integration tests for startSimulation -> results saved
- Seed minimal data programmatically; verify no NaN, enums valid, lossRatio <= 1

4) Property-based/Fuzz (Week 2-3)
- fast-check across bounding boxes, intensities, hazard types
- Detect intermittent or rare failures; add guards or fixes

5) Performance & Stability (Week 3)
- Add batch run harness; record time/memory
- Establish baseline thresholds; configure CI gating

6) Documentation & Reporting (Continuous)
- Update SIMULATION_SUCCESS_REPORT.md after each milestone
- Publish test coverage summaries and known gaps

## Deliverables
- TESTING_STRATEGY.md (this)
- ACTION_PLAN_TESTING.md (this)
- New test suites under tests/
- Utilities for factories/fixtures and integration seeds
- CI job to run layers with clear output

## Risk & Mitigation
- Complex schemas -> start with minimal required fields; add factories
- Flaky randomness -> seed PRNG for deterministic tests; keep a small set of randomized runs for smoke

## Acceptance Criteria
- Green unit+schema tests; integration assertions passing consistently
- No NaN coordinates in any generated impact
- All enums valid; loss ratios in [0,1]
- SimulationRun results persisted and readable in UI
