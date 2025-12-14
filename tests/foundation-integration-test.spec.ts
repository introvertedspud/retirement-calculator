/**
 * @fileoverview Comprehensive integration test for Dynamic Glidepath foundation layer components.
 *
 * This test verifies that all foundation components integrate correctly:
 * - Type system extensions
 * - Constants and validation constants
 * - Cross-component compatibility
 *
 * @version 2.0.0
 */

/* eslint-disable jest/no-conditional-expect */

// ============================================================================
// FOUNDATION COMPONENT IMPORTS
// ============================================================================

// Type system imports
import type {
  // Core existing types
  ContributionFrequencyType,
  CompoundingInterestObjectType,
  YearlyCompoundingDetails,

  // New dynamic glidepath types
  FixedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
  DynamicGlidepathConfig,
  MonthlyTimelineEntry,

  // Utility types
  ConfigForMode,
} from '../src/types/retirementCalculatorTypes';

// Type guard function imports
import {
  isFixedReturnConfig,
  isAllocationBasedConfig,
  isCustomWaypointsConfig,
} from '../src/types/retirementCalculatorTypes';

// Constants imports
import {
  CONTRIBUTION_FREQUENCY,
  GLIDEPATH_DEFAULTS,
  GLIDEPATH_VALIDATION,
  GLIDEPATH_MATH,
  GLIDEPATH_TEMPLATES,
} from '../src/constants/retirementCalculatorConstants';

// Main calculator for integration testing
import RetirementCalculator from '../src/RetirementCalculator';

// ============================================================================
// INTEGRATION TEST SUITE
// ============================================================================

describe('Dynamic Glidepath Foundation Layer Integration', () => {
  let calculator: RetirementCalculator;

  beforeEach(() => {
    calculator = new RetirementCalculator();
  });

  // ========================================================================
  // TYPE SYSTEM INTEGRATION TESTS
  // ========================================================================

  describe('Type System Integration', () => {
    it('should properly import and use all existing types', () => {
      // Test existing types still work
      const contributionFreq: ContributionFrequencyType =
        CONTRIBUTION_FREQUENCY;
      expect(contributionFreq.YEARLY).toBe(1);
      expect(contributionFreq.MONTHLY).toBe(12);
      expect(contributionFreq.WEEKLY).toBe(52);

      // Test that these types are properly structured
      expect(typeof contributionFreq.YEARLY).toBe('number');
      expect(typeof contributionFreq.MONTHLY).toBe('number');
      expect(typeof contributionFreq.WEEKLY).toBe('number');
    });

    it('should properly define and use new glidepath configuration types', () => {
      // Test FixedReturnGlidepathConfig
      const fixedConfig: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.1,
        endReturn: 0.055,
      };
      expect(fixedConfig.mode).toBe('fixed-return');
      expect(fixedConfig.startReturn).toBe(0.1);
      expect(fixedConfig.endReturn).toBe(0.055);

      // Test AllocationBasedGlidepathConfig
      const allocationConfig: AllocationBasedGlidepathConfig = {
        mode: 'allocation-based',
        startEquityWeight: 0.9,
        endEquityWeight: 0.3,
        equityReturn: 0.12,
        bondReturn: 0.04,
      };
      expect(allocationConfig.mode).toBe('allocation-based');
      expect(allocationConfig.startEquityWeight).toBe(0.9);
      expect(allocationConfig.endEquityWeight).toBe(0.3);

      // Test CustomWaypointsGlidepathConfig
      const waypointsConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [
          { age: 25, value: 0.12 },
          { age: 65, value: 0.05 },
        ],
      };
      expect(waypointsConfig.mode).toBe('custom-waypoints');
      expect(waypointsConfig.valueType).toBe('return');
      expect(waypointsConfig.waypoints).toHaveLength(2);
    });

    it('should properly work with union type DynamicGlidepathConfig', () => {
      const configs: DynamicGlidepathConfig[] = [
        {
          mode: 'fixed-return',
          startReturn: 0.08,
          endReturn: 0.06,
        },
        {
          mode: 'allocation-based',
          startEquityWeight: 0.8,
          endEquityWeight: 0.4,
          equityReturn: 0.11,
          bondReturn: 0.035,
        },
        {
          mode: 'custom-waypoints',
          valueType: 'equityWeight',
          waypoints: [{ age: 30, value: 0.75 }],
          equityReturn: 0.1,
          bondReturn: 0.04,
        },
      ];

      expect(configs).toHaveLength(3);
      configs.forEach((config) => {
        expect([
          'fixed-return',
          'allocation-based',
          'custom-waypoints',
        ]).toContain(config.mode);
      });
    });

    it('should properly define result types', () => {
      // Test MonthlyTimelineEntry structure
      const timelineEntry: MonthlyTimelineEntry = {
        month: 120,
        age: 39.92,
        currentBalance: 125750.5,
        cumulativeContributions: 120000,
        cumulativeInterest: 5750.5,
        monthlyInterestEarned: 825.33,
        currentAnnualReturn: 0.085,
        currentMonthlyReturn: 0.006825,
        currentEquityWeight: 0.75,
      };

      expect(timelineEntry.month).toBe(120);
      expect(timelineEntry.age).toBeCloseTo(39.92, 2);
      expect(timelineEntry.currentBalance).toBeCloseTo(125750.5, 2);
      expect(typeof timelineEntry.currentEquityWeight).toBe('number');
    });

    it('should work with utility types', () => {
      // Test ConfigForMode utility type
      type FixedConfig = ConfigForMode<'fixed-return'>;
      type AllocationConfig = ConfigForMode<'allocation-based'>;

      const fixedConfig: FixedConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.06,
      };

      const allocationConfig: AllocationConfig = {
        mode: 'allocation-based',
        startEquityWeight: 0.8,
        endEquityWeight: 0.4,
        equityReturn: 0.11,
        bondReturn: 0.035,
      };

      expect(fixedConfig.mode).toBe('fixed-return');
      expect(allocationConfig.mode).toBe('allocation-based');
    });
  });

  // ========================================================================
  // TYPE GUARDS INTEGRATION TESTS
  // ========================================================================

  describe('Type Guards Integration', () => {
    it('should correctly identify configuration types', () => {
      const fixedConfig: DynamicGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.06,
      };

      const allocationConfig: DynamicGlidepathConfig = {
        mode: 'allocation-based',
        startEquityWeight: 0.8,
        endEquityWeight: 0.4,
        equityReturn: 0.11,
        bondReturn: 0.035,
      };

      const waypointsConfig: DynamicGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [{ age: 30, value: 0.08 }],
      };

      // Test type guards
      expect(isFixedReturnConfig(fixedConfig)).toBe(true);
      expect(isFixedReturnConfig(allocationConfig)).toBe(false);
      expect(isFixedReturnConfig(waypointsConfig)).toBe(false);

      expect(isAllocationBasedConfig(allocationConfig)).toBe(true);
      expect(isAllocationBasedConfig(fixedConfig)).toBe(false);
      expect(isAllocationBasedConfig(waypointsConfig)).toBe(false);

      expect(isCustomWaypointsConfig(waypointsConfig)).toBe(true);
      expect(isCustomWaypointsConfig(fixedConfig)).toBe(false);
      expect(isCustomWaypointsConfig(allocationConfig)).toBe(false);
    });

    it('should enable proper TypeScript narrowing', () => {
      const config: DynamicGlidepathConfig = {
        mode: 'allocation-based',
        startEquityWeight: 0.8,
        endEquityWeight: 0.4,
        equityReturn: 0.11,
        bondReturn: 0.035,
      };

      // Test that type guard correctly identifies the config
      expect(isAllocationBasedConfig(config)).toBe(true);

      // Access properties after type guard validation
      if (isAllocationBasedConfig(config)) {
        expect(config.equityReturn).toBe(0.11);
        expect(config.bondReturn).toBe(0.035);
        expect(config.startEquityWeight).toBe(0.8);
      }
    });
  });

  // ========================================================================
  // CONSTANTS INTEGRATION TESTS
  // ========================================================================

  describe('Constants Integration', () => {
    it('should provide consistent contribution frequency constants', () => {
      expect(CONTRIBUTION_FREQUENCY.YEARLY).toBe(1);
      expect(CONTRIBUTION_FREQUENCY.MONTHLY).toBe(12);
      expect(CONTRIBUTION_FREQUENCY.WEEKLY).toBe(52);
    });

    it('should provide comprehensive glidepath defaults', () => {
      expect(GLIDEPATH_DEFAULTS.FIXED_RETURN.START_RETURN).toBe(0.1);
      expect(GLIDEPATH_DEFAULTS.FIXED_RETURN.END_RETURN).toBe(0.055);

      expect(GLIDEPATH_DEFAULTS.ALLOCATION_BASED.START_EQUITY_WEIGHT).toBe(0.9);
      expect(GLIDEPATH_DEFAULTS.ALLOCATION_BASED.END_EQUITY_WEIGHT).toBe(0.3);
      expect(GLIDEPATH_DEFAULTS.ALLOCATION_BASED.EQUITY_RETURN).toBe(0.12);
      expect(GLIDEPATH_DEFAULTS.ALLOCATION_BASED.BOND_RETURN).toBe(0.04);

      expect(GLIDEPATH_DEFAULTS.AGES.START_AGE).toBe(25);
      expect(GLIDEPATH_DEFAULTS.AGES.END_AGE).toBe(65);
    });

    it('should provide comprehensive validation constants', () => {
      expect(GLIDEPATH_VALIDATION.AGES.MIN_AGE).toBe(0.1);
      expect(GLIDEPATH_VALIDATION.AGES.MAX_AGE).toBe(150);
      expect(GLIDEPATH_VALIDATION.AGES.MIN_AGE_DIFFERENCE).toBe(1);

      expect(GLIDEPATH_VALIDATION.RETURNS.MIN_RETURN).toBe(-0.99);
      expect(GLIDEPATH_VALIDATION.RETURNS.MAX_RETURN).toBe(1.0);

      expect(GLIDEPATH_VALIDATION.ALLOCATIONS.MIN_WEIGHT).toBe(0.0);
      expect(GLIDEPATH_VALIDATION.ALLOCATIONS.MAX_WEIGHT).toBe(1.0);
    });

    it('should provide mathematical constants', () => {
      expect(GLIDEPATH_MATH.PRECISION.CURRENCY_DECIMALS).toBe(2);
      expect(GLIDEPATH_MATH.PRECISION.CURRENCY_MULTIPLIER).toBe(100);

      expect(GLIDEPATH_MATH.CONVERSION.MONTHS_PER_YEAR).toBe(12);
      expect(GLIDEPATH_MATH.CONVERSION.WEEKS_PER_YEAR).toBe(52);
      expect(GLIDEPATH_MATH.CONVERSION.DAYS_PER_YEAR).toBe(365.25);
    });

    it('should provide configuration templates', () => {
      expect(GLIDEPATH_TEMPLATES.CONSERVATIVE.FIXED_RETURN.START_RETURN).toBe(
        0.07
      );
      expect(
        GLIDEPATH_TEMPLATES.AGGRESSIVE.ALLOCATION_BASED.START_EQUITY_WEIGHT
      ).toBe(1.0);
      expect(GLIDEPATH_TEMPLATES.MODERATE.FIXED_RETURN).toEqual(
        GLIDEPATH_DEFAULTS.FIXED_RETURN
      );
    });
  });

  // ========================================================================
  // CROSS-COMPONENT COMPATIBILITY TESTS
  // ========================================================================

  describe('Cross-Component Compatibility', () => {
    it('should maintain compatibility with existing RetirementCalculator', () => {
      // Test that existing calculator methods still work
      const result = calculator.getCompoundInterestWithAdditionalContributions(
        10000,
        1000,
        10,
        0.08,
        CONTRIBUTION_FREQUENCY.MONTHLY,
        CONTRIBUTION_FREQUENCY.MONTHLY
      );

      expect(result.balance).toBeGreaterThan(0);
      expect(result.totalContributions).toBeGreaterThan(0);
      expect(result.totalInterestEarned).toBeGreaterThan(0);
      expect(result.compoundingPeriodDetails).toHaveLength(120); // 10 years * 12 months
    });

    it('should work with existing type system', () => {
      // Test that new types can coexist with existing ones
      const compoundingResult: CompoundingInterestObjectType =
        calculator.getCompoundInterestWithAdditionalContributions(
          25000,
          1000,
          30,
          0.08,
          CONTRIBUTION_FREQUENCY.MONTHLY,
          CONTRIBUTION_FREQUENCY.MONTHLY
        );

      const yearlyData: YearlyCompoundingDetails[] =
        calculator.aggregateDataByYear(compoundingResult);

      expect(yearlyData).toHaveLength(30);
      expect(yearlyData[0].year).toBe(1);
      expect(yearlyData[29].year).toBe(30);
    });

    it('should validate template configurations against validation rules', () => {
      // Conservative template
      expect(
        GLIDEPATH_TEMPLATES.CONSERVATIVE.FIXED_RETURN.START_RETURN
      ).toBeGreaterThan(GLIDEPATH_VALIDATION.RETURNS.MIN_RETURN);
      expect(
        GLIDEPATH_TEMPLATES.CONSERVATIVE.ALLOCATION_BASED.START_EQUITY_WEIGHT
      ).toBeLessThanOrEqual(GLIDEPATH_VALIDATION.ALLOCATIONS.MAX_WEIGHT);

      // Aggressive template
      expect(
        GLIDEPATH_TEMPLATES.AGGRESSIVE.ALLOCATION_BASED.END_EQUITY_WEIGHT
      ).toBeGreaterThanOrEqual(GLIDEPATH_VALIDATION.ALLOCATIONS.MIN_WEIGHT);
    });
  });

  // ========================================================================
  // INTEGRATION SMOKE TESTS
  // ========================================================================

  describe('Integration Smoke Tests', () => {
    it('should successfully create a complete glidepath configuration', () => {
      const config: DynamicGlidepathConfig = {
        mode: 'allocation-based',
        startEquityWeight:
          GLIDEPATH_DEFAULTS.ALLOCATION_BASED.START_EQUITY_WEIGHT,
        endEquityWeight: GLIDEPATH_DEFAULTS.ALLOCATION_BASED.END_EQUITY_WEIGHT,
        equityReturn: GLIDEPATH_DEFAULTS.ALLOCATION_BASED.EQUITY_RETURN,
        bondReturn: GLIDEPATH_DEFAULTS.ALLOCATION_BASED.BOND_RETURN,
      };

      expect(isAllocationBasedConfig(config)).toBe(true);

      // Access properties after type guard validation
      if (isAllocationBasedConfig(config)) {
        expect(config.startEquityWeight).toBe(0.9);
        expect(config.endEquityWeight).toBe(0.3);
        expect(config.equityReturn).toBe(0.12);
        expect(config.bondReturn).toBe(0.04);
      }
    });

    it('should maintain numeric precision with math constants', () => {
      const testValue = 123.456789;
      const rounded =
        Math.round(testValue * GLIDEPATH_MATH.PRECISION.CURRENCY_MULTIPLIER) /
        GLIDEPATH_MATH.PRECISION.CURRENCY_MULTIPLIER;

      expect(rounded).toBe(123.46);
      const decimalPart = rounded.toString().split('.')[1];
      const decimalLength = decimalPart !== undefined ? decimalPart.length : 0;
      expect(decimalLength).toBeLessThanOrEqual(
        GLIDEPATH_MATH.PRECISION.CURRENCY_DECIMALS
      );
    });

    it('should work with all template configurations', () => {
      const templates = [
        GLIDEPATH_TEMPLATES.CONSERVATIVE,
        GLIDEPATH_TEMPLATES.MODERATE,
        GLIDEPATH_TEMPLATES.AGGRESSIVE,
      ];

      templates.forEach((template) => {
        expect(template.FIXED_RETURN.START_RETURN).toBeGreaterThan(
          template.FIXED_RETURN.END_RETURN
        );
        expect(
          template.ALLOCATION_BASED.START_EQUITY_WEIGHT
        ).toBeGreaterThanOrEqual(template.ALLOCATION_BASED.END_EQUITY_WEIGHT);
      });
    });
  });
});
