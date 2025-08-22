/**
 * Object representing contribution frequency options.
 * @interface
 */
export type ContributionFrequencyType = {
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
};

/**
 * Object representing the details needed to determine contributions.
 * @interface
 */
export type DetermineContributionType = {
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
};

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
export type CompoundingPeriodDetailsType = {
  period: number;
  balance: number;
  contributionTotal: number;
  interestTotal: number;
  interestEarnedThisPeriod: number;
  balanceFromContributions: number;
  balanceFromInterest: number;
};

/**
 * Object representing compounding interest calculations.
 * @interface
 */
export type CompoundingInterestObjectType = {
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
};

/**
 * Represents the aggregated data for a single year in the compound interest calculation.
 * @interface YearlyCompoundingDetails
 */
export type YearlyCompoundingDetails = {
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
};

// ============================================================================
// DYNAMIC GLIDEPATH TYPE DEFINITIONS
// ============================================================================

/**
 * Defines when monthly contributions are added within each month.
 * - 'start': Add contribution first, then apply interest
 * - 'end': Apply interest first, then add contribution
 */
export type ContributionTiming = 'start' | 'end';

/**
 * Identifies the type of glidepath strategy being used.
 */
export type GlidepathMode =
  | 'fixed-return'
  | 'allocation-based'
  | 'custom-waypoints'
  | 'stepped-return';

// ============================================================================
// GLIDEPATH CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for fixed return glidepath that linearly interpolates
 * between start and end return rates based on age.
 *
 * Use case: Target-date funds that reduce returns as retirement approaches
 *
 * @example
 * ```typescript
 * const config: FixedReturnGlidepathConfig = {
 *   mode: 'fixed-return',
 *   startReturn: 0.10,  // 10% at starting age
 *   endReturn: 0.055    // 5.5% at ending age
 * };
 * ```
 */
export type FixedReturnGlidepathConfig = {
  /**
   * Discriminator for the glidepath configuration type.
   */
  mode: 'fixed-return';

  /**
   * Annual return rate at the starting age (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.10 represents 10% annual return
   */
  startReturn: number;

  /**
   * Annual return rate at the ending age (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.055 represents 5.5% annual return
   */
  endReturn: number;
};

/**
 * Configuration for allocation-based glidepath that blends equity and bond returns
 * based on linearly interpolated equity allocation by age.
 *
 * Use case: Age-based asset allocation strategies (e.g., "120 minus age" rule)
 *
 * @example
 * ```typescript
 * const config: AllocationBasedGlidepathConfig = {
 *   mode: 'allocation-based',
 *   startEquityWeight: 0.90,  // 90% equity at start
 *   endEquityWeight: 0.30,    // 30% equity at end
 *   equityReturn: 0.12,       // 12% equity returns
 *   bondReturn: 0.04          // 4% bond returns
 * };
 * ```
 */
export type AllocationBasedGlidepathConfig = {
  /**
   * Discriminator for the glidepath configuration type.
   */
  mode: 'allocation-based';

  /**
   * Equity allocation percentage at starting age (0.0 to 1.0).
   *
   * @example 0.90 represents 90% equity allocation
   */
  startEquityWeight: number;

  /**
   * Equity allocation percentage at ending age (0.0 to 1.0).
   *
   * @example 0.30 represents 30% equity allocation
   */
  endEquityWeight: number;

  /**
   * Expected annual return for equity portion (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.12 represents 12% annual equity return
   */
  equityReturn: number;

  /**
   * Expected annual return for bond portion (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.04 represents 4% annual bond return
   */
  bondReturn: number;
};

/**
 * Represents a single waypoint in a custom glidepath configuration.
 *
 * @example
 * ```typescript
 * const waypoint: GlidepathWaypoint = {
 *   age: 35,
 *   value: 0.08  // 8% return or 80% equity weight, depending on valueType
 * };
 * ```
 */
export type GlidepathWaypoint = {
  /**
   * Age at which this waypoint applies.
   * Must be positive.
   */
  age: number;

  /**
   * Value at this waypoint.
   * - If valueType is 'return': annual return rate (must be > -1.0)
   * - If valueType is 'equityWeight': equity allocation percentage (0.0 to 1.0)
   */
  value: number;
};

/**
 * Configuration for custom waypoints glidepath that uses user-defined
 * age/value pairs with linear interpolation between points.
 *
 * Use case: Custom investment strategies with specific target allocations or returns at key ages
 *
 * @example Return-based waypoints
 * ```typescript
 * const config: CustomWaypointsGlidepathConfig = {
 *   mode: 'custom-waypoints',
 *   valueType: 'return',
 *   waypoints: [
 *     { age: 25, value: 0.12 },  // 12% at 25
 *     { age: 40, value: 0.08 },  // 8% at 40
 *     { age: 65, value: 0.05 }   // 5% at 65
 *   ]
 * };
 * ```
 *
 * @example Equity allocation waypoints
 * ```typescript
 * const config: CustomWaypointsGlidepathConfig = {
 *   mode: 'custom-waypoints',
 *   valueType: 'equityWeight',
 *   waypoints: [
 *     { age: 20, value: 1.0 },   // 100% equity at 20
 *     { age: 35, value: 0.8 },   // 80% equity at 35
 *     { age: 50, value: 0.6 },   // 60% equity at 50
 *     { age: 65, value: 0.3 }    // 30% equity at 65
 *   ],
 *   equityReturn: 0.11,
 *   bondReturn: 0.035
 * };
 * ```
 */
export type CustomWaypointsGlidepathConfig = {
  /**
   * Discriminator for the glidepath configuration type.
   */
  mode: 'custom-waypoints';

  /**
   * Array of waypoints defining the glidepath curve.
   * Must contain at least one waypoint.
   * Waypoints will be automatically sorted by age.
   */
  waypoints: GlidepathWaypoint[];

  /**
   * Specifies what the waypoint values represent.
   * - 'return': Waypoint values are annual return rates
   * - 'equityWeight': Waypoint values are equity allocation percentages
   */
  valueType: 'return' | 'equityWeight';

  /**
   * Expected annual return for equity portion (decimal format).
   * Required when valueType is 'equityWeight', ignored when valueType is 'return'.
   * Must be > -1.0 (cannot lose more than 100%).
   */
  equityReturn?: number;

  /**
   * Expected annual return for bond portion (decimal format).
   * Required when valueType is 'equityWeight', ignored when valueType is 'return'.
   * Must be > -1.0 (cannot lose more than 100%).
   */
  bondReturn?: number;
};

/**
 * Configuration for stepped return glidepath that declines by a fixed rate per year
 * until reaching a terminal return, then holds that return.
 *
 * Use case: Money Guy Show strategy and other step-down approaches
 *
 * @example
 * ```typescript
 * const config: SteppedReturnGlidepathConfig = {
 *   mode: 'stepped-return',
 *   baseReturn: 0.10,        // 10% starting return
 *   declineRate: 0.001,      // 0.1% decline per year
 *   terminalReturn: 0.055,   // 5.5% floor
 *   declineStartAge: 20,     // Start declining at 20
 *   terminalAge: 65          // Reach terminal at 65
 * };
 * ```
 */
export type SteppedReturnGlidepathConfig = {
  /**
   * Discriminator for the glidepath configuration type.
   */
  mode: 'stepped-return';

  /**
   * Starting annual return rate before decline begins (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.10 represents 10% annual return
   */
  baseReturn: number;

  /**
   * Annual decline rate applied each year (decimal format).
   * Must be >= 0 (cannot have negative decline rates).
   *
   * @example 0.001 represents 0.1% decline per year
   */
  declineRate: number;

  /**
   * Terminal annual return rate that is held after terminalAge (decimal format).
   * Must be > -1.0 (cannot lose more than 100%).
   *
   * @example 0.055 represents 5.5% annual return floor
   */
  terminalReturn: number;

  /**
   * Age at which the decline begins.
   * Must be positive and less than terminalAge.
   *
   * @example 20 means decline starts at age 20
   */
  declineStartAge: number;

  /**
   * Age at which the terminal return is reached and held.
   * Must be greater than declineStartAge.
   * Defaults to 65 if not specified.
   *
   * @example 65 means terminal return is reached at age 65
   */
  terminalAge: number;
};

/**
 * Union type representing all possible glidepath configuration modes.
 * Uses discriminated union pattern with 'mode' as the discriminator.
 */
export type DynamicGlidepathConfig =
  | FixedReturnGlidepathConfig
  | AllocationBasedGlidepathConfig
  | CustomWaypointsGlidepathConfig
  | SteppedReturnGlidepathConfig;

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Represents the detailed state of the account at the end of a specific month.
 * Used for timeline visualization and detailed analysis.
 *
 * @example
 * ```typescript
 * const entry: MonthlyTimelineEntry = {
 *   month: 120,
 *   age: 39.92,
 *   currentBalance: 125750.50,
 *   cumulativeContributions: 120000,
 *   cumulativeInterest: 5750.50,
 *   monthlyInterestEarned: 825.33,
 *   currentAnnualReturn: 0.085,
 *   currentMonthlyReturn: 0.006825,
 *   currentEquityWeight: 0.75  // Only present for allocation-based modes
 * };
 * ```
 */
export type MonthlyTimelineEntry = {
  /**
   * Month number in the simulation (1-based).
   * Month 1 is the first month, month 12 is the end of the first year, etc.
   */
  month: number;

  /**
   * User's age at the end of this month.
   * Increments by 1/12 each month from the starting age.
   */
  age: number;

  /**
   * Total account balance at the end of this month.
   * Includes initial balance, all contributions, and compound interest.
   */
  currentBalance: number;

  /**
   * Cumulative total of all contributions made up to and including this month.
   */
  cumulativeContributions: number;

  /**
   * Cumulative total of all interest earned up to and including this month.
   */
  cumulativeInterest: number;

  /**
   * Amount of interest earned during this specific month.
   */
  monthlyInterestEarned: number;

  /**
   * Annual return rate that was used for this month's calculation.
   * This is the rate determined by the glidepath strategy for the user's age this month.
   */
  currentAnnualReturn: number;

  /**
   * Monthly return rate that was applied during this month.
   * Converted from annual rate using: (1 + annualRate)^(1/12) - 1
   */
  currentMonthlyReturn: number;

  /**
   * Current equity allocation weight for this month.
   * Only present for allocation-based and custom waypoints with equityWeight valueType.
   * Undefined for fixed-return glidepaths.
   */
  currentEquityWeight?: number;
};

/**
 * Comprehensive result object returned by the dynamic glidepath method.
 * Contains final calculations, metadata, timeline data, and summary statistics.
 *
 * @example
 * ```typescript
 * const result: DynamicGlidepathResult = calculator.getCompoundInterestWithDynamicGlidepath(
 *   25000, 1000, 30, 65, config
 * );
 *
 * console.log(`Final balance: $${result.finalBalance.toLocaleString()}`);
 * console.log(`Total months: ${result.totalMonths}`);
 * console.log(`Effective annual return: ${(result.effectiveAnnualReturn * 100).toFixed(2)}%`);
 * ```
 */
export type DynamicGlidepathResult = {
  // Final calculation results

  /**
   * Total account balance at the end of the simulation period.
   * Rounded to the nearest cent for precision.
   */
  finalBalance: number;

  /**
   * Sum of all monthly contributions made during the simulation period.
   */
  totalContributions: number;

  /**
   * Total interest earned through compound growth during the simulation period.
   */
  totalInterestEarned: number;

  // Simulation metadata

  /**
   * Total number of months simulated.
   * Calculated as Math.ceil((endAge - startAge) * 12)
   */
  totalMonths: number;

  /**
   * Starting age from the input parameters.
   */
  startAge: number;

  /**
   * Ending age from the input parameters.
   */
  endAge: number;

  /**
   * The glidepath mode that was used for this calculation.
   */
  glidepathMode: GlidepathMode;

  // Timeline data for analysis and visualization

  /**
   * Detailed month-by-month timeline data.
   * Each entry represents the state at the end of that month.
   * Useful for creating charts and detailed analysis.
   */
  monthlyTimeline: MonthlyTimelineEntry[];

  // Summary statistics

  /**
   * Effective compound annual growth rate over the entire simulation period.
   * Calculated as (finalBalance / initialBalance)^(1/years) - 1
   */
  effectiveAnnualReturn: number;

  /**
   * Average monthly return rate across all months in the simulation.
   * Simple arithmetic mean of all monthly return rates used.
   */
  averageMonthlyReturn: number;
};

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Base error type for retirement calculator-specific errors.
 */
export type RetirementCalculatorError = Error & {
  name: 'RetirementCalculatorError';
};

/**
 * Error thrown when age parameters are invalid.
 */
export type InvalidAgeRangeError = RetirementCalculatorError & {
  name: 'InvalidAgeRangeError';
  message: 'startAge must be less than endAge and both must be positive';
};

/**
 * Error thrown when financial parameters are invalid.
 */
export type InvalidFinancialParameterError = RetirementCalculatorError & {
  name: 'InvalidFinancialParameterError';
  message: 'initialBalance and monthlyContribution must be non-negative';
};

/**
 * Error thrown when return rates are invalid.
 */
export type InvalidReturnRateError = RetirementCalculatorError & {
  name: 'InvalidReturnRateError';
  message: 'Return rates must be greater than -1.0 (cannot lose more than 100%)';
};

/**
 * Error thrown when allocation weights are invalid.
 */
export type InvalidAllocationError = RetirementCalculatorError & {
  name: 'InvalidAllocationError';
  message: 'Equity weights must be between 0.0 and 1.0 inclusive';
};

/**
 * Error thrown when glidepath configuration is invalid.
 */
export type InvalidGlidepathConfigError = RetirementCalculatorError & {
  name: 'InvalidGlidepathConfigError';
  message: string; // Variable message based on specific validation failure
};

/**
 * Error thrown when waypoints configuration is invalid.
 */
export type InvalidWaypointsError = RetirementCalculatorError & {
  name: 'InvalidWaypointsError';
  message: 'Waypoints array must contain at least one valid waypoint';
};

/**
 * Error thrown when calculation results in numeric overflow.
 */
export type CalculationOverflowError = RetirementCalculatorError & {
  name: 'CalculationOverflowError';
  message: 'Calculation resulted in numeric overflow';
};

/**
 * Error thrown when numerical precision loss is detected.
 */
export type NumericalPrecisionError = RetirementCalculatorError & {
  name: 'NumericalPrecisionError';
  message: 'Numerical precision loss detected in calculation';
};

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard to check if a configuration is a fixed return configuration.
 */
export function isFixedReturnConfig(
  config: DynamicGlidepathConfig
): config is FixedReturnGlidepathConfig {
  return config.mode === 'fixed-return';
}

/**
 * Type guard to check if a configuration is an allocation-based configuration.
 */
export function isAllocationBasedConfig(
  config: DynamicGlidepathConfig
): config is AllocationBasedGlidepathConfig {
  return config.mode === 'allocation-based';
}

/**
 * Type guard to check if a configuration is a custom waypoints configuration.
 */
export function isCustomWaypointsConfig(
  config: DynamicGlidepathConfig
): config is CustomWaypointsGlidepathConfig {
  return config.mode === 'custom-waypoints';
}

/**
 * Type guard to check if a configuration is a stepped return configuration.
 */
export function isSteppedReturnConfig(
  config: DynamicGlidepathConfig
): config is SteppedReturnGlidepathConfig {
  return config.mode === 'stepped-return';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility type to extract the configuration type for a specific glidepath mode.
 */
export type ConfigForMode<T extends GlidepathMode> = T extends 'fixed-return'
  ? FixedReturnGlidepathConfig
  : T extends 'allocation-based'
    ? AllocationBasedGlidepathConfig
    : T extends 'custom-waypoints'
      ? CustomWaypointsGlidepathConfig
      : T extends 'stepped-return'
        ? SteppedReturnGlidepathConfig
        : never;

/**
 * Utility type to make certain properties of a type required.
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for custom waypoints configuration with required equity/bond returns.
 */
export type CustomWaypointsWithReturns = RequiredFields<
  CustomWaypointsGlidepathConfig,
  'equityReturn' | 'bondReturn'
>;
