import {
  GLIDEPATH_DEFAULTS,
  GLIDEPATH_VALIDATION,
} from './constants/retirementCalculatorConstants';
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
   * Validate that a numeric input is a finite real number.
   * Rejects NaN, Infinity, -Infinity, and non-number types.
   * @private
   */
  private validateFiniteNumber(value: number, name: string): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number (got ${String(value)})`);
    }
  }

  /**
   * Validate that a numeric input is finite and non-negative (>= 0).
   * @private
   */
  private validateNonNegativeFinite(value: number, name: string): void {
    this.validateFiniteNumber(value, name);
    if (value < 0) {
      throw new Error(`${name} must be non-negative (got ${value})`);
    }
  }

  /**
   * Validate that a numeric input is finite and strictly positive (> 0).
   * @private
   */
  private validatePositiveFinite(value: number, name: string): void {
    this.validateFiniteNumber(value, name);
    if (value <= 0) {
      throw new Error(`${name} must be positive (got ${value})`);
    }
  }

  /**
   * Validate that a frequency is a positive whole number of events per year.
   * @private
   */
  private validateFrequency(value: number, name: string): void {
    this.validatePositiveFinite(value, name);
    if (!Number.isInteger(value)) {
      throw new Error(`${name} must be a whole number (got ${value})`);
    }
  }

  /**
   * Validate an annual return rate. A loss of 100% or more cannot be
   * converted to a periodic compounding rate, so it is rejected.
   * @private
   */
  private validateReturnRate(value: number, name: string): void {
    const { MIN_RETURN } = GLIDEPATH_VALIDATION.RETURNS;
    this.validateFiniteNumber(value, name);
    if (value < MIN_RETURN) {
      throw new Error(`${name} must be at least ${MIN_RETURN} (got ${value})`);
    }
  }

  /**
   * Validate a nominal interest rate against its compounding frequency.
   * The rate per compounding period must stay above -100%.
   * @private
   */
  private validateInterestRate(
    interestRate: number,
    compoundingFrequency: number
  ): void {
    this.validateFiniteNumber(interestRate, 'interestRate');
    if (interestRate / compoundingFrequency <= -1) {
      throw new Error(
        `interestRate must be greater than -100% per compounding period (got ${interestRate})`
      );
    }
  }

  /**
   * Validate an inflation rate. At -100% or below, deflating a balance
   * divides by zero or a negative base.
   * @private
   */
  private validateInflationRate(inflationRate: number): void {
    this.validateFiniteNumber(inflationRate, 'inflationRate');
    if (inflationRate <= -1) {
      throw new Error(
        `inflationRate must be greater than -1 (got ${inflationRate})`
      );
    }
  }

  /**
   * Validate that a numeric input is finite and within [MIN_WEIGHT, MAX_WEIGHT].
   * Used for equity allocation weights (typically [0, 1]).
   * @private
   */
  private validateEquityWeight(value: number, name: string): void {
    const { MIN_WEIGHT, MAX_WEIGHT } = GLIDEPATH_VALIDATION.ALLOCATIONS;
    this.validateFiniteNumber(value, name);
    if (value < MIN_WEIGHT || value > MAX_WEIGHT) {
      throw new Error(
        `${name} must be between ${MIN_WEIGHT} and ${MAX_WEIGHT} (got ${value})`
      );
    }
  }

  /**
   * Validate a DynamicGlidepathConfig against GLIDEPATH_VALIDATION constraints.
   * Mode-dispatched; throws a descriptive Error for any invariant violation.
   * @private
   */
  private validateGlidepathConfig(config: DynamicGlidepathConfig): void {
    const { WAYPOINTS } = GLIDEPATH_VALIDATION;

    switch (config.mode) {
      case 'fixed-return':
        this.validateReturnRate(config.startReturn, 'config.startReturn');
        this.validateReturnRate(config.endReturn, 'config.endReturn');
        return;
      case 'stepped-return':
        this.validateReturnRate(config.baseReturn, 'config.baseReturn');
        this.validateReturnRate(config.terminalReturn, 'config.terminalReturn');
        this.validateFiniteNumber(config.declineRate, 'config.declineRate');
        this.validatePositiveFinite(
          config.declineStartAge,
          'config.declineStartAge'
        );
        this.validatePositiveFinite(config.terminalAge, 'config.terminalAge');
        if (config.declineStartAge > config.terminalAge) {
          throw new Error(
            'config.declineStartAge must be <= config.terminalAge'
          );
        }
        return;
      case 'allocation-based':
        this.validateEquityWeight(
          config.startEquityWeight,
          'config.startEquityWeight'
        );
        this.validateEquityWeight(
          config.endEquityWeight,
          'config.endEquityWeight'
        );
        this.validateReturnRate(config.equityReturn, 'config.equityReturn');
        this.validateReturnRate(config.bondReturn, 'config.bondReturn');
        return;
      case 'custom-waypoints':
        if (
          !Array.isArray(config.waypoints) ||
          config.waypoints.length < WAYPOINTS.MIN_WAYPOINTS
        ) {
          throw new Error(
            `config.waypoints must contain at least ${WAYPOINTS.MIN_WAYPOINTS} waypoint(s)`
          );
        }
        if (config.waypoints.length > WAYPOINTS.MAX_WAYPOINTS) {
          throw new Error(
            `config.waypoints exceeds maximum of ${WAYPOINTS.MAX_WAYPOINTS} entries`
          );
        }
        for (const wp of config.waypoints) {
          this.validatePositiveFinite(wp.age, 'waypoint.age');
          this.validateFiniteNumber(wp.value, 'waypoint.value');
          if (config.valueType === 'equityWeight') {
            this.validateEquityWeight(wp.value, 'waypoint.value');
          } else {
            this.validateReturnRate(wp.value, 'waypoint.value');
          }
        }
        if (config.equityReturn !== undefined) {
          this.validateReturnRate(config.equityReturn, 'config.equityReturn');
        }
        if (config.bondReturn !== undefined) {
          this.validateReturnRate(config.bondReturn, 'config.bondReturn');
        }
        return;
      default: {
        const _exhaustive: never = config;
        throw new Error(
          `Unsupported glidepath mode: ${JSON.stringify(_exhaustive)}`
        );
      }
    }
  }

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
    this.validateNonNegativeFinite(desiredBalance, 'desiredBalance');
    this.validateNonNegativeFinite(years, 'years');
    this.validateInflationRate(inflationRate);
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
    this.validateNonNegativeFinite(yearlySpend, 'yearlySpend');
    this.validatePositiveFinite(yearlyWithdrawalRate, 'yearlyWithdrawalRate');
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
    this.validateNonNegativeFinite(balance, 'balance');
    this.validateNonNegativeFinite(
      yearlyWithdrawalRate,
      'yearlyWithdrawalRate'
    );
    return balance * yearlyWithdrawalRate;
  }

  /**
   * Calculate the total number of periods based on years and periods per year.
   * May be fractional when the years do not end on a period boundary; values
   * within rounding error of a whole number are snapped to it.
   * @param years
   * @param periodsPerYear
   * @private
   */
  private getTotalPeriods(years: number, periodsPerYear: number): number {
    const periods: number = years * periodsPerYear;
    const nearest: number = Math.round(periods);
    return Math.abs(periods - nearest) < 1e-9 ? nearest : periods;
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
   * Compute the time-weighted annual return from a sequence of periodic returns.
   *
   * Formula: TWR = (product of (1 + r_i))^(periodsPerYear / n) - 1
   *
   * TWR isolates investment performance from contribution timing and is the
   * standard metric for comparing portfolio performance to a benchmark
   * (e.g., the S&P 500 over the same window).
   *
   * @private
   */
  private calculateTimeWeightedReturn(
    periodicReturnRates: number[],
    periodsPerYear: number
  ): number {
    if (periodicReturnRates.length === 0) return 0;
    let product = 1;
    for (const r of periodicReturnRates) {
      product *= 1 + r;
    }
    // Catastrophic loss case (>= 100% loss in any combined window): return -1.
    if (product <= 0) return -1;
    return Math.pow(product, periodsPerYear / periodicReturnRates.length) - 1;
  }

  /**
   * Compute the money-weighted annual return (internal rate of return).
   *
   * Finds the single periodic rate i that grows every deposit to the final
   * balance: sum(amount_k * (1 + i)^periodsInvested_k) = finalBalance. Unlike
   * the time-weighted return, this weights each period's return by how much
   * money was invested during it.
   *
   * The left-hand side increases with i, so the root is found by bisection.
   *
   * @private
   */
  private calculateMoneyWeightedReturn(
    deposits: { amount: number; periodsInvested: number }[],
    finalBalance: number,
    periodsPerYear: number
  ): number {
    const totalDeposited: number = deposits.reduce(
      (sum, deposit) => sum + deposit.amount,
      0
    );
    if (totalDeposited <= 0) return 0;
    // With no deposit invested for at least one period the rate is
    // indeterminate; report 0 rather than letting the search drift to -100%.
    const hasInvestedDeposit: boolean = deposits.some(
      (deposit) => deposit.amount > 0 && deposit.periodsInvested > 0
    );
    if (!hasInvestedDeposit) return 0;
    // Nothing gained or lost: exactly 0, not a root within rounding of it.
    if (finalBalance === totalDeposited) return 0;
    if (finalBalance <= 0) return -1;

    const futureValueAt = (rate: number): number =>
      deposits.reduce(
        (sum, deposit) =>
          sum + deposit.amount * Math.pow(1 + rate, deposit.periodsInvested),
        0
      );

    let low: number = -1;
    let high: number = 1;
    while (futureValueAt(high) < finalBalance && high < 1e6) {
      high *= 2;
    }
    for (let i = 0; i < 200 && high - low > Number.EPSILON; i++) {
      const mid: number = (low + high) / 2;
      if (futureValueAt(mid) < finalBalance) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return Math.pow(1 + (low + high) / 2, periodsPerYear) - 1;
  }

  /**
   * Count the contributions that fall due during a span of periods.
   *
   * Contribution k falls due k / contributionFrequency years in, so the number
   * due by the end of period p is floor(p * contributionFrequency /
   * periodsPerYear). Differencing the two ends of the span gives an exact
   * schedule for any pair of whole-number frequencies: yearly contributions on
   * a monthly grid land in every 12th period, and weekly contributions land 4
   * or 5 to a month, totalling 52 a year.
   *
   * @param periodStart Periods elapsed at the start of the span
   * @param periodEnd Periods elapsed at the end of the span (may be fractional)
   * @private
   */
  private getContributionsDueBetween(
    periodStart: number,
    periodEnd: number,
    contributionFrequency: number,
    periodsPerYear: number
  ): number {
    // The tolerance keeps a contribution due exactly at a fractional end from
    // being lost to rounding; whole-number ends are unaffected.
    const dueBy = (periodsElapsed: number): number =>
      Math.floor(
        (periodsElapsed * contributionFrequency) / periodsPerYear + 1e-9
      );
    return dueBy(periodEnd) - dueBy(periodStart);
  }

  /**
   * Determine the amount to contribute, at the given contribution frequency,
   * to reach a desired balance. Feeding the result back into
   * getCompoundInterestWithAdditionalContributions reproduces the target.
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
    this.validateNonNegativeFinite(startingBalance, 'startingBalance');
    this.validateNonNegativeFinite(desiredBalance, 'desiredBalance');
    this.validatePositiveFinite(years, 'years');
    this.validateFrequency(contributionFrequency, 'contributionFrequency');
    this.validateFrequency(compoundingFrequency, 'compoundingFrequency');
    this.validateInterestRate(interestRate, compoundingFrequency);
    this.validateInflationRate(inflationRate);

    const desiredBalanceWithInflation: number =
      this.adjustDesiredBalanceDueToInflation(
        desiredBalance,
        years,
        inflationRate
      );
    const desiredBalanceValueAfterInflation: number =
      this.getValueAfterInflation(desiredBalance, inflationRate, years);

    // The final balance is linear in the contribution amount, so two
    // projections are enough to solve for it exactly:
    //   balance(c) = balanceWithoutContributions + c * balancePerUnitContributed
    const project = (initialBalance: number, contribution: number): number =>
      this.getCompoundInterestWithAdditionalContributions(
        initialBalance,
        contribution,
        years,
        interestRate,
        contributionFrequency,
        compoundingFrequency
      ).balance;
    const balanceWithoutContributions: number = project(startingBalance, 0);
    const balancePerUnitContributed: number = project(0, 1);

    const contributionNeededFor = (targetBalance: number): number => {
      const shortfall: number = targetBalance - balanceWithoutContributions;
      if (shortfall <= 0) return 0;
      if (balancePerUnitContributed <= 0) {
        throw new Error(
          `No contribution is credited within ${years} year(s) at these frequencies, so the desired balance cannot be reached`
        );
      }
      return shortfall / balancePerUnitContributed;
    };

    return {
      contributionNeededPerPeriod: contributionNeededFor(desiredBalance),
      contributionNeededPerPeriodWithInflation: contributionNeededFor(
        desiredBalanceWithInflation
      ),
      desiredBalance,
      desiredBalanceWithInflation,
      desiredBalanceValueAfterInflation,
    };
  }

  /**
   * Calculate compound interest with additional contributions made over a given period of time.
   *
   * Contributions are credited at the start of the compounding period in which
   * they fall due, so each earns interest for that period.
   *
   * @param {number} initialBalance - The initial balance.
   * @param {number} additionalContributionAmount - The amount of each contribution.
   * @param {number} years - The number of years. If this does not end on a compounding boundary, the remainder runs as a final partial period earning simple interest.
   * @param {number} interestRate - The nominal annual interest rate; each period earns interestRate / compoundingFrequency.
   * @param {number} contributionFrequency - Contributions per year (whole number).
   * @param {number} compoundingFrequency - Compounding periods per year (whole number).
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
    // Input validation
    this.validateNonNegativeFinite(initialBalance, 'initialBalance');
    this.validateNonNegativeFinite(
      additionalContributionAmount,
      'additionalContributionAmount'
    );
    this.validatePositiveFinite(years, 'years');
    this.validateFrequency(contributionFrequency, 'contributionFrequency');
    this.validateFrequency(compoundingFrequency, 'compoundingFrequency');
    this.validateInterestRate(interestRate, compoundingFrequency);

    // When the years do not end on a compounding boundary, the leftover
    // fraction runs as a final partial period earning simple interest.
    const totalPeriods: number = this.getTotalPeriods(
      years,
      compoundingFrequency
    );
    const fullPeriods: number = Math.floor(totalPeriods);
    const partialPeriod: number = totalPeriods - fullPeriods;
    const periodCount: number =
      partialPeriod > 0 ? fullPeriods + 1 : fullPeriods;
    let balance: number = initialBalance;
    const interestRatePerPeriod: number = this.getInterestRatePerPeriod(
      interestRate,
      compoundingFrequency
    );

    const compoundingPeriodDetails: CompoundingPeriodDetailsType[] = [];
    let totalContributions = 0;
    let totalInterestEarned = 0;

    for (let period = 1; period <= periodCount; period++) {
      const isPartialPeriod: boolean = period > fullPeriods;

      // Add the contribution(s) that fall due in this period
      const contributionThisPeriod: number =
        additionalContributionAmount *
        this.getContributionsDueBetween(
          period - 1,
          isPartialPeriod ? totalPeriods : period,
          contributionFrequency,
          compoundingFrequency
        );
      totalContributions += contributionThisPeriod;
      balance += contributionThisPeriod;

      // Apply interest for each compounding period
      const interestEarnedThisPeriod =
        balance * interestRatePerPeriod * (isPartialPeriod ? partialPeriod : 1);
      totalInterestEarned += interestEarnedThisPeriod;
      balance += interestEarnedThisPeriod;

      // Split the balance into contributions and interest. The initial
      // balance belongs to neither.
      const balanceFromContributions = totalContributions;
      const balanceFromInterest = totalInterestEarned;

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

    // averageAnnualInterestRate is the time-weighted return; for a constant
    // per-period rate this reduces to the closed-form EAR of that rate. The
    // money-weighted return is identical at a constant rate, so it is not
    // reported separately here.
    const averageAnnualInterestRate =
      Math.pow(1 + interestRatePerPeriod, compoundingFrequency) - 1;

    return {
      balance,
      totalContributions,
      totalInterestEarned,
      years,
      contributionFrequency,
      compoundingFrequency,
      compoundingPeriodDetails,
      averageAnnualInterestRate,
    };
  }

  /**
   * Aggregates detailed compounding period data into yearly data.
   * This method is useful for visualizing the growth of an investment on an annual basis.
   *
   * @param {CompoundingInterestObjectType} compoundingDetails - The detailed compounding data from the interest calculation.
   * @returns {YearlyCompoundingDetails[]} An array of aggregated yearly data. If the calculation ended part-way through a year, the last row covers that partial year.
   */
  public aggregateDataByYear(
    compoundingDetails: CompoundingInterestObjectType
  ): YearlyCompoundingDetails[] {
    const yearlyData: YearlyCompoundingDetails[] = [];
    const compoundingPeriodDetails: CompoundingPeriodDetailsType[] =
      compoundingDetails.compoundingPeriodDetails;
    const compoundingFrequency: number =
      compoundingDetails.compoundingFrequency;

    // A final partial year gets its own row, ending at the last period.
    const yearCount: number = Math.ceil(
      compoundingPeriodDetails.length / compoundingFrequency
    );

    for (let year: number = 1; year <= yearCount; year++) {
      const endPeriod: number = Math.min(
        year * compoundingFrequency,
        compoundingPeriodDetails.length
      );
      const detail: CompoundingPeriodDetailsType =
        compoundingPeriodDetails[endPeriod - 1];

      yearlyData.push({
        year,
        cumulativeContributions: detail.contributionTotal,
        cumulativeInterest: detail.interestTotal,
        endOfYearBalance: detail.balance,
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
   * @param contributionFrequency Number of contributions per year (default: 12).
   *   Contributions are placed in the month in which they fall due.
   * @param compoundingFrequency How many times a year earned interest is
   *   credited to the balance (default: 12). The simulation steps monthly and
   *   treats returns as effective annual rates, so values above 12 behave
   *   exactly like 12. Below 12, interest accrues monthly on the credited
   *   balance and is added to it at the end of each compounding period (or
   *   at the end of the simulation, if that comes first).
   * @param contributionTiming When contributions are added ('start' or 'end' of the month)
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
    this.validateNonNegativeFinite(initialBalance, 'initialBalance');
    this.validateNonNegativeFinite(contributionAmount, 'contributionAmount');
    this.validatePositiveFinite(startAge, 'startAge');
    this.validatePositiveFinite(endAge, 'endAge');
    if (startAge >= endAge) {
      throw new Error('startAge must be less than endAge');
    }
    this.validateFrequency(contributionFrequency, 'contributionFrequency');
    this.validateFrequency(compoundingFrequency, 'compoundingFrequency');
    this.validateGlidepathConfig(glidepathConfig);

    // Calculate simulation parameters
    const totalYears = endAge - startAge;
    const totalMonths = Math.ceil(totalYears * 12);

    // Pre-sort waypoints once if using custom-waypoints mode
    // This avoids sorting on every iteration of the monthly loop
    const normalizedConfig = this.normalizeGlidepathConfig(glidepathConfig);

    // Initialize simulation state
    let balance = initialBalance;
    let totalContributions = 0;
    let totalInterestEarned = 0;

    const monthlyTimeline: MonthlyTimelineEntry[] = [];

    // Interest is credited at most monthly on this grid. Until it is credited
    // it sits in accruedInterest and does not itself earn interest.
    const creditsPerYear = Math.min(compoundingFrequency, 12);
    let accruedInterest = 0;
    // A notional lump sum run through the same accrual and crediting model.
    // Its monthly growth is the strategy's return, free of contribution effects.
    let unitBalance = 1;
    let unitAccruedInterest = 0;
    const deposits: { amount: number; periodsInvested: number }[] = [
      { amount: initialBalance, periodsInvested: totalMonths },
    ];

    // Monthly simulation loop
    for (let month = 1; month <= totalMonths; month++) {
      // Calculate current age
      const currentAge = startAge + (month - 1) / 12;

      // Get annual return rate for current age
      const annualReturnRate = this.calculateGlidepathReturn(
        currentAge,
        normalizedConfig,
        startAge,
        endAge
      );

      // Rate for this compounding period, sized to the months it actually
      // spans (periods are uneven when the frequency does not divide 12) and
      // spread evenly over them
      const monthsInPeriod = this.getMonthsInCompoundingPeriod(
        month,
        creditsPerYear
      );
      const accrualRate =
        this.convertAnnualToPeriodicRate(
          annualReturnRate,
          12 / monthsInPeriod
        ) / monthsInPeriod;

      // The strategy's return this month: growth of the notional lump sum,
      // whose uncredited interest earns nothing
      const monthlyReturnRate =
        accrualRate * (unitBalance / (unitBalance + unitAccruedInterest));
      unitAccruedInterest += unitBalance * accrualRate;

      const contributionThisMonth =
        contributionAmount *
        this.getContributionsDueBetween(
          month - 1,
          month,
          contributionFrequency,
          12
        );

      // Add contributions at start of month
      if (contributionTiming === 'start' && contributionThisMonth > 0) {
        balance += contributionThisMonth;
        totalContributions += contributionThisMonth;
        deposits.push({
          amount: contributionThisMonth,
          periodsInvested: totalMonths - month + 1,
        });
      }

      // Accrue this month's interest, and credit it when a compounding
      // period ends (or the simulation does)
      const interestEarnedThisMonth = balance * accrualRate;
      accruedInterest += interestEarnedThisMonth;
      totalInterestEarned += interestEarnedThisMonth;
      if (
        this.getContributionsDueBetween(month - 1, month, creditsPerYear, 12) >
          0 ||
        month === totalMonths
      ) {
        balance += accruedInterest;
        accruedInterest = 0;
        unitBalance += unitAccruedInterest;
        unitAccruedInterest = 0;
      }

      // Add contributions at end of month
      if (contributionTiming === 'end' && contributionThisMonth > 0) {
        balance += contributionThisMonth;
        totalContributions += contributionThisMonth;
        deposits.push({
          amount: contributionThisMonth,
          periodsInvested: totalMonths - month,
        });
      }

      // Get current equity weight for timeline data
      const currentEquityWeight = this.getCurrentEquityWeight(
        currentAge,
        normalizedConfig,
        startAge,
        endAge
      );

      // Create timeline entry
      const timelineEntry: MonthlyTimelineEntry = {
        month,
        age: currentAge,
        currentBalance: balance + accruedInterest,
        cumulativeContributions: totalContributions,
        cumulativeInterest: totalInterestEarned,
        monthlyInterestEarned: interestEarnedThisMonth,
        currentAnnualReturn: annualReturnRate,
        currentMonthlyReturn: monthlyReturnRate,
        currentEquityWeight,
      };

      monthlyTimeline.push(timelineEntry);
    }

    // Calculate summary statistics.
    // averageAnnualInterestRate is the time-weighted annual return computed
    // from the path of monthly returns — isolates investment performance
    // from contribution timing.
    const monthlyReturnRates = monthlyTimeline.map(
      (entry) => entry.currentMonthlyReturn
    );
    const averageAnnualInterestRate = this.calculateTimeWeightedReturn(
      monthlyReturnRates,
      12
    );

    const moneyWeightedAnnualReturn = this.calculateMoneyWeightedReturn(
      deposits,
      balance,
      12
    );

    const averageMonthlyReturn =
      monthlyTimeline.reduce(
        (sum, entry) => sum + entry.currentMonthlyReturn,
        0
      ) / monthlyTimeline.length;

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
      moneyWeightedAnnualReturn,
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
    waypoints: { age: number; value: number }[]
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
    // Waypoints are pre-sorted by normalizeGlidepathConfig
    const waypoints = config.waypoints;

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
      // equityWeight - blend with equity/bond returns.
      // Defaults reconciled with GLIDEPATH_DEFAULTS.ALLOCATION_BASED so callers
      // who omit returns get the same blend as the allocation-based mode.
      const equityReturn =
        config.equityReturn ??
        GLIDEPATH_DEFAULTS.ALLOCATION_BASED.EQUITY_RETURN;
      const bondReturn =
        config.bondReturn ?? GLIDEPATH_DEFAULTS.ALLOCATION_BASED.BOND_RETURN;
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
        // Waypoints are pre-sorted by normalizeGlidepathConfig
        const waypoints = config.waypoints;
        if (waypoints.length === 0) return undefined;

        return this.interpolateWaypoints(age, waypoints);
      }
      default:
        return undefined;
    }
  }

  /**
   * Number of months in the compounding period that contains a given month.
   *
   * Credit j lands in month ceil(12 * j / creditsPerYear), so periods are all
   * 12 / creditsPerYear months long when that divides evenly, and a mix of
   * the two nearest whole lengths otherwise (e.g. 2 and 3 months for 5 a year).
   * @private
   */
  private getMonthsInCompoundingPeriod(
    month: number,
    creditsPerYear: number
  ): number {
    const creditsBefore = Math.floor(((month - 1) * creditsPerYear) / 12);
    return (
      Math.ceil((12 * (creditsBefore + 1)) / creditsPerYear) -
      Math.ceil((12 * creditsBefore) / creditsPerYear)
    );
  }

  /**
   * Convert an effective annual rate to the equivalent rate per period.
   * Formula: periodicRate = (1 + annualRate)^(1/periodsPerYear) - 1
   * @param annualRate Effective annual rate (decimal)
   * @param periodsPerYear Number of compounding periods per year
   * @returns Rate per period (decimal)
   * @private
   */
  private convertAnnualToPeriodicRate(
    annualRate: number,
    periodsPerYear: number
  ): number {
    return Math.pow(1 + annualRate, 1 / periodsPerYear) - 1;
  }

  /**
   * Normalize glidepath config by pre-sorting waypoints if applicable.
   * This optimization avoids repeated sorting during monthly simulation loops.
   * @param config Original glidepath configuration
   * @returns Configuration with sorted waypoints (if custom-waypoints mode)
   * @private
   */
  private normalizeGlidepathConfig(
    config: DynamicGlidepathConfig
  ): DynamicGlidepathConfig {
    if (config.mode !== 'custom-waypoints') {
      return config;
    }

    return {
      ...config,
      waypoints: [...config.waypoints].sort((a, b) => a.age - b.age),
    };
  }
}
