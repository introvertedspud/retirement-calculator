/**
 * Object representing contribution frequency options.
 * @interface
 */
export interface ContributionFrequencyType {
  /**
   * Yearly contribution frequency.
   * @type {number}
   */
  YEARLY: number;

  /**
   * Monthly contribution frequency.
   * @type {number}
   */
  MONTHLY: number;

  /**
   * Weekly contribution frequency.
   * @type {number}
   */
  WEEKLY: number;
}

/**
 * Object representing the details needed to determine contributions.
 * @interface
 */
export interface DetermineContributionType {
  /**
   * Contribution needed per period.
   * @type {number}
   */
  contributionNeededPerPeriod: number;

  /**
   * Contribution needed per period with inflation.
   * @type {number}
   */
  contributionNeededPerPeriodWithInflation: number;

  /**
   * Desired balance.
   * @type {number}
   */
  desiredBalance: number;

  /**
   * Desired balance with inflation.
   * @type {number}
   */
  desiredBalanceWithInflation: number;

  /**
   * Desired balance value after inflation.
   * @type {number}
   */
  desiredBalanceValueAfterInflation: number;
}

/**
 * Represents the details of a single compounding period in the compound interest calculation.
 * This includes information on the total balance, contributions, and interest for each period.
 *
 * @interface CompoundingPeriodDetailsType
 * @property {number} period - The specific compounding period, starting from 1.
 * @property {number} balance - The total balance at the end of this compounding period.
 * @property {number} contributionTotal - The cumulative total of contributions made up to this period.
 * @property {number} interestTotal - The cumulative total of interest earned up to this period.
 * @property {number} interestEarnedThisPeriod - The amount of interest earned during this specific period.
 * @property {number} balanceFromContributions - The portion of the current balance attributable to contributions.
 * @property {number} balanceFromInterest - The portion of the current balance attributable to accumulated interest.
 */
export interface CompoundingPeriodDetailsType {
  period: number;
  balance: number;
  contributionTotal: number;
  interestTotal: number;
  interestEarnedThisPeriod: number;
  balanceFromContributions: number;
  balanceFromInterest: number;
}

/**
 * Object representing compounding interest calculations.
 * @interface
 */
export interface CompoundingInterestObjectType {
  /**
   * Balance amount.
   * @type {number}
   */
  balance: number;

  /**
   * Total contributions made.
   * @type {number}
   */
  totalContributions: number;

  /**
   * Total interest earned.
   * @type {number}
   */
  totalInterestEarned: number;

  /**
   * Number of years.
   * @type {number}
   */
  years: number;

  /**
   * Contribution frequency.
   * @type {number}
   */
  contributionFrequency: number;

  /**
   * Compounding frequency.
   * @type {number}
   */
  compoundingFrequency: number;

  /**
   * Compounding period details.
   * @type {CompoundingPeriodDetailsType[]}
   */
  compoundingPeriodDetails: CompoundingPeriodDetailsType[];
}

/**
 * Represents the aggregated data for a single year in the compound interest calculation.
 * @interface YearlyCompoundingDetails
 */
export interface YearlyCompoundingDetails {
  /**
   * The year number starting from 1.
   * @type {number}
   */
  year: number;

  /**
   * The cumulative total contributions made up to the end of the year.
   * @type {number}
   */
  cumulativeContributions: number;

  /**
   * The cumulative total interest earned up to the end of the year.
   * @type {number}
   */
  cumulativeInterest: number;

  /**
   * The balance at the end of the year.
   * @type {number}
   */
  endOfYearBalance: number;
}
