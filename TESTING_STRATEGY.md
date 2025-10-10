# Comprehensive Testing Strategy

This strategy establishes a multi-layer test approach to reach high confidence and support 100,000s of cases through automation and generation.

## Goals
- Prevent regressions on critical simulation invariants (no NaN, valid enums, ratios in [0,1])
- Validate model schemas and constraints early
- Verify engine-service-model integration using in-memory MongoDB
- Establish property-based and fuzzing coverage for edge cases
- Track performance/footprint with repeatable load tests

## Layers

1) Unit tests
- CATSimulationEngine: probability distribution enum, bounds-safe location, geographic impact has no NaN, lossRatio <= 1
- Utility/math functions: distributions generate finite values

2) Model/schema tests
- Exposure: ID generation, getExposuresInRadius stability (no NaN bounds), required fields
- SimulationRun: results shape saved as Map/Number fields

3) Integration (in-memory MongoDB)
- Seed minimal Accounts/Exposures and run startSimulation()
- Assert SimulationRun completes with >0 events and valid results

4) Property-based tests (fast-check)
- Random bounding boxes and hazard types; assert invariants hold
- Random intensities; assert probabilities in [0,1]

5) Performance/load (separate harness)
- Batch simulate runs and capture duration/memory; baseline thresholds for CI

## Tooling
- Jest for test runner
- mongodb-memory-server for integration tests
- fast-check for property-based tests

## CI Gates (phased)
- Phase 1: Unit + schema must pass
- Phase 2: Integration must pass (in-memory)
- Phase 3: Property-based (bounded time)
- Phase 4: Performance smoke thresholds

## Reporting
- Jest verbose output and optional coverage
- Store integration logs in tests/output
