import { CONTRIBUTION_FREQUENCY } from './constants/retirementCalculatorConstants';
import type {
  CompoundingInterestObjectType,
  CompoundingPeriodDetailsType,
  DetermineContributionType,
  YearlyCompoundingDetails,
} from './types/retirementCalculatorTypes';

/**
 * RetirementCalculator provides various methods to calculate retirement finances,
 * including inflation adjustments, balance after inflation, and compound interest calculations.
 */
export default class RetirementCalculator {
  /**
   * Formats a number with commas and limits it to two decimal places.
   * @param value The number to be formatted.
   * @returns A string representation of the number with formatted commas.
   */
  public formatNumberWithCommas(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Adjust how much a balance would be with inflation added.
   * @param desiredBalance
   * @param years
   * @param inflationRate
   */
  public adjustDesiredBalanceDueToInflation(
    desiredBalance: number,
    years: number,
    inflationRate: number
  ): number {
    return desiredBalance * (1 + inflationRate) ** years;
  }

  /**
   * Calculate the value of something subtracting inflation over a period of time.
   * @param balance
   * @param inflationRate
   * @param years
   * @private
   */
  private getValueAfterInflation(
    balance: number,
    inflationRate: number,
    years: number
  ): number {
    return balance / (1 + inflationRate) ** years;
  }

  /**
   * Calculate how much would need to be in retirement in order to spend $yearlySpend a year
   * @param yearlySpend
   * @param yearlyWithdrawalRate
   */
  public getDesiredBalanceByYearlySpend(
    yearlySpend: number,
    yearlyWithdrawalRate: number = 0.04
  ): number {
    return yearlySpend / yearlyWithdrawalRate;
  }

  /**
   * Calculate how much could be spent in retirement based on an x% rule.
   * @param balance
   * @param yearlyWithdrawalRate
   */
  public getYearlyWithdrawalAmountByBalance(
    balance: number,
    yearlyWithdrawalRate: number
  ): number {
    return balance * yearlyWithdrawalRate;
  }

  /**
   * Calculate the interest of a balance over a given period of time.
   * @param startingBalance
   * @param interestRate
   * @param periods
   * @private
   */
  private getInterestOverTime(
    startingBalance: number,
    interestRate: number,
    periods: number
  ): number {
    return startingBalance * (1 + interestRate) ** periods;
  }

  /**
   * Calculate the total interest multiplier used for determining contributions needed to hit a goal.
   * @param interestRate
   * @param periods
   * @private
   */
  private getAdditionalContributionsTotalInterestMultiplier(
    interestRate: number,
    periods: number
  ): number {
    let totalInterestMultiplier: number = 0;
    for (let i: number = 1; i <= periods; i++) {
      totalInterestMultiplier += (1 + interestRate) ** i;
    }
    return totalInterestMultiplier;
  }

  /**
   * Calculate the total number of periods based on years and periods per year.
   * @param years
   * @param periodsPerYear
   * @private
   */
  private getTotalPeriods(years: number, periodsPerYear: number): number {
    return years * periodsPerYear;
  }

  /**
   * Calculate the interest rate per period based on the frequency of compounding.
   * @param interestRate
   * @param compoundingFrequency
   * @private
   */
  private getInterestRatePerPeriod(
    interestRate: number,
    compoundingFrequency: number
  ): number {
    return interestRate / compoundingFrequency;
  }

  /**
   * Calculate how often compounding should occur based on contribution and compounding frequencies.
   * @param contributionFrequency
   * @param compoundingFrequency
   * @private
   */
  private getHowOftenToCompound(
    contributionFrequency: number,
    compoundingFrequency: number
  ): number {
    if (contributionFrequency === CONTRIBUTION_FREQUENCY.YEARLY) {
      return compoundingFrequency;
    } else {
      if (compoundingFrequency >= contributionFrequency) {
        return Math.floor(compoundingFrequency / contributionFrequency);
      } else {
        return Math.ceil(contributionFrequency / compoundingFrequency);
      }
    }
  }

  /**
   * Calculate the compound multiplier based on contribution and compounding frequencies.
   * ex. If we contribute yearly, but compound monthly, then our compound multiplier would be 12.
   * @param contributionFrequency
   * @param compoundingFrequency
   * @private
   */
  private getCompoundMultiplier(
    contributionFrequency: number,
    compoundingFrequency: number
  ): number {
    if (contributionFrequency === CONTRIBUTION_FREQUENCY.YEARLY) {
      return 1;
    } else {
      return Math.min(1, compoundingFrequency / contributionFrequency);
    }
  }

  /**
   * Convert the balance to match contribution and compounding being the same.
   * @param balance
   * @param contributionFrequency
   * @param compoundingFrequency
   * @private
   */
  private convertBalanceBasedOnFrequency(
    balance: number,
    contributionFrequency: number,
    compoundingFrequency: number
  ): number {
    if (balance < 0) {
      return 0;
    } else {
      if (compoundingFrequency > contributionFrequency) {
        return (balance * compoundingFrequency) / contributionFrequency;
      } else if (contributionFrequency > compoundingFrequency) {
        return (
          balance / Math.floor(contributionFrequency / compoundingFrequency)
        );
      }
      return balance;
    }
  }

  /**
   * Determine the contribution needed at what frequency to reach a desired balance.
   * @param startingBalance
   * @param desiredBalance
   * @param years
   * @param interestRate
   * @param contributionFrequency
   * @param compoundingFrequency
   * @param inflationRate
   */
  public getContributionNeededForDesiredBalance(
    startingBalance: number,
    desiredBalance: number,
    years: number,
    interestRate: number,
    contributionFrequency: number,
    compoundingFrequency: number,
    inflationRate: number = 0.02
  ): DetermineContributionType {
    const periods: number = this.getTotalPeriods(years, compoundingFrequency);
    const interestRatePerPeriod: number = this.getInterestRatePerPeriod(
      interestRate,
      compoundingFrequency
    );
    const startingBalanceWithInterest: number = this.getInterestOverTime(
      startingBalance,
      interestRatePerPeriod,
      periods
    );
    const additionalContributionsInterestRate: number =
      this.getAdditionalContributionsTotalInterestMultiplier(
        interestRatePerPeriod,
        periods
      );
    const desiredBalanceWithInflation: number =
      this.adjustDesiredBalanceDueToInflation(
        desiredBalance,
        years,
        inflationRate
      );
    const desiredBalanceValueAfterInflation: number =
      this.getValueAfterInflation(desiredBalance, inflationRate, years);
    const contributionNeededPerPeriod: number =
      this.convertBalanceBasedOnFrequency(
        (desiredBalance - startingBalanceWithInterest) /
          additionalContributionsInterestRate,
        contributionFrequency,
        compoundingFrequency
      );
    const contributionNeededPerPeriodWithInflation: number =
      this.convertBalanceBasedOnFrequency(
        (desiredBalanceWithInflation - startingBalanceWithInterest) /
          additionalContributionsInterestRate,
        contributionFrequency,
        compoundingFrequency
      );

    return {
      contributionNeededPerPeriod,
      contributionNeededPerPeriodWithInflation,
      desiredBalance,
      desiredBalanceWithInflation,
      desiredBalanceValueAfterInflation,
    };
  }

  /**
   * Calculate compound interest with additional contributions made over a given period of time.
   *
   * @param {number} initialBalance - The initial balance.
   * @param {number} additionalContributionAmount - The additional contribution amount.
   * @param {number} years - The number of years.
   * @param {number} interestRate - The interest rate.
   * @param {number} contributionFrequency - The contribution frequency.
   * @param {number} compoundingFrequency - The compounding frequency.
   * @returns {CompoundingInterestObjectType} An object that contains the results, and a history.
   */
  public getCompoundInterestWithAdditionalContributions(
    initialBalance: number,
    additionalContributionAmount: number,
    years: number,
    interestRate: number,
    contributionFrequency: number,
    compoundingFrequency: number
  ): CompoundingInterestObjectType {
    const periods: number = this.getTotalPeriods(years, compoundingFrequency);
    const compoundMultiplier: number = this.getCompoundMultiplier(
      contributionFrequency,
      compoundingFrequency
    );
    const howOftenToCompound: number = this.getHowOftenToCompound(
      contributionFrequency,
      compoundingFrequency
    );
    let balance: number = initialBalance;
    const interestRatePerPeriod: number = this.getInterestRatePerPeriod(
      interestRate,
      compoundingFrequency
    );

    const compoundingPeriodDetails: CompoundingPeriodDetailsType[] = [];
    let totalContributions = 0;
    let totalInterestEarned = 0;

    for (let period = 1; period <= periods; period++) {
      // Add contribution(s) at the correct time
      if (period % howOftenToCompound === 0) {
        const contributionThisPeriod =
          additionalContributionAmount * compoundMultiplier;
        totalContributions += contributionThisPeriod;
        balance += contributionThisPeriod;
      }

      // Apply interest for each compounding period
      const interestEarnedThisPeriod = balance * interestRatePerPeriod;
      totalInterestEarned += interestEarnedThisPeriod;
      balance += interestEarnedThisPeriod;

      // Calculate balances from contributions and interest
      const balanceFromContributions = totalContributions;
      const balanceFromInterest = balance - totalContributions;

      compoundingPeriodDetails.push({
        period,
        balance,
        contributionTotal: totalContributions,
        interestTotal: totalInterestEarned,
        interestEarnedThisPeriod,
        balanceFromContributions,
        balanceFromInterest,
      });
    }

    return {
      balance,
      totalContributions,
      totalInterestEarned,
      years,
      contributionFrequency,
      compoundingFrequency,
      compoundingPeriodDetails,
    };
  }

  /**
   * Aggregates detailed compounding period data into yearly data.
   * This method is useful for visualizing the growth of an investment on an annual basis.
   *
   * @param {CompoundingInterestObjectType} compoundingDetails - The detailed compounding data from the interest calculation.
   * @returns {YearlyCompoundingDetails[]} An array of aggregated yearly data.
   */
  public aggregateDataByYear(
    compoundingDetails: CompoundingInterestObjectType
  ): YearlyCompoundingDetails[] {
    const yearlyData: YearlyCompoundingDetails[] = [];
    const compoundingPeriodDetails: CompoundingPeriodDetailsType[] =
      compoundingDetails.compoundingPeriodDetails;
    const compoundingFrequency: number =
      compoundingDetails.compoundingFrequency;

    // Initialize variables to track contributions and interest
    let cumulativeContributions: number = 0;
    let cumulativeInterest: number = 0;

    for (let year: number = 1; year <= compoundingDetails.years; year++) {
      const startPeriod: number = (year - 1) * compoundingFrequency + 1;
      const endPeriod: number = year * compoundingFrequency;

      for (let period: number = startPeriod; period <= endPeriod; period++) {
        const detail: CompoundingPeriodDetailsType | undefined =
          compoundingPeriodDetails[period - 1];
        if (typeof detail !== 'undefined') {
          // Calculate the contributions and interest for the year
          if (period === startPeriod) {
            // For the first period of the year, take the full cumulative amount
            cumulativeContributions = detail.contributionTotal;
            cumulativeInterest = detail.interestTotal;
          } else {
            // For subsequent periods, calculate the difference from the previous period
            cumulativeContributions +=
              detail.contributionTotal -
              compoundingPeriodDetails[period - 2].contributionTotal;
            cumulativeInterest +=
              detail.interestTotal -
              compoundingPeriodDetails[period - 2].interestTotal;
          }
        }
      }

      yearlyData.push({
        year,
        cumulativeContributions,
        cumulativeInterest,
        endOfYearBalance: compoundingPeriodDetails[endPeriod - 1].balance,
      });
    }

    return yearlyData;
  }
}
