import type {
  ContributionFrequencyType,
  SteppedReturnGlidepathConfig,
  CustomWaypointsGlidepathConfig,
  GlidepathWaypoint,
} from '../types/retirementCalculatorTypes';

/**
 * Object representing contribution frequency options.
 * @readonly
 * @enum {number}
 */
export const CONTRIBUTION_FREQUENCY: ContributionFrequencyType = {
  /**
   * Yearly contribution frequency.
   * @type {number}
   */
  YEARLY: 1,

  /**
   * Monthly contribution frequency.
   * @type {number}
   */
  MONTHLY: 12,

  /**
   * Weekly contribution frequency.
   * @type {number}
   */
  WEEKLY: 52,
};

// ========================================
// Dynamic Glidepath Constants
// ========================================

/**
 * Default configuration values for dynamic glidepath calculations.
 * These provide sensible starting points for retirement planning scenarios.
 * @readonly
 */
export const GLIDEPATH_DEFAULTS = {
  /**
   * Default fixed return glidepath configuration.
   * Represents a typical target-date fund progression.
   */
  FIXED_RETURN: {
    /** Starting return rate for aggressive investing (10%) */
    START_RETURN: 0.1,
    /** Ending return rate for conservative investing (5.5%) */
    END_RETURN: 0.055,
  },

  /**
   * Default allocation-based glidepath configuration.
   * Follows the common "120 minus age" equity allocation rule progression.
   */
  ALLOCATION_BASED: {
    /** Starting equity weight for young investors (90%) */
    START_EQUITY_WEIGHT: 0.9,
    /** Ending equity weight near retirement (30%) */
    END_EQUITY_WEIGHT: 0.3,
    /** Expected annual return for equity investments (12%) */
    EQUITY_RETURN: 0.12,
    /** Expected annual return for bond investments (4%) */
    BOND_RETURN: 0.04,
  },

  /**
   * Default ages for glidepath calculations.
   */
  AGES: {
    /** Typical starting career age */
    START_AGE: 25,
    /** Standard retirement age */
    END_AGE: 65,
  },
} as const;

/**
 * Validation constraints for dynamic glidepath parameters.
 * These ensure mathematical soundness and prevent invalid configurations.
 * @readonly
 */
export const GLIDEPATH_VALIDATION = {
  /**
   * Age validation limits.
   */
  AGES: {
    /** Minimum allowed age (must be positive) */
    MIN_AGE: 0.1,
    /** Maximum reasonable age for calculations */
    MAX_AGE: 150,
    /** Minimum age difference for meaningful glidepath */
    MIN_AGE_DIFFERENCE: 1,
  },

  /**
   * Return rate validation limits.
   */
  RETURNS: {
    /** Minimum return rate (-99% loss maximum) */
    MIN_RETURN: -0.99,
    /** Maximum reasonable return rate (100% annual gain) */
    MAX_RETURN: 1.0,
    /** Typical range warning threshold for high returns */
    HIGH_RETURN_WARNING: 0.25,
  },

  /**
   * Allocation weight validation limits.
   */
  ALLOCATIONS: {
    /** Minimum allocation weight (0%) */
    MIN_WEIGHT: 0.0,
    /** Maximum allocation weight (100%) */
    MAX_WEIGHT: 1.0,
  },

  /**
   * Financial parameter validation limits.
   */
  FINANCIAL: {
    /** Minimum balance (must be non-negative) */
    MIN_BALANCE: 0,
    /** Minimum contribution (must be non-negative) */
    MIN_CONTRIBUTION: 0,
    /** Maximum reasonable balance for calculations */
    MAX_BALANCE: Number.MAX_SAFE_INTEGER / 1000,
  },

  /**
   * Waypoint validation limits.
   */
  WAYPOINTS: {
    /** Minimum number of waypoints required */
    MIN_WAYPOINTS: 1,
    /** Maximum recommended waypoints for performance */
    MAX_WAYPOINTS: 100,
  },
} as const;

/**
 * Mathematical constants and precision settings for glidepath calculations.
 * These ensure numerical stability and consistent rounding behavior.
 * @readonly
 */
export const GLIDEPATH_MATH = {
  /**
   * Precision and rounding constants.
   */
  PRECISION: {
    /** Number of decimal places for monetary amounts */
    CURRENCY_DECIMALS: 2,
    /** Multiplier for currency rounding (100 for cents) */
    CURRENCY_MULTIPLIER: 100,
    /** Number of decimal places for percentage calculations */
    PERCENTAGE_DECIMALS: 6,
    /** Number of decimal places for interest rate calculations */
    INTEREST_RATE_DECIMALS: 10,
  },

  /**
   * Epsilon values for floating-point comparisons.
   */
  EPSILON: {
    /** General floating-point comparison tolerance */
    GENERAL: 1e-10,
    /** Currency comparison tolerance (0.01 cents) */
    CURRENCY: 1e-4,
    /** Percentage comparison tolerance */
    PERCENTAGE: 1e-8,
  },

  /**
   * Mathematical conversion constants.
   */
  CONVERSION: {
    /** Months per year for age calculations */
    MONTHS_PER_YEAR: 12,
    /** Weeks per year for contribution calculations */
    WEEKS_PER_YEAR: 52,
    /** Days per year for precise calculations */
    DAYS_PER_YEAR: 365.25,
  },
} as const;

/**
 * Configuration templates for common glidepath scenarios.
 * These provide ready-to-use configurations for typical retirement planning needs.
 * @readonly
 */
export const GLIDEPATH_TEMPLATES = {
  /**
   * Conservative glidepath with lower volatility.
   */
  CONSERVATIVE: {
    FIXED_RETURN: {
      START_RETURN: 0.07,
      END_RETURN: 0.04,
    },
    ALLOCATION_BASED: {
      START_EQUITY_WEIGHT: 0.6,
      END_EQUITY_WEIGHT: 0.2,
      EQUITY_RETURN: 0.1,
      BOND_RETURN: 0.035,
    },
  },

  /**
   * Aggressive glidepath with higher growth potential.
   */
  AGGRESSIVE: {
    FIXED_RETURN: {
      START_RETURN: 0.13,
      END_RETURN: 0.07,
    },
    ALLOCATION_BASED: {
      START_EQUITY_WEIGHT: 1.0,
      END_EQUITY_WEIGHT: 0.5,
      EQUITY_RETURN: 0.15,
      BOND_RETURN: 0.04,
    },
  },

  /**
   * Moderate/balanced glidepath (same as defaults).
   */
  MODERATE: {
    FIXED_RETURN: GLIDEPATH_DEFAULTS.FIXED_RETURN,
    ALLOCATION_BASED: GLIDEPATH_DEFAULTS.ALLOCATION_BASED,
  },
} as const;

/**
 * Performance optimization thresholds for glidepath calculations.
 * These help determine when to use memory-optimized calculation modes.
 * @readonly
 */
export const GLIDEPATH_PERFORMANCE = {
  /**
   * Timeline generation thresholds.
   */
  TIMELINE: {
    /** Number of months above which to consider memory optimization */
    LARGE_SIMULATION_MONTHS: 600, // 50 years
    /** Number of months above which to warn about performance */
    PERFORMANCE_WARNING_MONTHS: 1200, // 100 years
  },

  /**
   * Cache size limits for performance optimization.
   */
  CACHE: {
    /** Maximum number of cached monthly rate conversions */
    MAX_RATE_CACHE_SIZE: 1000,
    /** Maximum number of cached waypoint interpolations */
    MAX_INTERPOLATION_CACHE_SIZE: 500,
  },
} as const;

/**
 * Pre-configured glidepath strategies based on popular financial planning approaches.
 * Each preset includes documentation links to the original methodology.
 */
export const GLIDEPATH_PRESETS = {
  /**
   * Money Guy Show strategy: 10% returns declining 0.1% per year to 5.5% floor at age 65.
   *
   * This strategy holds 10% returns until age 20, then declines by exactly 0.1% per year
   * until reaching the 5.5% floor at age 65, then holds that terminal return.
   *
   * Source: https://www.moneyguy.com/
   * Reference: Financial Order of Operations and investment return assumptions
   */
  MONEY_GUY_SHOW: {
    mode: 'stepped-return',
    baseReturn: 0.1, // 10% base return
    declineRate: 0.001, // 0.1% decline per year
    terminalReturn: 0.055, // 5.5% terminal return
    declineStartAge: 20, // Start declining at age 20
    terminalAge: 65, // Reach terminal at age 65
  } as const satisfies SteppedReturnGlidepathConfig,

  /**
   * Bogleheads "100 minus age" equity allocation strategy.
   *
   * Conservative interpretation with minimum 20% equity allocation.
   * Uses historical US total stock market returns (10%) and intermediate bonds (4%).
   *
   * Source: https://www.bogleheads.org/wiki/Asset_allocation
   * Reference: Age-based allocation guidelines and three-fund portfolio
   */
  BOGLEHEADS_100_MINUS_AGE: {
    mode: 'custom-waypoints',
    valueType: 'equityWeight',
    waypoints: [
      { age: 20, value: 0.8 }, // 100-20 = 80% equity
      { age: 30, value: 0.7 }, // 100-30 = 70% equity
      { age: 40, value: 0.6 }, // 100-40 = 60% equity
      { age: 50, value: 0.5 }, // 100-50 = 50% equity
      { age: 60, value: 0.4 }, // 100-60 = 40% equity
      { age: 65, value: 0.35 }, // 100-65 = 35% equity
      { age: 80, value: 0.2 }, // Minimum 20% equity floor
    ] as GlidepathWaypoint[],
    equityReturn: 0.1, // Historical US total stock market
    bondReturn: 0.04, // Intermediate-term government/corporate bonds
  } satisfies CustomWaypointsGlidepathConfig,

  /**
   * Bogleheads "110 minus age" more aggressive equity allocation strategy.
   *
   * More aggressive interpretation for longer time horizons and higher risk tolerance.
   * Maintains higher equity allocation throughout the lifecycle.
   *
   * Source: https://www.bogleheads.org/wiki/Asset_allocation
   * Reference: Age-based allocation variations for aggressive investors
   */
  BOGLEHEADS_110_MINUS_AGE: {
    mode: 'custom-waypoints',
    valueType: 'equityWeight',
    waypoints: [
      { age: 20, value: 0.9 }, // 110-20 = 90% equity
      { age: 30, value: 0.8 }, // 110-30 = 80% equity
      { age: 40, value: 0.7 }, // 110-40 = 70% equity
      { age: 50, value: 0.6 }, // 110-50 = 60% equity
      { age: 60, value: 0.5 }, // 110-60 = 50% equity
      { age: 65, value: 0.45 }, // 110-65 = 45% equity
      { age: 80, value: 0.3 }, // Minimum 30% equity floor
    ] as GlidepathWaypoint[],
    equityReturn: 0.1,
    bondReturn: 0.04,
  } satisfies CustomWaypointsGlidepathConfig,

  /**
   * Bogleheads "120 minus age" very aggressive equity allocation strategy.
   *
   * Most aggressive interpretation for very long time horizons and high risk tolerance.
   * Suitable for young investors with decades until retirement.
   *
   * Source: https://www.bogleheads.org/wiki/Asset_allocation
   * Reference: Age-based allocation variations for very aggressive investors
   */
  BOGLEHEADS_120_MINUS_AGE: {
    mode: 'custom-waypoints',
    valueType: 'equityWeight',
    waypoints: [
      { age: 20, value: 1.0 }, // 120-20 = 100% equity
      { age: 30, value: 0.9 }, // 120-30 = 90% equity
      { age: 40, value: 0.8 }, // 120-40 = 80% equity
      { age: 50, value: 0.7 }, // 120-50 = 70% equity
      { age: 60, value: 0.6 }, // 120-60 = 60% equity
      { age: 65, value: 0.55 }, // 120-65 = 55% equity
      { age: 80, value: 0.4 }, // Minimum 40% equity floor
    ] as GlidepathWaypoint[],
    equityReturn: 0.1,
    bondReturn: 0.04,
  } satisfies CustomWaypointsGlidepathConfig,
} as const;
