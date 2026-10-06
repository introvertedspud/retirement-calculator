# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-10-06

### Breaking Changes

- **`averageAnnualInterestRate` is now the time-weighted annual return (TWR)** of the investment strategy itself — independent of contribution timing. The prior formula (`totalInterest / years / (initialBalance + totalContributions)`) was not a real return metric and was not validly comparable to market benchmarks. Code that used this field as if it were the strategy's actual return will now get the correct number.

- **`effectiveAnnualReturn` is removed.** It was `(finalBalance / initialBalance)^(1/years) - 1`, which is dominated by the size of the starting balance rather than by returns: the same $500/month plan at 8% reported 4.87% from a $0 start, 56.98% from $1 and 16% from $10,000. The glidepath result now has **`moneyWeightedAnnualReturn`** (internal rate of return) instead. The constant-rate result reports only `averageAnnualInterestRate`, because the two are identical when the rate never changes.
- **Contribution scheduling is rewritten, and results change whenever `contributionFrequency` and `compoundingFrequency` differ.** See "Fixed" below. In the constant-rate method, results for equal frequencies and for yearly or quarterly contributions with monthly compounding are unchanged. In the glidepath, results are unchanged only when `compoundingFrequency` is 12 (the default) and `contributionFrequency` is 12 or lower; any other `compoundingFrequency`, including equal pairs such as 1/1 or 4/4, now gives different numbers.
- **`balanceFromInterest` no longer includes the initial balance.** It now equals `interestTotal`, so `balance = initialBalance + balanceFromContributions + balanceFromInterest`.
- **Stricter validation.** These now throw:
  - Fractional `contributionFrequency` or `compoundingFrequency` (e.g. `365.25`).
  - Glidepath returns below -99% (they previously produced `NaN`).
  - A nominal interest rate of -100% or worse per compounding period.
  - A negative `yearlyWithdrawalRate` in `getYearlyWithdrawalAmountByBalance`.
  - An `inflationRate` of -100% or below (it previously produced `Infinity`).
  - `getContributionNeededForDesiredBalance` when no contribution falls due before the end (for example yearly contributions over half a year) and the starting balance alone falls short. It previously returned a number.

### Why

The previous formula divided total interest earned by the nominal sum of dollars invested, treating each dollar as if it had been deposited at time zero. This systematically understated the strategy's actual return — sometimes dramatically. The v1.2.0 CHANGELOG and README invited users to compare the value against the S&P 500. The formula did not support that comparison.

The new metric is the annualized geometric mean of the period-by-period returns. For constant-rate strategies this reduces to the closed-form effective annual yield. For glidepath strategies it is the time-weighted average of the return path. Either way, it answers: "if I'd held this strategy over this window, what was the annual return?"

### Migration

`averageAnnualInterestRate` values change for any scenario with contributions. Common impacts:

| Scenario | Old value | New value |
|---|---|---|
| Traditional `getCompoundInterestWithAdditionalContributions(10k, 1k, 10y, 8%, monthly)` | ~5.6% | ~8.30% (EAR of 8% APR) |
| Glidepath `getCompoundInterestWithGlidepath(...)` with 10%→5.5% over 40y, monthly contribs | ~4-5% | ~7-8% (time-weighted avg) |
| Any scenario with no contributions | unchanged (already correct) | unchanged |

The new number is what most users actually want: "what return did my investments earn over this period?". It is the metric that compares meaningfully to the S&P 500 over the same window.

**`effectiveAnnualReturn` is gone.** Read `moneyWeightedAnnualReturn` on glidepath results, or `averageAnnualInterestRate` on constant-rate results (the two are the same number there). If you need total account growth including deposits, compute it from `balance` and `totalContributions`.

#### What you need to do

If your code surfaces `averageAnnualInterestRate` to users as "investment return" or compares it to benchmarks, no code change is needed — the numbers just become honest. Worth noting that displayed numbers will jump up for typical retirement scenarios.

If your code asserts on specific `averageAnnualInterestRate` values in tests, update the expected values. The new formula:
- For constant-rate methods: `Math.pow(1 + interestRate / compoundingFrequency, compoundingFrequency) - 1`
- For glidepath: annualized geometric mean of `monthlyTimeline[i].currentMonthlyReturn`

### Fixed

- **Contributing more often than compounding lost almost all the money.** Weekly contributions of $100 with monthly compounding deposited $46.15 in a year instead of $5,200; monthly contributions with yearly compounding deposited nothing for the first 11 years. Every combination of whole-number frequencies now deposits exactly `contributionFrequency` contributions a year.
- **Contribution drift with daily compounding.** Monthly contributions with daily compounding made 121 deposits in 10 years instead of 120.
- **`getContributionNeededForDesiredBalance` missed the target when frequencies differed** (97.1% of target for yearly contributions with monthly compounding, and 13 months of contributions a year for weekly with monthly). It now solves against the simulator, so feeding the result back into `getCompoundInterestWithAdditionalContributions` reproduces the target for any frequencies. It throws if no contribution would be credited within the period.
- **Glidepath `compoundingFrequency` corrupted the contribution schedule** for any value other than 12 (yearly/yearly deposited 12× too much; monthly/daily deposited nothing in the first year). It now controls how often accrued interest is credited to the balance; see the README.
- **Fractional `years` were truncated to whole compounding periods** in the constant-rate method (10.5 years with yearly compounding ran 10 periods). The remainder now runs as a final partial period earning simple interest, and `aggregateDataByYear` reports it as a final row.
- **`aggregateDataByYear` threw a `TypeError`** for a fractional compounding frequency. Such frequencies are now rejected up front.
- README's "Three glidepath modes" claim was incorrect — there are four (`stepped-return` was missing). The README and JSDoc are now accurate.

### Added

- `moneyWeightedAnnualReturn` on the glidepath result.
- README section "How rates and frequencies are interpreted", documenting that the constant-rate method takes a nominal rate (APR) and the glidepath method takes an effective annual return.

### Changed

- JSDoc on `averageAnnualInterestRate` and `moneyWeightedAnnualReturn` describes what each computes and when each is the right choice.

---

## [2.1.0] - 2026-05-19

_Not published to npm on its own; these changes ship as part of 3.0.0._

### Added

- **Strict Input Validation**: All public methods now reject `NaN`, `Infinity`, and `-Infinity` with descriptive errors (e.g. `"initialBalance must be a finite number (got NaN)"`). Previously these values silently propagated through `< 0` guards and produced `NaN` results.
- **`getContributionNeededForDesiredBalance` Validation**: This method previously had zero input validation. Now matches the other public methods (rejects negative `startingBalance`/`desiredBalance`, non-positive `years` and frequencies, non-finite rates).
- **Glidepath Config Validation**: `GLIDEPATH_VALIDATION` constants are now wired into the glidepath entry path. Equity weights outside `[0, 1]` throw; waypoint ages must be positive and values must be finite; stepped-return configs require `declineStartAge <= terminalAge`.
- **Regression Guard**: Added direct test asserting `effectiveAnnualReturn` is finite on zero-initial-balance scenarios (locks in the v1.1.1 fix).

### Changed

- **Error Message Format**: Errors now include the parameter name and offending value, e.g. `"initialBalance must be non-negative (got -1000)"`. Callers asserting on exact pre-existing error strings will need to update assertions to match the new format.
- **`getDesiredBalanceByYearlySpend(_, 0)`**: Now throws instead of returning `Infinity`.
- **Custom-waypoints `valueType: 'equityWeight'` defaults reconciled**: When `equityReturn`/`bondReturn` are omitted, the calculator now uses `GLIDEPATH_DEFAULTS.ALLOCATION_BASED` (`0.12` equity / `0.04` bond), matching allocation-based mode. Previously used orphaned `0.10` / `0.04`.

### Fixed

- **Tarball Hygiene**: Published tarball no longer ships test specs, examples, source maps, or the v2.0.0-deleted `DynamicGlidepathErrors.*` artifacts. Build now scoped via a new `tsconfig.build.json` and prefixed with a `clean` step. Tarball impact: **81 kB → 21 kB packed, 474 kB → 99 kB unpacked, 48 → 11 files**.
- **JSDoc Typo**: `DynamicGlidepathResult` `@example` referenced a non-existent method `getCompoundInterestWithDynamicGlidepath` (correct name is `getCompoundInterestWithGlidepath`). This was surfacing on the published TypeDoc site.
- **Stale Type Aliases**: Removed 9 unused error type aliases (`RetirementCalculatorError`, `InvalidAgeRangeError`, etc.) left behind by the v2.0.0 error-class deletion.

### Migration

Most callers will be unaffected. Two situations require code changes:

1. **Callers passing `NaN`/`Infinity` and depending on `NaN` results** (or not handling the resulting `NaN` propagation): these calls now throw. Validate inputs upstream.
2. **Callers asserting on exact error message strings**: update to substring matches that don't depend on the surrounding text. The new format is `"<paramName> must be <constraint> (got <value>)"`.

Two narrower edge cases:
- `getDesiredBalanceByYearlySpend(spend, 0)` now throws instead of returning `Infinity`.
- Custom-waypoints configs with `valueType: 'equityWeight'` that omit `equityReturn`/`bondReturn` will now blend with `0.12`/`0.04` instead of `0.10`/`0.04`. To preserve the prior numbers, pass the values explicitly.

---

## [2.0.0] - 2025-12-12

### Breaking Changes

- **Removed Error Infrastructure**: Deleted `DynamicGlidepathErrors.ts` and `GLIDEPATH_ERROR_MESSAGES` constant. The error classes were not being used and added ~900 lines of dead code. Standard JavaScript errors are thrown instead.

### Added

- **Input Validation**: `getCompoundInterestWithAdditionalContributions` now validates inputs and throws descriptive errors for negative balances, negative contributions, non-positive years, and non-positive frequencies
- **Return Metrics Helper**: Extracted duplicated return metrics calculation into private `calculateReturnMetrics` method
- **Waypoint Normalization**: Added `normalizeGlidepathConfig` to pre-sort custom waypoints once instead of on every iteration (performance improvement for 40-year simulations)

### Fixed

- **Package Configuration**: Changed `prepublish` to `prepublishOnly`, added `engines` and `sideEffects` fields
- **Build Configuration**: Removed `examples/**/*` from tsconfig.json includes

### Changed

- **README**: Rewritten for clarity and brevity
- **Examples**: Updated all example files with clearer explanations

---

## [1.2.0] - 2025-11-27

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

## [1.1.1] - 2025-11-22

### Fixed

- Fixed `effectiveAnnualReturn` returning `Infinity` when `initialBalance` is 0

---

## [1.1.0] - 2025-08-22

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
