# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-11-22

### Added

- **Dual Return Metrics**: Both calculator methods now return two distinct metrics:
  - `effectiveAnnualReturn`: Overall account growth rate (includes contributions + investment returns)
  - `averageAnnualInterestRate`: Investment performance isolated from contribution growth

### Fixed

- **Infinity Bug**: `effectiveAnnualReturn` no longer returns `Infinity` when `initialBalance` is 0
- **Misleading Returns**: When investment returns are 0%, `effectiveAnnualReturn` now correctly shows 0% instead of a misleading percentage based on contribution growth
- **Threshold Removal**: Removed unnecessary threshold check that incorrectly treated tiny interest amounts (< $0.01) as zero

### Changed

- Updated README with metric explanations and migration guide
- Updated all examples to demonstrate both return metrics

### Breaking Changes

**Affected Types:**
- `CompoundingInterestObjectType` (returned by `getCompoundInterestWithAdditionalContributions`)
- `DynamicGlidepathResult` (returned by `getCompoundInterestWithGlidepath`)

**New Required Fields:**
```typescript
{
  effectiveAnnualReturn: number;      // Account growth rate
  averageAnnualInterestRate: number;  // Investment performance only
}
```

### Migration Guide

#### TypeScript Users

If you're consuming these return types in TypeScript, you'll need to handle the new fields:

```typescript
// Before (v1.1.x)
const result = calculator.getCompoundInterestWithAdditionalContributions(...);
console.log(result.balance);
console.log(result.totalInterestEarned);

// After (v1.2.0)
const result = calculator.getCompoundInterestWithAdditionalContributions(...);
console.log(result.balance);
console.log(result.totalInterestEarned);
console.log(result.effectiveAnnualReturn);      // NEW - account growth rate
console.log(result.averageAnnualInterestRate);  // NEW - investment returns only
```

#### JavaScript Users

No changes required. The new fields are automatically available:

```javascript
const result = calculator.getCompoundInterestWithAdditionalContributions(...);

// These new fields are now available
console.log(`Account growth: ${(result.effectiveAnnualReturn * 100).toFixed(2)}%`);
console.log(`Investment return: ${(result.averageAnnualInterestRate * 100).toFixed(2)}%`);
```

#### Understanding the Two Metrics

| Metric | What It Measures | When to Use |
|--------|------------------|-------------|
| `effectiveAnnualReturn` | Total account growth including contributions | Showing overall portfolio growth |
| `averageAnnualInterestRate` | Investment returns only | Comparing against market benchmarks |

**Example:**
With $10,000 initial balance, $1,000/month contributions, 8% market returns over 10 years:
- `effectiveAnnualReturn`: ~35% (includes contribution growth)
- `averageAnnualInterestRate`: ~5.6% (actual investment performance)

The second metric is closer to what you'd compare against market benchmarks like the S&P 500.

---

## [1.1.1] - 2024-11-22

### Fixed

- Fixed `effectiveAnnualReturn` returning `Infinity` when `initialBalance` is 0

---

## [1.1.0] - 2024-08-22

### Added

- Dynamic glidepath calculations with age-aware return strategies
- Four glidepath modes: fixed-return, stepped-return, allocation-based, custom-waypoints
- Monthly timeline data for detailed analysis and visualization
- Contribution timing options (start or end of period)
- Comprehensive error handling with detailed error types
- GLIDEPATH_PRESETS for common strategies (Money Guy Show, Bogleheads)

### Changed

- Enhanced examples with advanced dynamic investment strategies
- Improved test coverage to 98%+

---

## [1.0.0] - Initial Release

### Added

- Core retirement calculator functionality
- Compound interest calculations with additional contributions
- Contribution needed calculations for desired balance
- Inflation adjustment utilities
- Withdrawal amount calculations
- Yearly data aggregation
