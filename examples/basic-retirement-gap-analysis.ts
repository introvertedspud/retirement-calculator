/**
 * Basic Retirement Gap Analysis Example
 *
 * Shows how to calculate if your current savings rate will hit your goal,
 * and what adjustments you need to make if not.
 *
 * Try this with your own numbers at:
 * https://commoncentsacademy.com
 */

import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();

// ============================================================================
// SCENARIO: 30-year-old with $50K saved, wants $1M by age 55
// Currently contributing $200/month
// ============================================================================

const startingBalance: number = 50000;
const desiredBalance: number = 1000000;
const yearsUntilRetirement: number = 25;
const interestRate: number = 8;
const contributionFrequency: number = 12;
const compoundingFrequency: number = 12;
const currentContributionAmount: number = 200;
const inflationRate: number = 2;

const contributionRequired = calculator.getContributionNeededForDesiredBalance(
  startingBalance,
  desiredBalance,
  yearsUntilRetirement,
  interestRate / 100,
  contributionFrequency,
  compoundingFrequency,
  inflationRate / 100,
);

const currentTrajectory = calculator.getCompoundInterestWithAdditionalContributions(
  startingBalance,
  currentContributionAmount,
  yearsUntilRetirement,
  interestRate / 100,
  contributionFrequency,
  compoundingFrequency
);

const yearlyWithdrawalRate: number = 4;
const currentYearlySpend: number = calculator.getYearlyWithdrawalAmountByBalance(
  currentTrajectory.balance,
  yearlyWithdrawalRate / 100
);
const goalYearlySpend: number = calculator.getYearlyWithdrawalAmountByBalance(
  contributionRequired.desiredBalance,
  yearlyWithdrawalRate / 100
);

const totalInflation: number = calculator.adjustDesiredBalanceDueToInflation(
  100,
  yearsUntilRetirement,
  inflationRate / 100
);

// ============================================================================
// RESULTS
// ============================================================================

console.log('RETIREMENT GAP ANALYSIS');
console.log('='.repeat(60));
console.log();

console.log('STARTING SITUATION:');
console.log(`  Current savings: $${calculator.formatNumberWithCommas(startingBalance)}`);
console.log(`  Monthly contributions: $${calculator.formatNumberWithCommas(currentContributionAmount)}`);
console.log(`  Years to retirement: ${yearsUntilRetirement}`);
console.log(`  Target balance: $${calculator.formatNumberWithCommas(desiredBalance)}`);
console.log(`  Expected return: ${interestRate}% annually`);
console.log();

console.log('CURRENT TRAJECTORY VS. GOAL:');
console.log(`  Where you're headed: $${calculator.formatNumberWithCommas(currentTrajectory.balance)}`);
console.log(`  Where you want to be: $${calculator.formatNumberWithCommas(desiredBalance)}`);

const shortfall = desiredBalance - currentTrajectory.balance;
const percentShort = (shortfall / desiredBalance * 100);

if (shortfall > 0) {
  console.log(`  Gap: $${calculator.formatNumberWithCommas(shortfall)} (${percentShort.toFixed(1)}% short)`);
} else {
  console.log(`  Surplus: $${calculator.formatNumberWithCommas(Math.abs(shortfall))} (${Math.abs(percentShort).toFixed(1)}% over goal)`);
}
console.log();

console.log('WHAT YOU NEED TO DO:');
console.log(`  Required monthly contribution: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod)}`);
console.log(`  Additional monthly needed: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod - currentContributionAmount)}`);
console.log(`  That's $${((contributionRequired.contributionNeededPerPeriod - currentContributionAmount) / 30).toFixed(2)} more per day`);
console.log();

console.log('RETIREMENT INCOME (4% Withdrawal Rule):');
console.log(`  Current trajectory income: $${calculator.formatNumberWithCommas(currentYearlySpend)}/year`);
console.log(`  Goal trajectory income: $${calculator.formatNumberWithCommas(goalYearlySpend)}/year`);
console.log(`  Monthly difference: $${calculator.formatNumberWithCommas((goalYearlySpend - currentYearlySpend) / 12)}`);
console.log();

console.log('INFLATION IMPACT:');
console.log(`  $100 today = $${calculator.formatNumberWithCommas(totalInflation)} in ${yearsUntilRetirement} years`);
console.log(`  Your $${calculator.formatNumberWithCommas(desiredBalance)} will have purchasing power of:`);
console.log(`  $${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceValueAfterInflation)} in today's dollars`);
console.log();

// ============================================================================
// KEY TAKEAWAYS
// ============================================================================

console.log('='.repeat(60));
console.log('KEY TAKEAWAYS');
console.log('='.repeat(60));

const noContribResult = calculator.getCompoundInterestWithAdditionalContributions(
  startingBalance, 0, yearsUntilRetirement, interestRate / 100, 1, 1
);

console.log();
console.log('1. COMPOUND INTEREST:');
console.log(`   Your $${calculator.formatNumberWithCommas(startingBalance)} starting balance grows to:`);
console.log(`   $${calculator.formatNumberWithCommas(noContribResult.balance)}`);
console.log(`   That's $${calculator.formatNumberWithCommas(noContribResult.totalInterestEarned)} in interest alone`);
console.log();

console.log('2. WHY CONTRIBUTIONS MATTER:');
console.log(`   Without additional contributions: $${calculator.formatNumberWithCommas(noContribResult.balance)}`);
console.log(`   With $${currentContributionAmount}/month: $${calculator.formatNumberWithCommas(currentTrajectory.balance)}`);
console.log(`   Difference: $${calculator.formatNumberWithCommas(currentTrajectory.balance - noContribResult.balance)}`);
console.log();

console.log('3. INFLATION:');
console.log(`   Without inflation adjustment, $${calculator.formatNumberWithCommas(desiredBalance)} seems like a lot`);
console.log(`   With ${inflationRate}% inflation, it's only worth $${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceValueAfterInflation)} in today's purchasing power`);
console.log();

if (shortfall > 0) {
  console.log('NEXT STEPS:');
  console.log(`  - Increase monthly contributions by $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod - currentContributionAmount)}`);
  console.log('  - Consider increasing your 401(k) percentage');
  console.log('  - Automate your contributions');
} else {
  console.log('NEXT STEPS:');
  console.log('  - You\'re on track. Consider increasing your retirement goal');
  console.log('  - Explore early retirement options');
}

console.log();
console.log('This analysis assumes a constant ' + interestRate + '% return.');
console.log('Real markets fluctuate. For more realistic projections,');
console.log('try the calculators at: https://commoncentsacademy.com');
