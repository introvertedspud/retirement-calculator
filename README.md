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

| Metric | Available on | Question it answers |
|---|---|---|
| `averageAnnualInterestRate` | both methods | "What did the *strategy* return?" Compare this against benchmarks such as the S&P 500 over the same window. |
| `moneyWeightedAnnualReturn` | glidepath only | "What return did *my dollars* actually earn?" |

`averageAnnualInterestRate` is the time-weighted return (TWR): the annualized geometric mean of the period-by-period returns. It does not depend on how much you contributed or when.

`moneyWeightedAnnualReturn` is the internal rate of return (IRR): the single annual rate that grows every deposit, from the date it was made, to the final balance. It weights each period by how much money was invested during it.

The two are equal whenever the return never changes, which is why the constant-rate method reports only one. On a glidepath they differ, because most of the money is invested during the later, lower-return years.

**Example:** $25k initial + $1k/month from age 25 to 65 on a 10% → 5.5% glidepath:
- `averageAnnualInterestRate` ≈ **7.75%** — the return of the strategy itself
- `moneyWeightedAnnualReturn` ≈ **7.38%** — what the invested dollars earned, on average

> **v3.0.0 note:** `averageAnnualInterestRate` changed meaning and `effectiveAnnualReturn` was replaced by `moneyWeightedAnnualReturn`. See [CHANGELOG.md](CHANGELOG.md#300---2026-10-06) for migration details.

## How rates and frequencies are interpreted

The two calculation methods read the rate you pass differently:

| Method | Rate is treated as | 8% means |
|---|---|---|
| `getCompoundInterestWithAdditionalContributions` | a nominal annual rate (APR) | `8% / compoundingFrequency` per period — 8.30% a year with monthly compounding |
| `getCompoundInterestWithGlidepath` | an effective annual return | exactly 8% growth a year |

So the same inputs give different balances: $10k + $500/month for 30 years at 8% is about $859,505 from the first method and $809,433 from the second.

Contribution and compounding frequencies are whole numbers of events per year and can be mixed freely (for example weekly contributions with monthly compounding). A contribution is credited at the start of the compounding period in which it falls due.

The glidepath simulation steps monthly. Its `compoundingFrequency` sets how often earned interest is credited to the balance: below 12, interest accrues monthly and is added at the end of each compounding period; above 12 it behaves exactly like 12, because returns are effective annual rates.

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
