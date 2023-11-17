// You would import from 'retirement-calculator'
import { RetirementCalculator } from '../index';

const calculator = new RetirementCalculator();
const startingBalance: number = 0;
const desiredYearlySpend: number = 80000;
const yearsUntilRetirement: number = 25;
const interestRate: number = 8;
const contributionFrequency: number = 12;
const compoundingFrequency: number = 12;
const inflationRate: number = 2;
const yearlyWithdrawalRate: number = 4;

const totalInflation: number = calculator.adjustDesiredBalanceDueToInflation(100, yearsUntilRetirement, inflationRate / 100);

const desiredYearlySpendWithInflation = calculator.adjustDesiredBalanceDueToInflation(desiredYearlySpend, yearsUntilRetirement, inflationRate / 100);
const neededBalanceBasedOnYearlySpend = calculator.getDesiredBalanceByYearlySpend(desiredYearlySpend, yearlyWithdrawalRate / 100);
const neededBalanceWithInflationBasedOnYearlySpend = calculator.getDesiredBalanceByYearlySpend(desiredYearlySpendWithInflation, yearlyWithdrawalRate / 100);

const contributionRequiredWithoutInflation = calculator.getContributionNeededForDesiredBalance(
    startingBalance,
    neededBalanceBasedOnYearlySpend,
    yearsUntilRetirement,
    interestRate / 100, // Assuming the input is in percentage
    contributionFrequency,
    compoundingFrequency,
    inflationRate / 100,
);

const contributionRequiredWithInflation = calculator.getContributionNeededForDesiredBalance(
    startingBalance,
    neededBalanceWithInflationBasedOnYearlySpend,
    yearsUntilRetirement,
    interestRate / 100, // Assuming the input is in percentage
    contributionFrequency,
    compoundingFrequency,
    inflationRate / 100,
);


console.log("============== SCENARIO #2 ==============");
console.log(`Desire to be able to spend $${calculator.formatNumberWithCommas(desiredYearlySpend)} per year when retired in ${yearsUntilRetirement} years and withdrawing ${yearlyWithdrawalRate}% per year and dealing with ${inflationRate}% inflation per year.`);


console.log();
console.log(`Balance needed at retirement: $${calculator.formatNumberWithCommas(neededBalanceBasedOnYearlySpend)}`);
console.log(`Contribution needed per month assuming an interest rate of ${interestRate}%: $${calculator.formatNumberWithCommas(contributionRequiredWithoutInflation.contributionNeededPerPeriod)}`);

console.log();
console.log();

console.log(`You may want to take inflation into account because something that costs $100.00 today, will cost ~$${calculator.formatNumberWithCommas(totalInflation)} in ${yearsUntilRetirement} years, assuming inflation rate of ${inflationRate}%.`);
console.log(`Something that costs $${calculator.formatNumberWithCommas(desiredYearlySpend)} now, will cost $${calculator.formatNumberWithCommas(desiredYearlySpendWithInflation)} after ${inflationRate}% inflation for ${yearsUntilRetirement} years.`);
console.log(`Balance needed at retirement with inflation: $${calculator.formatNumberWithCommas(neededBalanceWithInflationBasedOnYearlySpend)}`);
console.log(`Contribution needed per month with inflation assuming an interest rate of ${interestRate}%: $${calculator.formatNumberWithCommas(contributionRequiredWithInflation.contributionNeededPerPeriod)}`);
