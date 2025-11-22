import { CONTRIBUTION_FREQUENCY } from './constants/retirementCalculatorConstants';
import type {
  CompoundingInterestObjectType,
  CompoundingPeriodDetailsType,
  DetermineContributionType,
  YearlyCompoundingDetails,
  DynamicGlidepathConfig,
  ContributionTiming,
  DynamicGlidepathResult,
  MonthlyTimelineEntry,
  FixedReturnGlidepathConfig,
  SteppedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
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
   * Uses the geometric series formula for efficiency: sum = a(r^n - 1)/(r - 1)
   * @param interestRate
   * @param periods
   * @private
   */
  private getAdditionalContributionsTotalInterestMultiplier(
    interestRate: number,
    periods: number
  ): number {
    // Handle special case where interest rate is 0
    if (interestRate === 0) {
      return periods;
    }

    // Geometric series formula: sum of (1+r)^i from i=1 to n
    // This equals: ((1+r)^(n+1) - (1+r)) / r
    const r = 1 + interestRate;
    return (Math.pow(r, periods + 1) - r) / interestRate;
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

    // Calculate return metrics
    let effectiveAnnualReturn: number;

    // If no interest was earned, return 0% (growth is only from contributions, not returns)
    if (totalInterestEarned === 0) {
      effectiveAnnualReturn = 0;
    } else if (initialBalance === 0) {
      // When starting from 0, calculate return based on contributions instead
      effectiveAnnualReturn =
        totalContributions > 0
          ? Math.pow(balance / totalContributions, 1 / years) - 1
          : 0;
    } else {
      effectiveAnnualReturn = Math.pow(balance / initialBalance, 1 / years) - 1;
    }

    // Calculate average annual interest rate based on actual investment returns
    const totalInvested = initialBalance + totalContributions;
    const averageAnnualInterestRate =
      totalInvested > 0 && totalInterestEarned > 0
        ? totalInterestEarned / years / totalInvested
        : 0;

    return {
      balance,
      totalContributions,
      totalInterestEarned,
      years,
      contributionFrequency,
      compoundingFrequency,
      compoundingPeriodDetails,
      effectiveAnnualReturn,
      averageAnnualInterestRate,
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

  // ============================================================================
  // DYNAMIC GLIDEPATH METHODS
  // ============================================================================

  /**
   * Calculate compound interest with age-aware glidepath strategies.
   * Supports fixed returns, allocation-based strategies, and custom waypoints.
   *
   * @param initialBalance Starting account balance
   * @param contributionAmount Amount contributed per contribution period
   * @param startAge Starting age for calculation
   * @param endAge Ending age for calculation
   * @param glidepathConfig Strategy configuration (fixed, allocation-based, or custom)
   * @param contributionFrequency Number of contributions per year (default: 12)
   * @param compoundingFrequency Number of compounding periods per year (default: 12)
   * @param contributionTiming When contributions are added ('start' or 'end' of period)
   * @returns Detailed glidepath calculation results with timeline data
   */
  public getCompoundInterestWithGlidepath(
    initialBalance: number,
    contributionAmount: number,
    startAge: number,
    endAge: number,
    glidepathConfig: DynamicGlidepathConfig,
    contributionFrequency: number = 12,
    compoundingFrequency: number = 12,
    contributionTiming: ContributionTiming = 'start'
  ): DynamicGlidepathResult {
    // Input validation
    if (initialBalance < 0) {
      throw new Error('Initial balance must be non-negative');
    }

    if (contributionAmount < 0) {
      throw new Error('Contribution amount must be non-negative');
    }

    if (startAge <= 0 || endAge <= 0) {
      throw new Error('Ages must be positive');
    }

    if (startAge >= endAge) {
      throw new Error('Start age must be less than end age');
    }

    if (contributionFrequency <= 0 || compoundingFrequency <= 0) {
      throw new Error('Frequencies must be positive');
    }

    // Calculate simulation parameters
    const totalYears = endAge - startAge;
    const totalMonths = Math.ceil(totalYears * 12);

    // Initialize simulation state
    let balance = initialBalance;
    let totalContributions = 0;
    let totalInterestEarned = 0;

    const monthlyTimeline: MonthlyTimelineEntry[] = [];

    // Calculate compound multiplier and contribution timing
    const compoundMultiplier = this.getCompoundMultiplier(
      contributionFrequency,
      compoundingFrequency
    );
    const howOftenToCompound = this.getHowOftenToCompound(
      contributionFrequency,
      compoundingFrequency
    );

    // Monthly simulation loop
    for (let month = 1; month <= totalMonths; month++) {
      // Calculate current age
      const currentAge = startAge + (month - 1) / 12;

      // Get annual return rate for current age
      const annualReturnRate = this.calculateGlidepathReturn(
        currentAge,
        glidepathConfig,
        startAge,
        endAge
      );

      // Convert to monthly compounding rate
      const monthlyReturnRate =
        this.convertAnnualToMonthlyRate(annualReturnRate);

      // Handle contribution timing (match existing method logic)
      let contributionThisMonth = 0;
      if (month % howOftenToCompound === 0) {
        contributionThisMonth = contributionAmount * compoundMultiplier;
      }

      // Add contributions at start or end of month
      if (contributionTiming === 'start' && contributionThisMonth > 0) {
        balance += contributionThisMonth;
        totalContributions += contributionThisMonth;
      }

      // Apply monthly compounding
      const interestEarnedThisMonth = balance * monthlyReturnRate;
      balance += interestEarnedThisMonth;
      totalInterestEarned += interestEarnedThisMonth;

      // Add contributions at end of month
      if (contributionTiming === 'end' && contributionThisMonth > 0) {
        balance += contributionThisMonth;
        totalContributions += contributionThisMonth;
      }

      // Get current equity weight for timeline data
      const currentEquityWeight = this.getCurrentEquityWeight(
        currentAge,
        glidepathConfig,
        startAge,
        endAge
      );

      // Create timeline entry
      const timelineEntry: MonthlyTimelineEntry = {
        month,
        age: currentAge,
        currentBalance: balance,
        cumulativeContributions: totalContributions,
        cumulativeInterest: totalInterestEarned,
        monthlyInterestEarned: interestEarnedThisMonth,
        currentAnnualReturn: annualReturnRate,
        currentMonthlyReturn: monthlyReturnRate,
        currentEquityWeight,
      };

      monthlyTimeline.push(timelineEntry);
    }

    // Calculate summary statistics
    let effectiveAnnualReturn: number;

    // If no interest was earned, return 0% (growth is only from contributions, not returns)
    if (totalInterestEarned === 0) {
      effectiveAnnualReturn = 0;
    } else if (initialBalance === 0) {
      // When starting from 0, calculate return based on contributions instead
      effectiveAnnualReturn =
        totalContributions > 0
          ? Math.pow(balance / totalContributions, 1 / totalYears) - 1
          : 0;
    } else {
      effectiveAnnualReturn =
        Math.pow(balance / initialBalance, 1 / totalYears) - 1;
    }
    const averageMonthlyReturn =
      monthlyTimeline.reduce(
        (sum, entry) => sum + entry.currentMonthlyReturn,
        0
      ) / monthlyTimeline.length;

    // Calculate average annual interest rate based on actual investment returns
    // This isolates investment performance from contribution growth
    const totalInvested = initialBalance + totalContributions;
    const averageAnnualInterestRate =
      totalInvested > 0 && totalInterestEarned > 0
        ? totalInterestEarned / totalYears / totalInvested
        : 0;

    // Round final balance to nearest cent
    const finalBalance = Math.round(balance * 100) / 100;

    return {
      finalBalance,
      totalContributions,
      totalInterestEarned,
      totalMonths,
      startAge,
      endAge,
      glidepathMode: glidepathConfig.mode,
      monthlyTimeline,
      effectiveAnnualReturn,
      averageAnnualInterestRate,
      averageMonthlyReturn,
    };
  }

  /**
   * Calculate the annual return rate for a given age using the specified glidepath strategy.
   * @param age Current age for calculation
   * @param config Glidepath configuration
   * @param startAge Starting age for age-based calculations
   * @param endAge Ending age for age-based calculations
   * @returns Annual return rate (decimal format)
   * @private
   */
  private calculateGlidepathReturn(
    age: number,
    config: DynamicGlidepathConfig,
    startAge: number,
    endAge: number
  ): number {
    switch (config.mode) {
      case 'fixed-return':
        return this.calculateFixedReturnGlidepath(
          age,
          config,
          startAge,
          endAge
        );
      case 'stepped-return':
        return this.calculateSteppedReturnGlidepath(age, config);
      case 'allocation-based':
        return this.calculateAllocationBasedGlidepath(
          age,
          config,
          startAge,
          endAge
        );
      case 'custom-waypoints':
        return this.calculateCustomWaypointsGlidepath(age, config);
      default: {
        // TypeScript exhaustive check
        const _exhaustive: never = config;
        throw new Error(
          `Unsupported glidepath mode: ${JSON.stringify(_exhaustive)}`
        );
      }
    }
  }

  /**
   * Calculate linear interpolation progress between start and end ages.
   * @param age Current age
   * @param startAge Starting age
   * @param endAge Ending age
   * @returns Clamped progress value between 0 and 1
   * @private
   */
  private calculateAgeProgress(
    age: number,
    startAge: number,
    endAge: number
  ): number {
    const ageProgress = (age - startAge) / (endAge - startAge);
    return Math.max(0, Math.min(1, ageProgress));
  }

  /**
   * Calculate return for fixed-return glidepath (linear interpolation).
   * @param age Current age
   * @param config Fixed return configuration
   * @param startAge Starting age for calculation
   * @param endAge Ending age for calculation
   * @returns Annual return rate
   * @private
   */
  private calculateFixedReturnGlidepath(
    age: number,
    config: FixedReturnGlidepathConfig,
    startAge: number,
    endAge: number
  ): number {
    const progress = this.calculateAgeProgress(age, startAge, endAge);
    return (
      config.startReturn + (config.endReturn - config.startReturn) * progress
    );
  }

  /**
   * Calculate return for stepped-return glidepath (Money Guy style).
   * @param age Current age
   * @param config Stepped return configuration
   * @returns Annual return rate
   * @private
   */
  private calculateSteppedReturnGlidepath(
    age: number,
    config: SteppedReturnGlidepathConfig
  ): number {
    // Hold base return until decline start age
    if (age < config.declineStartAge) {
      return config.baseReturn;
    }

    // Hold terminal return after terminal age
    if (age >= config.terminalAge) {
      return config.terminalReturn;
    }

    // Linear decline between decline start and terminal age
    const yearsFromStart = age - config.declineStartAge;
    const calculatedReturn =
      config.baseReturn - yearsFromStart * config.declineRate;

    // Ensure we don't go below terminal return
    return Math.max(calculatedReturn, config.terminalReturn);
  }

  /**
   * Calculate return for allocation-based glidepath.
   * @param age Current age
   * @param config Allocation-based configuration
   * @param startAge Starting age for calculation
   * @param endAge Ending age for calculation
   * @returns Annual return rate
   * @private
   */
  private calculateAllocationBasedGlidepath(
    age: number,
    config: AllocationBasedGlidepathConfig,
    startAge: number,
    endAge: number
  ): number {
    const progress = this.calculateAgeProgress(age, startAge, endAge);

    const currentEquityWeight =
      config.startEquityWeight +
      (config.endEquityWeight - config.startEquityWeight) * progress;

    return this.calculateBlendedReturn(
      currentEquityWeight,
      config.equityReturn,
      config.bondReturn
    );
  }

  /**
   * Interpolate a value between waypoints for a given age.
   * @param age Current age
   * @param waypoints Array of waypoints (already sorted)
   * @returns Interpolated value at the given age
   * @private
   */
  private interpolateWaypoints(
    age: number,
    waypoints: Array<{ age: number; value: number }>
  ): number {
    if (waypoints.length === 0) {
      throw new Error('Waypoints array must contain at least one waypoint');
    }

    if (waypoints.length === 1) {
      return waypoints[0].value;
    }

    // Handle age outside waypoint range
    if (age <= waypoints[0].age) {
      return waypoints[0].value;
    }
    if (age >= waypoints[waypoints.length - 1].age) {
      return waypoints[waypoints.length - 1].value;
    }

    // Find surrounding waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (age >= waypoints[i].age && age <= waypoints[i + 1].age) {
        const lowerWaypoint = waypoints[i];
        const upperWaypoint = waypoints[i + 1];

        // Linear interpolation
        const ageProgress =
          (age - lowerWaypoint.age) / (upperWaypoint.age - lowerWaypoint.age);
        return (
          lowerWaypoint.value +
          (upperWaypoint.value - lowerWaypoint.value) * ageProgress
        );
      }
    }

    // Should never reach here, but return last waypoint value as fallback
    return waypoints[waypoints.length - 1].value;
  }

  /**
   * Calculate blended return based on equity and bond allocation.
   * @param equityWeight Equity allocation weight (0.0 to 1.0)
   * @param equityReturn Expected annual equity return
   * @param bondReturn Expected annual bond return
   * @returns Blended annual return rate
   * @private
   */
  private calculateBlendedReturn(
    equityWeight: number,
    equityReturn: number,
    bondReturn: number
  ): number {
    return equityWeight * equityReturn + (1 - equityWeight) * bondReturn;
  }

  /**
   * Calculate return for custom waypoints glidepath.
   * @param age Current age
   * @param config Custom waypoints configuration
   * @returns Annual return rate
   * @private
   */
  private calculateCustomWaypointsGlidepath(
    age: number,
    config: CustomWaypointsGlidepathConfig
  ): number {
    const waypoints = [...config.waypoints].sort((a, b) => a.age - b.age);

    if (waypoints.length === 0) {
      throw new Error(
        'Custom waypoints configuration must have at least one waypoint'
      );
    }

    const interpolatedValue = this.interpolateWaypoints(age, waypoints);

    // Convert to return rate based on value type
    if (config.valueType === 'return') {
      return interpolatedValue;
    } else {
      // equityWeight - blend with equity/bond returns
      const equityReturn = config.equityReturn ?? 0.1;
      const bondReturn = config.bondReturn ?? 0.04;
      return this.calculateBlendedReturn(
        interpolatedValue,
        equityReturn,
        bondReturn
      );
    }
  }

  /**
   * Get the current equity weight for allocation-based and custom waypoints configurations.
   * Used for timeline data enrichment.
   * @param age Current age
   * @param config Glidepath configuration
   * @param startAge Starting age for age-based calculations
   * @param endAge Ending age for age-based calculations
   * @returns Equity weight (0.0 to 1.0) or undefined for non-allocation modes
   * @private
   */
  private getCurrentEquityWeight(
    age: number,
    config: DynamicGlidepathConfig,
    startAge: number,
    endAge: number
  ): number | undefined {
    switch (config.mode) {
      case 'allocation-based': {
        const progress = this.calculateAgeProgress(age, startAge, endAge);
        return (
          config.startEquityWeight +
          (config.endEquityWeight - config.startEquityWeight) * progress
        );
      }
      case 'custom-waypoints': {
        if (config.valueType !== 'equityWeight') {
          return undefined;
        }
        const waypoints = [...config.waypoints].sort((a, b) => a.age - b.age);
        if (waypoints.length === 0) return undefined;

        return this.interpolateWaypoints(age, waypoints);
      }
      default:
        return undefined;
    }
  }

  /**
   * Convert annual interest rate to monthly compounding rate.
   * Formula: monthlyRate = (1 + annualRate)^(1/12) - 1
   * @param annualRate Annual interest rate (decimal)
   * @returns Monthly compounding rate (decimal)
   * @private
   */
  private convertAnnualToMonthlyRate(annualRate: number): number {
    return Math.pow(1 + annualRate, 1 / 12) - 1;
  }
}
