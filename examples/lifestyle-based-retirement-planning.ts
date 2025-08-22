/**
 * @fileoverview Lifestyle-Based Retirement Planning Example
 * 
 * WHEN TO USE THIS:
 * - You think in terms of "I want to spend $X per year in retirement" 
 * - You want to work backwards from your desired lifestyle to required savings
 * - You're trying to understand how much you need to maintain your current lifestyle
 * - You want to see the difference between thinking in terms of income vs. lump sum
 * 
 * PERFECT FOR:
 * - People who say "I just want to maintain my current lifestyle in retirement"
 * - Someone planning to replace 70-80% of their current income
 * - Understanding the relationship between retirement income and required savings
 * - Comparing different retirement income scenarios
 * 
 * KEY LEARNING OUTCOMES:
 * - How the 4% withdrawal rule works in practice
 * - Why thinking in terms of income is more intuitive than lump sums
 * - The massive difference inflation makes over long time periods
 * - How to reverse-engineer your retirement savings from your lifestyle goals
 */

// You would import from 'retirement-calculator'
import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();

// ============================================================================
// SCENARIO: 25-year-old wants to spend $80K/year in retirement (today's dollars)
// Starting from $0, has 40 years to save
// ============================================================================

const startingBalance: number = 0;                  // Starting from scratch (realistic for 25-year-old)
const desiredYearlySpend: number = 80000;           // Want $80K/year lifestyle in retirement
const yearsUntilRetirement: number = 40;           // Age 25 to 65
const interestRate: number = 8;                    // 8% annual return assumption
const contributionFrequency: number = 12;          // Monthly contributions
const compoundingFrequency: number = 12;           // Monthly compounding  
const inflationRate: number = 2.5;                 // Slightly higher inflation assumption
const yearlyWithdrawalRate: number = 4;            // 4% withdrawal rule

// Show what $80K today will cost in the future due to inflation
const desiredYearlySpendWithInflation = calculator.adjustDesiredBalanceDueToInflation(
    desiredYearlySpend, 
    yearsUntilRetirement, 
    inflationRate / 100
);

// Calculate required retirement balances
const neededBalanceForTodaysDollars = calculator.getDesiredBalanceByYearlySpend(
    desiredYearlySpend, 
    yearlyWithdrawalRate / 100
);

const neededBalanceForInflatedDollars = calculator.getDesiredBalanceByYearlySpend(
    desiredYearlySpendWithInflation, 
    yearlyWithdrawalRate / 100
);

// Calculate required monthly contributions for both scenarios
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

// Show different lifestyle scenarios
const lifestyleScenarios = [
    { name: "Basic Lifestyle", yearlySpend: 50000, description: "Modest retirement, basic needs covered" },
    { name: "Comfortable Lifestyle", yearlySpend: 80000, description: "Maintain middle-class lifestyle" },
    { name: "Luxury Lifestyle", yearlySpend: 120000, description: "High-end retirement with travel/hobbies" },
    { name: "Ultra-Luxury Lifestyle", yearlySpend: 200000, description: "Premium retirement lifestyle" }
];

// Calculate inflation impact over different time horizons
const inflationImpact = [
    { years: 10, cost: calculator.adjustDesiredBalanceDueToInflation(100, 10, inflationRate / 100) },
    { years: 20, cost: calculator.adjustDesiredBalanceDueToInflation(100, 20, inflationRate / 100) },
    { years: 30, cost: calculator.adjustDesiredBalanceDueToInflation(100, 30, inflationRate / 100) },
    { years: 40, cost: calculator.adjustDesiredBalanceDueToInflation(100, 40, inflationRate / 100) }
];

// ============================================================================
// RESULTS & EDUCATIONAL INSIGHTS  
// ============================================================================

console.log("🏡 LIFESTYLE-BASED RETIREMENT PLANNING");
console.log("=" .repeat(70));
console.log(`🎯 YOUR RETIREMENT LIFESTYLE GOAL:`);
console.log(`   Desired annual spending: $${calculator.formatNumberWithCommas(desiredYearlySpend)}`);
console.log(`   Years until retirement: ${yearsUntilRetirement}`);
console.log(`   Assumed inflation rate: ${inflationRate}%`);
console.log(`   Expected investment return: ${interestRate}%`);
console.log();

console.log("💰 THE MATH BEHIND YOUR LIFESTYLE:");
console.log(`   Using the 4% withdrawal rule:`);
console.log(`   To spend $${calculator.formatNumberWithCommas(desiredYearlySpend)}/year, you need:`);
console.log(`   $${calculator.formatNumberWithCommas(neededBalanceForTodaysDollars)} in retirement savings`);
console.log(`   (This assumes 4% annual withdrawal rate)`);
console.log();

console.log("🚨 THE INFLATION REALITY CHECK:");
console.log(`   $${calculator.formatNumberWithCommas(desiredYearlySpend)} today = $${calculator.formatNumberWithCommas(desiredYearlySpendWithInflation)} in ${yearsUntilRetirement} years`);
console.log(`   To maintain the SAME purchasing power, you'll need:`);
console.log(`   $${calculator.formatNumberWithCommas(neededBalanceForInflatedDollars)} in retirement savings`);
console.log(`   That's ${((neededBalanceForInflatedDollars / neededBalanceForTodaysDollars - 1) * 100).toFixed(0)}% more than if you ignore inflation!`);
console.log();

console.log("📊 WHAT YOU NEED TO SAVE MONTHLY:");
console.log(`   Ignoring inflation: $${calculator.formatNumberWithCommas(contributionForTodaysPurchasingPower.contributionNeededPerPeriod)}/month`);
console.log(`   Accounting for inflation: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod)}/month`);
console.log(`   Extra needed due to inflation: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod - contributionForTodaysPurchasingPower.contributionNeededPerPeriod)}/month`);
console.log();

console.log("🔥 PERSPECTIVE: That's only $" + (contributionForFutureDollars.contributionNeededPerPeriod / 30).toFixed(2) + " per day!");
console.log("    Less than most people spend on coffee and lunch!");
console.log();

// ============================================================================
// LIFESTYLE COMPARISON SCENARIOS
// ============================================================================

console.log("🏠 COMPARE DIFFERENT RETIREMENT LIFESTYLES:");
console.log("=" .repeat(70));

lifestyleScenarios.forEach((scenario) => {
    const requiredBalance = calculator.getDesiredBalanceByYearlySpend(scenario.yearlySpend, yearlyWithdrawalRate / 100);
    const monthlyContribution = calculator.getContributionNeededForDesiredBalance(
        0,
        requiredBalance,
        yearsUntilRetirement,
        interestRate / 100,
        12,
        12,
        inflationRate / 100
    ).contributionNeededPerPeriod;
    
    console.log(`💸 ${scenario.name.toUpperCase()}:`);
    console.log(`    Annual spending: $${calculator.formatNumberWithCommas(scenario.yearlySpend)}`);
    console.log(`    Required savings: $${calculator.formatNumberWithCommas(requiredBalance)}`);
    console.log(`    Monthly contribution needed: $${calculator.formatNumberWithCommas(monthlyContribution)}`);
    console.log(`    ${scenario.description}`);
    console.log();
});

// ============================================================================
// INFLATION EDUCATION SECTION
// ============================================================================

console.log("📈 UNDERSTANDING INFLATION'S IMPACT:");
console.log("=" .repeat(70));
console.log("See how $100 worth of goods today will cost in the future:");
console.log();

inflationImpact.forEach((impact) => {
    const purchasing_power = 100 / (impact.cost / 100);
    console.log(`   In ${impact.years} years: $${impact.cost.toFixed(2)}`);
    console.log(`   (Your $100 will only buy $${purchasing_power.toFixed(2)} worth of goods)`);
});

console.log();
console.log(`💡 This is why you need $${calculator.formatNumberWithCommas(neededBalanceForInflatedDollars)} instead of`);
console.log(`   just $${calculator.formatNumberWithCommas(neededBalanceForTodaysDollars)} to maintain your lifestyle!`);
console.log();

// ============================================================================
// KEY INSIGHTS & ACTION ITEMS
// ============================================================================

console.log("🎓 KEY INSIGHTS:");
console.log("=" .repeat(70));
console.log("1️⃣  THE 4% WITHDRAWAL RULE:");
console.log("    For every $40,000/year you want to spend in retirement,");
console.log("    you need about $1,000,000 in savings.");
console.log("    This rule helps your money last 30+ years.");
console.log();

console.log("2️⃣  THINK IN INCOME, NOT LUMP SUMS:");
console.log("    Instead of 'I need $1M to retire,' think:");
console.log("    'I need $40,000/year in retirement income.'");
console.log("    This makes it easier to plan and understand.");
console.log();

console.log("3️⃣  INFLATION IS YOUR BIGGEST ENEMY:");
console.log(`    At ${inflationRate}% inflation, prices double every ${Math.round(70/inflationRate)} years.`);
console.log("    What costs $80,000 today will cost " + 
      `$${calculator.formatNumberWithCommas(desiredYearlySpendWithInflation)} in retirement.`);
console.log();

console.log("4️⃣  TIME IS YOUR BIGGEST ALLY:");
console.log(`    Starting at 25 vs 35 means:`);
const late_starter = calculator.getContributionNeededForDesiredBalance(
    0, neededBalanceForInflatedDollars, 30, interestRate / 100, 12, 12, inflationRate / 100
).contributionNeededPerPeriod;
console.log(`    Start at 25: $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod)}/month`);
console.log(`    Start at 35: $${calculator.formatNumberWithCommas(late_starter)}/month`);
console.log(`    Waiting 10 years costs you $${calculator.formatNumberWithCommas(late_starter - contributionForFutureDollars.contributionNeededPerPeriod)}/month FOREVER!`);
console.log();

console.log("🚀 YOUR ACTION PLAN:");
console.log("=" .repeat(70));
console.log(`✅ Set up automatic monthly investment of $${calculator.formatNumberWithCommas(contributionForFutureDollars.contributionNeededPerPeriod)}`);
console.log("✅ Use tax-advantaged accounts (401k, IRA, Roth IRA) first");
console.log("✅ Invest in low-cost index funds for the ${interestRate}% return assumption");
console.log("✅ Increase contributions by 3-5% annually with pay raises");
console.log("✅ Review and adjust your retirement lifestyle goals yearly");
console.log();

console.log("💭 REMEMBER:");
console.log("   This assumes steady ${interestRate}% returns and ${inflationRate}% inflation.");
console.log("   Real life has ups and downs - consider our Monte Carlo");
console.log("   simulation for a more realistic analysis!");