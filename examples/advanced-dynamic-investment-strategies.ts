/**
 * Advanced Dynamic Investment Strategies Example
 *
 * Demonstrates how to model changing investment strategies over time,
 * similar to target-date funds. Compares different glidepath approaches.
 *
 * These examples assume steady returns. Real markets fluctuate.
 * For actual investment decisions, Monte Carlo analysis is recommended.
 *
 * Try these strategies with your own numbers at:
 * https://commoncentsacademy.com
 */

import RetirementCalculator from '../src/RetirementCalculator';
import type {
  FixedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
} from '../src/types/retirementCalculatorTypes';
import { GLIDEPATH_PRESETS } from '../src/constants/retirementCalculatorConstants';

const calculator = new RetirementCalculator();

console.log('ADVANCED DYNAMIC INVESTMENT STRATEGIES');
console.log('='.repeat(60));
console.log();

// ============================================================================
// SCENARIO 1: FIXED RETURN GLIDEPATH
// ============================================================================

console.log('SCENARIO 1: Fixed Return Glidepath');
console.log('-'.repeat(40));
console.log('Profile: 25-year-old, retiring at 65');
console.log('Strategy: 10% returns early, declining to 5.5% at retirement');
console.log();

const fixedReturnConfig: FixedReturnGlidepathConfig = {
  mode: 'fixed-return',
  startReturn: 0.1,
  endReturn: 0.055,
};

try {
  const fixedResult = calculator.getCompoundInterestWithGlidepath(
    25000,
    1000,
    25,
    65,
    fixedReturnConfig
  );

  console.log('Results:');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(fixedResult.finalBalance)}`);
  console.log(`  Total contributions: $${calculator.formatNumberWithCommas(fixedResult.totalContributions)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(fixedResult.totalInterestEarned)}`);
  console.log(`  Investment return: ${(fixedResult.averageAnnualInterestRate * 100).toFixed(2)}%`);

  console.log('\nReturn progression:');
  [25, 35, 45, 55, 65].forEach((age) => {
    const entry = fixedResult.monthlyTimeline.find((e) => Math.abs(e.age - age) < 0.1);
    if (entry) {
      console.log(`  Age ${age}: ${(entry.currentAnnualReturn * 100).toFixed(2)}%`);
    }
  });
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// SCENARIO 2: ALLOCATION-BASED GLIDEPATH (Target-Date Fund Style)
// ============================================================================

console.log('\n');
console.log('SCENARIO 2: Allocation-Based Glidepath');
console.log('-'.repeat(40));
console.log('Profile: 30-year-old, retiring at 65');
console.log('Strategy: 90% stocks at 30, declining to 30% at 65');
console.log();

const allocationConfig: AllocationBasedGlidepathConfig = {
  mode: 'allocation-based',
  startEquityWeight: 0.9,
  endEquityWeight: 0.3,
  equityReturn: 0.12,
  bondReturn: 0.04,
};

try {
  const allocationResult = calculator.getCompoundInterestWithGlidepath(
    50000,
    1500,
    30,
    65,
    allocationConfig
  );

  console.log('Results:');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(allocationResult.finalBalance)}`);
  console.log(`  Total contributions: $${calculator.formatNumberWithCommas(allocationResult.totalContributions)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(allocationResult.totalInterestEarned)}`);
  console.log(`  Investment return: ${(allocationResult.averageAnnualInterestRate * 100).toFixed(2)}%`);

  const monthlyIncome = Math.floor(allocationResult.finalBalance * 0.04 / 12);
  console.log(`  Monthly income (4% rule): $${calculator.formatNumberWithCommas(monthlyIncome)}`);

  console.log('\nAllocation progression:');
  [30, 40, 50, 60, 65].forEach((age) => {
    const entry = allocationResult.monthlyTimeline.find((e) => Math.abs(e.age - age) < 0.1);
    if (entry && entry.currentEquityWeight !== undefined) {
      const equity = (entry.currentEquityWeight * 100).toFixed(0);
      const bonds = ((1 - entry.currentEquityWeight) * 100).toFixed(0);
      console.log(`  Age ${age}: ${equity}% stocks / ${bonds}% bonds`);
    }
  });
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// SCENARIO 3: CUSTOM WAYPOINTS
// ============================================================================

console.log('\n');
console.log('SCENARIO 3: Custom Waypoints');
console.log('-'.repeat(40));
console.log('Profile: 25-year-old with specific allocation targets');
console.log();

const customConfig: CustomWaypointsGlidepathConfig = {
  mode: 'custom-waypoints',
  valueType: 'equityWeight',
  waypoints: [
    { age: 25, value: 1.0 },
    { age: 35, value: 0.85 },
    { age: 45, value: 0.7 },
    { age: 55, value: 0.5 },
    { age: 65, value: 0.25 },
  ],
  equityReturn: 0.11,
  bondReturn: 0.035,
};

try {
  const customResult = calculator.getCompoundInterestWithGlidepath(
    15000,
    800,
    25,
    65,
    customConfig
  );

  console.log('Results:');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(customResult.finalBalance)}`);
  console.log(`  Total contributions: $${calculator.formatNumberWithCommas(customResult.totalContributions)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(customResult.totalInterestEarned)}`);
  console.log(`  Investment return: ${(customResult.averageAnnualInterestRate * 100).toFixed(2)}%`);
  console.log(`  Growth multiple: ${(customResult.finalBalance / customResult.totalContributions).toFixed(1)}x`);
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// SCENARIO 4: MONEY GUY SHOW PRESET
// ============================================================================

console.log('\n');
console.log('SCENARIO 4: Money Guy Show Preset');
console.log('-'.repeat(40));
console.log('Profile: 22-year-old using Money Guy methodology');
console.log('Strategy: 10% returns, declining 0.1%/year to 5.5% floor');
console.log();

try {
  const moneyGuyResult = calculator.getCompoundInterestWithGlidepath(
    30000,
    1200,
    22,
    65,
    GLIDEPATH_PRESETS.MONEY_GUY_SHOW
  );

  console.log('Results:');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(moneyGuyResult.finalBalance)}`);
  console.log(`  Total contributions: $${calculator.formatNumberWithCommas(moneyGuyResult.totalContributions)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(moneyGuyResult.totalInterestEarned)}`);
  console.log(`  Investment return: ${(moneyGuyResult.averageAnnualInterestRate * 100).toFixed(2)}%`);

  const yearlyIncome = Math.floor(moneyGuyResult.finalBalance * 0.04);
  console.log(`  Annual income (4% rule): $${calculator.formatNumberWithCommas(yearlyIncome)}`);

  console.log('\nReturn progression:');
  [22, 30, 40, 50, 60, 65].forEach((age) => {
    const entry = moneyGuyResult.monthlyTimeline.find((e) => Math.abs(e.age - age) < 0.1);
    if (entry) {
      console.log(`  Age ${age}: ${(entry.currentAnnualReturn * 100).toFixed(2)}%`);
    }
  });
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// COMPARISON: DYNAMIC VS TRADITIONAL
// ============================================================================

console.log('\n');
console.log('COMPARISON: Dynamic vs Traditional');
console.log('-'.repeat(40));
console.log();

try {
  const traditionalResult = calculator.getCompoundInterestWithAdditionalContributions(
    25000,
    1000,
    40,
    0.08,
    12,
    12
  );

  const dynamicConfig: FixedReturnGlidepathConfig = {
    mode: 'fixed-return',
    startReturn: 0.1,
    endReturn: 0.06,
  };

  const dynamicResult = calculator.getCompoundInterestWithGlidepath(
    25000,
    1000,
    25,
    65,
    dynamicConfig
  );

  console.log('Traditional (8% fixed):');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(traditionalResult.balance)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(traditionalResult.totalInterestEarned)}`);

  console.log('\nDynamic (10% -> 6%):');
  console.log(`  Final balance: $${calculator.formatNumberWithCommas(dynamicResult.finalBalance)}`);
  console.log(`  Interest earned: $${calculator.formatNumberWithCommas(dynamicResult.totalInterestEarned)}`);

  const difference = dynamicResult.finalBalance - traditionalResult.balance;
  console.log(`\nDifference: $${calculator.formatNumberWithCommas(Math.abs(difference))} ${difference >= 0 ? 'more' : 'less'}`);
  console.log('Higher returns early in life compound for longer.');
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// TIMELINE DATA FOR DEVELOPERS
// ============================================================================

console.log('\n');
console.log('TIMELINE DATA FOR DEVELOPERS');
console.log('-'.repeat(40));
console.log('Every glidepath calculation includes month-by-month timeline data.');
console.log();

try {
  const timelineConfig: AllocationBasedGlidepathConfig = {
    mode: 'allocation-based',
    startEquityWeight: 0.8,
    endEquityWeight: 0.2,
    equityReturn: 0.1,
    bondReturn: 0.03,
  };

  const result = calculator.getCompoundInterestWithGlidepath(10000, 500, 30, 50, timelineConfig);

  console.log('Sample (every 5 years):');
  console.log('Year | Age   | Balance    | Equity% | Return');
  console.log('-'.repeat(55));

  const samples = result.monthlyTimeline.filter((_, i) => i % 60 === 59);
  samples.forEach((entry, i) => {
    const year = (i + 1) * 5;
    const equity = entry.currentEquityWeight ? (entry.currentEquityWeight * 100).toFixed(0) + '%' : 'N/A';
    console.log(
      `${year.toString().padStart(4)} | ` +
      `${entry.age.toFixed(1).padStart(5)} | ` +
      `$${calculator.formatNumberWithCommas(entry.currentBalance).padStart(9)} | ` +
      `${equity.padStart(7)} | ` +
      `${(entry.currentAnnualReturn * 100).toFixed(2)}%`
    );
  });

  console.log(`\n${result.monthlyTimeline.length} monthly data points available for charts.`);
} catch (error) {
  console.error('Calculation failed:', error);
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n');
console.log('='.repeat(60));
console.log('KEY TAKEAWAYS');
console.log('='.repeat(60));
console.log(`
1. Higher returns early compound for longer
   A 25-year-old at 10% outperforms a 25-year-old at 8%
   by hundreds of thousands over 40 years.

2. Risk management matters
   Being 100% stocks at 64 is risky. Glidepaths reduce
   exposure to market crashes as retirement approaches.

3. These are idealized scenarios
   Real markets don't return steady percentages.
   Use Monte Carlo analysis for actual planning.

Try these calculators with your own numbers:
https://commoncentsacademy.com
`);
console.log('='.repeat(60));
