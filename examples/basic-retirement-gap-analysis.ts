/**
 * @fileoverview Basic Retirement Gap Analysis Example
 * 
 * WHEN TO USE THIS:
 * - You have a specific retirement balance goal in mind
 * - You want to see if your current contributions are enough
 * - You need to calculate the "retirement gap" (how much more you need to save)
 * - You want to understand the impact of inflation on your retirement goals
 * 
 * PERFECT FOR:
 * - People who have heard "you need $1 million to retire" and want to check if they're on track
 * - Someone currently saving but unsure if it's enough
 * - Understanding why starting early makes such a huge difference
 * 
 * KEY LEARNING OUTCOMES:
 * - How compound interest works over time
 * - The power of consistent monthly contributions
 * - Why inflation matters for long-term planning
 * - How to calculate if you're on track for retirement goals
 */

// You would import from 'retirement-calculator'
import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();

// ============================================================================
// SCENARIO: 30-year-old with $50K saved, wants $1M by age 55
// Currently contributing $200/month, wondering if that's enough
// ============================================================================

const startingBalance: number = 50000;           // Current 401k/IRA balance
const desiredBalance: number = 1000000;          // Classic "$1M retirement" goal  
const yearsUntilRetirement: number = 25;        // Age 30 to 55
const interestRate: number = 8;                 // 8% annual return (historical stock market average)
const contributionFrequency: number = 12;       // Monthly contributions
const compoundingFrequency: number = 12;        // Monthly compounding
const currentContributionAmount: number = 200;  // Currently saving $200/month
const inflationRate: number = 2;                // 2% inflation assumption

// Calculate what contribution is actually needed to hit the goal
const contributionRequired = calculator.getContributionNeededForDesiredBalance(
    startingBalance,
    desiredBalance,
    yearsUntilRetirement,
    interestRate / 100,        // Convert percentage to decimal
    contributionFrequency,
    compoundingFrequency,
    inflationRate / 100,       // Convert percentage to decimal
);

// See where current trajectory leads
const currentTrajectory = calculator.getCompoundInterestWithAdditionalContributions(
    startingBalance,
    currentContributionAmount, 
    yearsUntilRetirement, 
    interestRate / 100, 
    contributionFrequency, 
    compoundingFrequency
);

// Calculate retirement income using 4% withdrawal rule
const yearlyWithdrawalRate: number = 4;
const currentYearlySpend: number = calculator.getYearlyWithdrawalAmountByBalance(
    currentTrajectory.balance, 
    yearlyWithdrawalRate / 100
);
const goalYearlySpend: number = calculator.getYearlyWithdrawalAmountByBalance(
    contributionRequired.desiredBalance, 
    yearlyWithdrawalRate / 100
);

// Show inflation impact
const totalInflation: number = calculator.adjustDesiredBalanceDueToInflation(
    100, 
    yearsUntilRetirement, 
    inflationRate / 100
);

// ============================================================================
// RESULTS & EDUCATIONAL INSIGHTS
// ============================================================================

console.log("🎯 RETIREMENT GAP ANALYSIS");
console.log("=" .repeat(60));
console.log(`📊 STARTING SITUATION:`);
console.log(`   Current savings: $${calculator.formatNumberWithCommas(startingBalance)}`);
console.log(`   Monthly contributions: $${calculator.formatNumberWithCommas(currentContributionAmount)}`);
console.log(`   Years to retirement: ${yearsUntilRetirement}`);
console.log(`   Target balance: $${calculator.formatNumberWithCommas(desiredBalance)}`);
console.log(`   Expected return: ${interestRate}% annually`);
console.log();

console.log("📈 CURRENT TRAJECTORY VS. GOAL:");
console.log(`   Where you're headed: $${calculator.formatNumberWithCommas(currentTrajectory.balance)}`);
console.log(`   Where you want to be: $${calculator.formatNumberWithCommas(desiredBalance)}`);

const shortfall = desiredBalance - currentTrajectory.balance;
const percentShort = (shortfall / desiredBalance * 100);

if (shortfall > 0) {
    console.log(`   🚨 RETIREMENT GAP: $${calculator.formatNumberWithCommas(shortfall)} (${percentShort.toFixed(1)}% short)`);
} else {
    console.log(`   ✅ SURPLUS: $${calculator.formatNumberWithCommas(Math.abs(shortfall))} (${Math.abs(percentShort).toFixed(1)}% over goal!)`);
}
console.log();

console.log("💡 WHAT YOU NEED TO DO:");
console.log(`   Required monthly contribution: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod)}`);
console.log(`   Additional monthly needed: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod - currentContributionAmount)}`);
console.log(`   That's only $${((contributionRequired.contributionNeededPerPeriod - currentContributionAmount) / 30).toFixed(2)} more per day!`);
console.log();

console.log("🏠 RETIREMENT INCOME (4% Withdrawal Rule):");
console.log(`   Current trajectory income: $${calculator.formatNumberWithCommas(currentYearlySpend)}/year`);
console.log(`   Goal trajectory income: $${calculator.formatNumberWithCommas(goalYearlySpend)}/year`);
console.log(`   Monthly difference: $${calculator.formatNumberWithCommas((goalYearlySpend - currentYearlySpend) / 12)}`);
console.log();

console.log("💸 INFLATION IMPACT:");
console.log(`   $100 today = $${calculator.formatNumberWithCommas(totalInflation)} in ${yearsUntilRetirement} years`);
console.log(`   Your $${calculator.formatNumberWithCommas(desiredBalance)} will have purchasing power of:`);
console.log(`   $${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceValueAfterInflation)} in today's dollars`);
console.log();

// ============================================================================
// KEY TAKEAWAYS & TIPS
// ============================================================================

console.log("🎓 KEY LESSONS FROM THIS ANALYSIS:");
console.log("=" .repeat(60));
console.log("1️⃣  THE POWER OF COMPOUND INTEREST:");
console.log(`    Your $${calculator.formatNumberWithCommas(startingBalance)} starting balance will grow to:`);
console.log(`    $${calculator.formatNumberWithCommas(calculator.getCompoundInterestWithAdditionalContributions(startingBalance, 0, yearsUntilRetirement, interestRate / 100, 1, 1).balance)}`);
console.log(`    That's $${calculator.formatNumberWithCommas(calculator.getCompoundInterestWithAdditionalContributions(startingBalance, 0, yearsUntilRetirement, interestRate / 100, 1, 1).totalInterestEarned)} in FREE money from compound interest!`);
console.log();

console.log("2️⃣  WHY MONTHLY CONTRIBUTIONS MATTER:");
console.log(`    Without additional contributions: $${calculator.formatNumberWithCommas(calculator.getCompoundInterestWithAdditionalContributions(startingBalance, 0, yearsUntilRetirement, interestRate / 100, 1, 1).balance)}`);
console.log(`    With $${currentContributionAmount}/month: $${calculator.formatNumberWithCommas(currentTrajectory.balance)}`);
console.log(`    Extra from contributions: $${calculator.formatNumberWithCommas(currentTrajectory.balance - calculator.getCompoundInterestWithAdditionalContributions(startingBalance, 0, yearsUntilRetirement, interestRate / 100, 1, 1).balance)}`);
console.log();

console.log("3️⃣  INFLATION IS A SILENT WEALTH KILLER:");
console.log(`    Without considering inflation, $${calculator.formatNumberWithCommas(desiredBalance)} seems like a lot`);
console.log(`    But with ${inflationRate}% inflation, it's only worth $${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceValueAfterInflation)} in today's purchasing power`);
console.log();

console.log("🚀 ACTION ITEMS:");
console.log("=" .repeat(60));
if (shortfall > 0) {
    console.log(`✅ Increase monthly contributions by $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod - currentContributionAmount)}`);
    console.log(`✅ Consider increasing your 401(k) contribution percentage`);
    console.log(`✅ Look for ways to reduce expenses by $${((contributionRequired.contributionNeededPerPeriod - currentContributionAmount) / 30).toFixed(2)}/day`);
    console.log(`✅ Consider a side hustle to fund the additional retirement savings`);
} else {
    console.log(`🎉 Congratulations! You're on track to exceed your retirement goal!`);
    console.log(`✅ Consider increasing your retirement goal for more financial security`);
    console.log(`✅ Explore early retirement options with your surplus`);
}

console.log(`✅ Automate your retirement contributions to make saving effortless`);
console.log(`✅ Review and increase contributions annually with pay raises`);
console.log(`✅ Consider tax-advantaged accounts (401k, IRA, Roth IRA)`);

console.log();
console.log("💭 REMEMBER: This analysis assumes a constant ${interestRate}% return.");
console.log("   Real markets fluctuate. Consider using our Monte Carlo simulation");
console.log("   for a more realistic range of outcomes!");