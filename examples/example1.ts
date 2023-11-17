// You would import from 'retirement-calculator'
import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();
const startingBalance: number = 50000;
const desiredBalance: number = 1000000;
const yearsUntilRetirement: number = 25;
const interestRate: number = 8;
const contributionFrequency: number = 12;
const compoundingFrequency: number = 12;
const currentContributionAmount: number = 200;
const inflationRate: number = 2;
const totalInflation: number = calculator.adjustDesiredBalanceDueToInflation(100, yearsUntilRetirement, inflationRate / 100);

const contributionRequired = calculator.getContributionNeededForDesiredBalance(
    startingBalance,
    desiredBalance,
    yearsUntilRetirement,
    interestRate / 100, // Assuming the input is in percentage
    contributionFrequency,
    compoundingFrequency,
    inflationRate / 100,
);

const currentTrajectory = calculator.getCompoundInterestWithAdditionalContributions(startingBalance,currentContributionAmount, yearsUntilRetirement, interestRate / 100, contributionFrequency, compoundingFrequency);
const yearlyWithdrawalRate: number = 4;

const currentYearlySpend: number = calculator.getYearlyWithdrawalAmountByBalance(currentTrajectory.balance, yearlyWithdrawalRate / 100);
const yearlySpendWithoutInflation: number = calculator.getYearlyWithdrawalAmountByBalance(contributionRequired.desiredBalance, yearlyWithdrawalRate / 100);
const yearlySpendWithInflation: number = calculator.getYearlyWithdrawalAmountByBalance(contributionRequired.desiredBalanceWithInflation, yearlyWithdrawalRate / 100);

console.log("============== SCENARIO #1 ==============");
console.log(`Starting balance of $${calculator.formatNumberWithCommas(startingBalance)} and currently contributing $${calculator.formatNumberWithCommas(currentContributionAmount)} per month.`);
console.log(`Desired balance of $${calculator.formatNumberWithCommas(desiredBalance)} with ${yearsUntilRetirement} years until retirement, an interest rate of ${interestRate}%,`);
console.log(`compounding and contributing monthly`);
console.log();
console.log(`Current trajectory based on contributions: $${calculator.formatNumberWithCommas(currentTrajectory.balance)}`);
console.log(`Yearly income with current trajectory at ${yearlyWithdrawalRate}% withdrawal per year: $${calculator.formatNumberWithCommas(currentYearlySpend)}`);

console.log();
console.log(`Additional contribution needed per month to hit goal: $${calculator.formatNumberWithCommas((contributionRequired.contributionNeededPerPeriod - currentContributionAmount))}`);
console.log(`Percent off from hitting desired balance: ${calculator.formatNumberWithCommas(( currentTrajectory.balance / contributionRequired.desiredBalance -1) * -100)}%`);
console.log(`Total contribution needed per month: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriod)}`);
console.log(`Yearly income with desired balance at ${yearlyWithdrawalRate}% withdrawal per year: $${calculator.formatNumberWithCommas(yearlySpendWithoutInflation)}`);


console.log();
console.log();
console.log(`You may want to take inflation into account because something that costs $100.00 today, will cost ~$${calculator.formatNumberWithCommas(totalInflation)} in ${yearsUntilRetirement} years, assuming inflation rate of ${inflationRate}%.`);
console.log(`$${calculator.formatNumberWithCommas(desiredBalance)} will be worth ~$${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceValueAfterInflation)} after ${inflationRate}% inflation for ${yearsUntilRetirement} years.`);

console.log();
console.log(`Additional contribution needed per month to hit goal with inflation: $${calculator.formatNumberWithCommas((contributionRequired.contributionNeededPerPeriodWithInflation - currentContributionAmount))}`);
console.log(`Percent off from hitting desired balance with inflation: ${calculator.formatNumberWithCommas(( currentTrajectory.balance / contributionRequired.desiredBalanceWithInflation -1) * -100)}%`);
console.log(`Total contribution needed per month with inflation: $${calculator.formatNumberWithCommas(contributionRequired.contributionNeededPerPeriodWithInflation)}`);
console.log(`Total balance with inflation accounted for: $${calculator.formatNumberWithCommas(contributionRequired.desiredBalanceWithInflation)}`);
console.log(`Yearly income with desired balance with inflation at ${yearlyWithdrawalRate}% withdrawal per year: $${calculator.formatNumberWithCommas(yearlySpendWithInflation)}`);
console.log();

console.log();