import type { ContributionFrequencyType } from '../types/retirementCalculatorTypes';

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
