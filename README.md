# Retirement Calculator

A TypeScript library for retirement financial calculations.

## Installation

```bash
npm i retirement-calculator
```

## What it does

- Calculate contributions needed to reach a target balance
- Project compound interest with regular contributions
- Model age-based return strategies (glidepaths)
- Account for inflation impact on future balances

## Quick Start

```typescript
import { RetirementCalculator } from 'retirement-calculator';

const calculator = new RetirementCalculator();

// Basic compound interest with monthly contributions
const result = calculator.getCompoundInterestWithAdditionalContributions(
  10000,  // starting balance
  500,    // monthly contribution
  30,     // years
  0.08,   // 8% annual return
  12,     // contribution frequency (monthly)
  12      // compounding frequency (monthly)
);

console.log(`Final balance: $${result.balance.toFixed(2)}`);
console.log(`Total contributions: $${result.totalContributions.toFixed(2)}`);
console.log(`Interest earned: $${result.totalInterestEarned.toFixed(2)}`);
```

## Dynamic Glidepath Calculations

Model changing investment strategies over time, like target-date funds.

```typescript
const result = calculator.getCompoundInterestWithGlidepath(
  25000,  // starting balance
  1000,   // monthly contribution
  25,     // starting age
  65,     // retirement age
  {
    mode: 'fixed-return',
    startReturn: 0.10,  // 10% at age 25
    endReturn: 0.055    // 5.5% at age 65
  }
);

console.log(`Final balance: $${result.finalBalance}`);
```

Four glidepath modes available:
- **fixed-return**: Linear decline from aggressive to conservative returns
- **stepped-return**: Hold a base return, then linear decline to a terminal return (e.g. the Money Guy Show methodology)
- **allocation-based**: Equity/bond blending like target-date funds
- **custom-waypoints**: User-defined age/return or age/allocation targets

## Return Metrics

Every calculation result includes two return metrics that answer different questions:

| Metric | Question it answers | Typical use |
|---|---|---|
| `averageAnnualInterestRate` | "What was the time-weighted return of the *strategy* itself?" | Compare against benchmarks (e.g. the S&P 500 over the same window) |
| `effectiveAnnualReturn` | "At what annual rate did my *account* grow?" | Show total account growth including the effect of contributions |

`averageAnnualInterestRate` is computed as the annualized geometric mean of period-by-period returns (time-weighted return, TWR). It does not depend on how much you contributed or when — it's purely the strategy's investment performance.

`effectiveAnnualReturn` is `(finalBalance / initialBalance) ^ (1/years) - 1`. With significant contributions it will be much higher than `averageAnnualInterestRate` — that's expected, because your account grew partly from new deposits, not just from investment returns.

**Example:** $10k initial + $1k/month + 8% annual return + 10 years:
- `averageAnnualInterestRate` ≈ **8.30%** — the strategy's actual annual yield (8% APR compounded monthly)
- `effectiveAnnualReturn` ≈ **35%** — the rate at which your account grew, dominated by your contributions

> **v3.0.0 note:** Prior versions used a different formula for `averageAnnualInterestRate` that included contribution effects and was not directly comparable to benchmarks. See [CHANGELOG.md](CHANGELOG.md#300---2026-05-19) for migration details.

## Examples

See the [examples](examples/) directory for complete scenarios:

- [basic-retirement-gap-analysis.ts](examples/basic-retirement-gap-analysis.ts) - Goal-based planning
- [lifestyle-based-retirement-planning.ts](examples/lifestyle-based-retirement-planning.ts) - Spending-based planning
- [advanced-dynamic-investment-strategies.ts](examples/advanced-dynamic-investment-strategies.ts) - Glidepath strategies

Run any example:
```bash
npx ts-node examples/basic-retirement-gap-analysis.ts
```

## See it in Action

This package powers the calculators at [Common Cents Academy](https://commoncentsacademy.com). Try them out to see what's possible.

## Documentation

- [API Documentation](https://introvertedspud.github.io/retirement-calculator/) - Full method reference (TypeDoc)
- [CHANGELOG](CHANGELOG.md) - Version history and migration guides

## Limitations

- Assumes steady returns (real markets fluctuate)
- No Monte Carlo simulation yet
- No tax modeling

## License

MIT
