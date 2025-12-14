/**
 * Lifestyle-Based Retirement Planning Example
 *
 * Works backwards from "I want to spend $X per year in retirement"
 * to calculate how much you need to save.
 *
 * Try this with your own numbers at:
 * https://commoncentsacademy.com
 */

import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();

// ============================================================================
// SCENARIO: 25-year-old wants to spend $80K/year in retirement
// Starting from $0, has 40 years to save
// ============================================================================

const startingBalance: number = 0;
const desiredYearlySpend: number = 80000;
const yearsUntilRetirement: number = 40;
const interestRate: number = 8;
const contributionFrequency: number = 12;
const compoundingFrequency: number = 12;
const inflationRate: number = 2.5;
const yearlyWithdrawalRate: number = 4;

const desiredYearlySpendWithInflation = calculator.adjustDesiredBalanceDueToInflation(
  desiredYearlySpend,
  yearsUntilRetirement,
  inflationRate / 100
);

const neededBalanceForTodaysDollars = calculator.getDesiredBalanceByYearlySpend(
  desiredYearlySpend,
  yearlyWithdrawalRate / 100
);

const neededBalanceForInflatedDollars = calculator.getDesiredBalanceByYearlySpend(
  desiredYearlySpendWithInflation,
  yearlyWithdrawalRate / 100
);

const contributionForTodaysPurchasingPower = calculator.getContributionNeededForDesiredBalance(
  startingBalance,
  neededBalanceForTodaysDollars,
  yearsUntilRetirement,
  interestRate / 100,
  contributionFrequency,
  compoundingFrequency,
  inflationRate / 100,
);

const contributionForFutureDollars = calculator.getContributionNeededForDesiredBalance(
  startingBalance,
  neededBalanceForInflatedDollars,
  yearsUntilRetirement,
  interestRate / 100,
  contributionFrequency,
  compoundingFrequency,
  inflationRate / 100,
);

const lifestyleScenarios = [
  { name: 'Basic', yearlySpend: 50000, description: 'Modest retirement' },
  { name: 'Comfortable', yearlySpend: 80000, description: 'Middle-class lifestyle' },
  { name: 'Luxury', yearlySpend: 120000, description: 'Travel and hobbies' },
  { name: 'Premium', yearlySpend: 200000, description: 'High-end retirement' }
];

// ============================================================================
// RESULTS
// ============================================================================

console.log('LIFESTYLE-BASED RETIREMENT PLANNING');
console.log('='.repeat(60));
console.log();

console.log('YOUR GOAL:');
console.log(`  Desired annual spending: $${calculator.formatNumberWithCommas(desiredYearlySpend)}`);
console.log(`  Years until retirement: ${yearsUntilRetirement}`);
console.log(`  Inflation rate: ${inflationRate}%`);
console.log(`  Expected return: ${interestRate}%`);
console.log();

console.log('THE MATH (4% Withdrawal Rule):');
console.log(`  To spend $${calculator.formatNumberWithCommas(desiredYearlySpend)}/year, you need:`);
console.log(`  $${calculator.formatNumberWithCommas(neededBalanceForTodaysDollars)} in retirement savings`);
console.log();

console.log('INFLATION ADJUSTMENT:');
console.log(`  $${calculator.formatNumberWithCommas(desiredYearlySpend)} today = $${calculator.formatNumberWithCommas(desiredYearlySpendWithInflation)} in ${yearsUntilRetirement} years`);
console.log(`  To maintain the same purchasing power, you'll need:`);
console.log(`  $${calculator.formatNumberWithCommas(neededBalanceForInflatedDollars)} in retirement savings`);
console.log(`  That's ${((neededBalanceForInflatedDollars / neededBalanceForTodaysDollars - 1) * 100).toFixed(0)}% more than if you ignore inflation`);
console.log();

console.log('MONTHLY SAVINGS REQUIRED:');
console.log(`  Ignoring inflation: $${calculator.formatNumberWithCommas(contributionForTodaysPurchasingPower.contributionNeededPerPeriod)}/month`);
console.log(`  Accounting for inflation: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod)}/month`);
console.log(`  Difference: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod - contributionForTodaysPurchasingPower.contributionNeededPerPeriod)}/month`);
console.log();
console.log(`  That's $${(contributionForFutureDollars.contributionNeededPerPeriod / 30).toFixed(2)} per day`);
console.log();

// ============================================================================
// LIFESTYLE COMPARISON
// ============================================================================

console.log('='.repeat(60));
console.log('COMPARE DIFFERENT RETIREMENT LIFESTYLES');
console.log('='.repeat(60));
console.log();

lifestyleScenarios.forEach((scenario) => {
  const requiredBalance = calculator.getDesiredBalanceByYearlySpend(
    scenario.yearlySpend,
    yearlyWithdrawalRate / 100
  );
  const monthlyContribution = calculator.getContributionNeededForDesiredBalance(
    0,
    requiredBalance,
    yearsUntilRetirement,
    interestRate / 100,
    12,
    12,
    inflationRate / 100
  ).contributionNeededPerPeriod;

  console.log(`${scenario.name.toUpperCase()} (${scenario.description}):`);
  console.log(`  Annual spending: $${calculator.formatNumberWithCommas(scenario.yearlySpend)}`);
  console.log(`  Required savings: $${calculator.formatNumberWithCommas(requiredBalance)}`);
  console.log(`  Monthly contribution: $${calculator.formatNumberWithCommas(monthlyContribution)}`);
  console.log();
});

// ============================================================================
// INFLATION IMPACT
// ============================================================================

console.log('='.repeat(60));
console.log('UNDERSTANDING INFLATION');
console.log('='.repeat(60));
console.log('What $100 worth of goods will cost in the future:');
console.log();

[10, 20, 30, 40].forEach((years) => {
  const futureCost = calculator.adjustDesiredBalanceDueToInflation(100, years, inflationRate / 100);
  const purchasingPower = 100 / (futureCost / 100);
  console.log(`  In ${years} years: $${futureCost.toFixed(2)}`);
  console.log(`  (Your $100 will only buy $${purchasingPower.toFixed(2)} worth of goods)`);
});

console.log();
console.log(`This is why you need $${calculator.formatNumberWithCommas(neededBalanceForInflatedDollars)}`);
console.log(`instead of $${calculator.formatNumberWithCommas(neededBalanceForTodaysDollars)} to maintain your lifestyle`);
console.log();

// ============================================================================
// KEY INSIGHTS
// ============================================================================

console.log('='.repeat(60));
console.log('KEY INSIGHTS');
console.log('='.repeat(60));

console.log();
console.log('1. THE 4% WITHDRAWAL RULE:');
console.log('   For every $40,000/year you want to spend,');
console.log('   you need about $1,000,000 in savings.');
console.log('   This helps your money last 30+ years.');
console.log();

console.log('2. THINK IN INCOME, NOT LUMP SUMS:');
console.log('   Instead of "I need $1M to retire," think:');
console.log('   "I need $40,000/year in retirement income."');
console.log();

console.log('3. INFLATION DOUBLES PRICES:');
console.log(`   At ${inflationRate}% inflation, prices double every ${Math.round(70 / inflationRate)} years.`);
console.log(`   What costs $80,000 today will cost`);
console.log(`   $${calculator.formatNumberWithCommas(desiredYearlySpendWithInflation)} in retirement.`);
console.log();

console.log('4. TIME MATTERS:');
const lateStarter = calculator.getContributionNeededForDesiredBalance(
  0, neededBalanceForInflatedDollars, 30, interestRate / 100, 12, 12, inflationRate / 100
).contributionNeededPerPeriod;
console.log(`   Start at 25: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod)}/month`);
console.log(`   Start at 35: $${calculator.formatNumberWithCommas(lateStarter)}/month`);
console.log(`   Waiting 10 years costs you $${calculator.formatNumberWithCommas(lateStarter - contributionForFutureDollars.contributionNeededPerPeriod)}/month forever`);
console.log();

console.log('This assumes steady ' + interestRate + '% returns and ' + inflationRate + '% inflation.');
console.log('Real markets fluctuate. For more realistic projections,');
console.log('try the calculators at: https://commoncentsacademy.com');
