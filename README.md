# Retirement Calculator

Welcome to the Retirement Calculator – your go-to tool for comprehensive retirement planning!

## Introduction

Are you ready to embark on the journey of securing your financial future? Planning for retirement can be both exciting and challenging. As someone with a deep passion for personal finance and a desire for a brighter financial future, I've created this tool to help you navigate the complexities of retirement planning.

## Installation

To use the Retirement Calculator in your project, install it via npm:

```bash
npm i retirement-calculator
```

## Why I Created This Package

My journey into retirement planning began with a simple realization: existing tools didn't provide me with the insights I needed. I wanted to know not only how much I should save for retirement but also how to get there. I realized that:

- I couldn't find a tool that told me exactly how much I should contribute each month to reach my desired retirement balance.
- Even if I reached my goal, I had no idea how much I could safely spend in retirement.
- Inflation would significantly impact my retirement needs, yet most calculators ignored this crucial factor.

To address these challenges, I started developing the Retirement Calculator package. It's a work in progress, and I have more exciting features in mind, but it's already a powerful tool for your retirement planning needs.

## Key Features

- **Contribution Calculation**: Determine monthly contributions needed to reach your desired retirement balance.
- **Withdrawal Estimation**: Understand how much you can safely spend from your retirement savings each year.
- **Inflation Adjustment**: Take into account the impact of inflation on your retirement savings and planning.
- **Dynamic Interest Glidepaths**: Age-aware return calculations with three powerful strategies:
  - **Fixed Return Glidepath**: Linear decline from aggressive to conservative returns
  - **Allocation-Based Glidepath**: Target-date fund style with equity/bond blending
  - **Custom Waypoints**: Flexible strategies with user-defined age/return targets


## Usage

### Importing the Calculator

```typescript
import { RetirementCalculator } from 'retirement-calculator';
```
### Calculating Compounding Interest With Additional Contributions
```typescript
const calculator = new RetirementCalculator();
const balance = calculator.getCompoundInterestWithAdditionalContributions(1000, 100, 1, .1, 12, 12);
```


### Calculate Contributions Needed to Achieve a Desired Balance
```typescript
const calculator = new RetirementCalculator();
const contributionsNeeded = getContributionNeededForDesiredBalance(1000,10000,10,.1,12,12);

// You won't necessarily hit your exact goal, so to find out what the exact total would be, run the following
const balance = calculator.getCompoundInterestWithAdditionalContributions(1000, contributionsNeeded.contributionNeededPerPeriod, 10, .1, 12, 12);
```

### Dynamic Interest Glidepath Calculations

**NEW**: Age-aware retirement calculations with sophisticated glidepath strategies.

#### Fixed Return Glidepath
Perfect for modeling target-date funds or declining return assumptions:

```typescript
const calculator = new RetirementCalculator();
const result = calculator.getCompoundInterestWithGlidepath(
  25000,    // Starting balance
  1000,     // Monthly contribution
  25,       // Starting age
  65,       // Retirement age
  {
    mode: 'fixed-return',
    startReturn: 0.10,    // 10% returns at age 25
    endReturn: 0.055      // 5.5% returns at age 65
  }
);

console.log(`Final balance: $${calculator.formatNumberWithCommas(result.finalBalance)}`);
console.log(`Effective annual return: ${(result.effectiveAnnualReturn * 100).toFixed(2)}%`);
```

#### Allocation-Based Glidepath
Model target-date funds with changing equity/bond allocations:

```typescript
const targetDateResult = calculator.getCompoundInterestWithGlidepath(
  50000, 1500, 30, 65,
  {
    mode: 'allocation-based',
    startEquityWeight: 0.90,    // 90% stocks at 30
    endEquityWeight: 0.30,      // 30% stocks at 65
    equityReturn: 0.12,         // 12% stock returns
    bondReturn: 0.04            // 4% bond returns
  }
);
```

#### Custom Waypoints Glidepath
Create sophisticated strategies with precise control:

```typescript
const customResult = calculator.getCompoundInterestWithGlidepath(
  15000, 800, 25, 65,
  {
    mode: 'custom-waypoints',
    valueType: 'equityWeight',
    waypoints: [
      { age: 25, value: 1.0 },    // 100% equity at 25
      { age: 35, value: 0.85 },   // 85% equity at 35  
      { age: 45, value: 0.70 },   // 70% equity at 45
      { age: 55, value: 0.50 },   // 50% equity at 55
      { age: 65, value: 0.25 }    // 25% equity at 65
    ],
    equityReturn: 0.11,
    bondReturn: 0.035
  }
);

// Rich timeline data for visualization
console.log(`Timeline entries: ${customResult.monthlyTimeline.length}`);
customResult.monthlyTimeline.forEach(entry => {
  console.log(`Age ${entry.age.toFixed(1)}: ${(entry.currentAnnualReturn * 100).toFixed(2)}% return`);
});
```

### Example Scenarios
I have created example scenarios that can be found [here](examples). These demonstrate both traditional and dynamic glidepath approaches to retirement planning.

#### Basic Retirement Gap Analysis
Perfect for when you have a specific retirement balance goal (like "$1 million") and want to see if your current savings rate is sufficient. This example shows you how to calculate your "retirement gap" and demonstrates the power of compound interest and why inflation matters for long-term planning.

```bash
npx ts-node examples/basic-retirement-gap-analysis.ts
```

#### Lifestyle-Based Retirement Planning
Ideal for people who think in terms of "I want to spend $X per year in retirement" rather than accumulating a lump sum. This example works backwards from your desired lifestyle to required savings and shows how the 4% withdrawal rule works in practice.

```bash
npx ts-node examples/lifestyle-based-retirement-planning.ts
```

#### Advanced Dynamic Investment Strategies ✨ **NEW**
For advanced users who want to model changing investment strategies over time (like target-date funds) and compare sophisticated approaches. This comprehensive example demonstrates all glidepath modes with detailed comparisons and educational insights.

```bash
npx ts-node examples/advanced-dynamic-investment-strategies.ts
```

This example showcases:
- **Fixed return glidepaths** for declining return assumptions
- **Allocation-based strategies** mimicking target-date funds  
- **Custom waypoint strategies** for precise control
- **Performance comparisons** between traditional and dynamic approaches
- **Timeline data usage** for creating charts and visualizations
- **Educational insights** about why different strategies work

More scenarios will be added as I continue to enhance the calculator's capabilities.

## Planned Enhancements
- **Fee Management**: Include functionality to account for management fees and their long-term impact.
- **Loan and Withdrawal Impact**: Assess the effect of loans or withdrawals on your retirement savings.
- **Monte Carlo Simulations**: Probabilistic modeling for market volatility and uncertainty.
- **Tax-Advantaged Account Modeling**: Support for 401(k), IRA, Roth IRA contribution limits and tax implications.

## Upcoming Integration
- **Interactive UI**: Developing an intuitive interface for easy retirement planning.
- **Budgeting Tool Integration**: A future project to integrate with a budgeting tool for a comprehensive financial planning solution.

## Collaboration and Contributions
Your contributions and ideas are essential to making this tool even better. Whether you want to add new features, fix bugs, or introduce innovative concepts, your involvement is greatly appreciated. Let's connect and collaborate on GitHub.

## Docs
Docs were made with TypeDoc and can be found [here](https://introvertedspud.github.io/retirement-calculator/).

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For any inquiries or collaboration ideas, please feel free to reach out through [GitHub issues](https://github.com/introvertedspud/retirement-calculator/issues) on this repository. You can also connect with me on [LinkedIn](https://www.linkedin.com/in/shaunbonk/) for professional networking and discussions.

