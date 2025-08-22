/**
 * @fileoverview Comprehensive integration test for Dynamic Glidepath foundation layer components.
 *
 * This test verifies that all foundation components integrate correctly:
 * - Type system extensions
 * - Constants and validation constants
 * - Error handling infrastructure
 * - Cross-component compatibility
 *
 * @version 1.0.0
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
  GLIDEPATH_ERROR_MESSAGES,
} from '../src/constants/retirementCalculatorConstants';

// Error handling imports
import {
  // Error codes
  GLIDEPATH_ERROR_CODES,

  // Error classes
  DynamicGlidepathError,
  DynamicGlidepathValidationError,

  // Factory functions
  createAgeError,
  createFinancialError,
  createReturnRateError,
  createAllocationError,
  createConfigurationError,
  createWaypointError,
  createWarning,
  createCalculationError,

  // Type guards
  isDynamicGlidepathError,
  isValidationError,
  isConfigurationError,
  isCalculationError,
  isBlockingError,
  isWarning,

  // Utilities
  groupBySeverity,
  groupByCategory,
  getSummary,
  formatForConsole,
  formatForAPI,
  ValidationResultBuilder,
} from '../src/errors/DynamicGlidepathErrors';

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

    it('should provide comprehensive error messages', () => {
      expect(GLIDEPATH_ERROR_MESSAGES.AGES.NEGATIVE_START_AGE).toBe(
        'startAge must be positive'
      );
      expect(GLIDEPATH_ERROR_MESSAGES.FINANCIAL.NEGATIVE_BALANCE).toBe(
        'initialBalance must be non-negative'
      );
      expect(GLIDEPATH_ERROR_MESSAGES.RETURNS.RETURN_TOO_LOW).toContain(
        'must be greater than -0.99'
      );
    });
  });

  // ========================================================================
  // ERROR HANDLING INTEGRATION TESTS
  // ========================================================================

  describe('Error Handling Integration', () => {
    it('should provide comprehensive error codes', () => {
      expect(GLIDEPATH_ERROR_CODES.NEGATIVE_AGE).toBe('NEGATIVE_AGE');
      expect(GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION).toBe(
        'INVALID_ALLOCATION'
      );
      expect(GLIDEPATH_ERROR_CODES.EMPTY_WAYPOINTS).toBe('EMPTY_WAYPOINTS');
      expect(GLIDEPATH_ERROR_CODES.CALCULATION_ERROR).toBe('CALCULATION_ERROR');
    });

    it('should create and work with error classes', () => {
      const ageError = createAgeError('startAge', -5);

      expect(ageError).toBeInstanceOf(DynamicGlidepathValidationError);
      expect(ageError).toBeInstanceOf(DynamicGlidepathError);
      expect(ageError.code).toBe(GLIDEPATH_ERROR_CODES.NEGATIVE_AGE);
      expect(ageError.field).toBe('startAge');
      expect(ageError.value).toBe(-5);
      expect(ageError.severity).toBe('error');
      expect(ageError.category).toBe('validation');
    });

    it('should work with error factory functions', () => {
      // Test age error
      const ageError = createAgeError('startAge', 70, 65);
      expect(ageError.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_AGE_RANGE);

      // Test financial error
      const financialError = createFinancialError('initialBalance', -1000);
      expect(financialError.code).toBe(GLIDEPATH_ERROR_CODES.NEGATIVE_BALANCE);

      // Test return rate error
      const returnError = createReturnRateError('startReturn', -1.5);
      expect(returnError.code).toBe(GLIDEPATH_ERROR_CODES.IMPOSSIBLE_LOSS);

      // Test allocation error
      const allocationError = createAllocationError('startEquityWeight', 1.5);
      expect(allocationError.code).toBe(
        GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION
      );
    });

    it('should work with type guards for errors', () => {
      const validationError = createAgeError('startAge', -5);
      const configError = createConfigurationError('mode', 'invalid-mode', [
        'fixed-return',
        'allocation-based',
      ]);
      const calcError = createCalculationError('Simulation failed');

      expect(isDynamicGlidepathError(validationError)).toBe(true);
      expect(isValidationError(validationError)).toBe(true);
      expect(isConfigurationError(validationError)).toBe(false);

      expect(isConfigurationError(configError)).toBe(true);
      expect(isValidationError(configError)).toBe(false);

      expect(isCalculationError(calcError)).toBe(true);
      expect(isBlockingError(calcError)).toBe(true);
    });

    it('should work with error aggregation utilities', () => {
      const errors = [
        createAgeError('startAge', -5),
        createFinancialError('initialBalance', -1000),
        createWarning(
          GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
          'startReturn',
          0.25
        ),
      ];

      const grouped = groupBySeverity(errors);
      expect(grouped.errors).toHaveLength(2);
      expect(grouped.warnings).toHaveLength(1);

      const summary = getSummary(errors);
      expect(summary.total).toBe(3);
      expect(summary.errorCount).toBe(2);
      expect(summary.warningCount).toBe(1);
    });

    it('should work with ValidationResultBuilder', () => {
      const builder = new ValidationResultBuilder();

      builder
        .addError(createAgeError('startAge', -5))
        .addWarning(
          createWarning(
            GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
            'startReturn',
            0.25
          )
        );

      const result = builder.build();
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);

      expect(builder.hasBlockingErrors()).toBe(true);
      expect(builder.getErrorCount()).toBe(1);
      expect(builder.getWarningCount()).toBe(1);
    });

    it('should support bulk operations in ValidationResultBuilder', () => {
      const builder = new ValidationResultBuilder();

      const errors = [
        createAgeError('startAge', -5),
        createFinancialError('initialBalance', -1000),
      ];

      const warnings = [
        createWarning(
          GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
          'startReturn',
          0.25
        ),
        createWarning(
          GLIDEPATH_ERROR_CODES.LONG_SIMULATION_WARNING,
          'endAge',
          120
        ),
      ];

      // Test bulk add methods
      builder.addErrors(errors).addWarnings(warnings);

      expect(builder.getErrorCount()).toBe(2);
      expect(builder.getWarningCount()).toBe(2);
      expect(builder.hasBlockingErrors()).toBe(true);

      // Test clear method
      builder.clear();

      expect(builder.getErrorCount()).toBe(0);
      expect(builder.getWarningCount()).toBe(0);
      expect(builder.hasBlockingErrors()).toBe(false);

      const result = builder.build();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should serialize errors to JSON correctly', () => {
      const error = createAgeError('startAge', -5);
      const json = error.toJSON();

      expect(json).toMatchObject({
        name: 'DynamicGlidepathValidationError',
        code: GLIDEPATH_ERROR_CODES.NEGATIVE_AGE,
        field: 'startAge',
        value: -5,
        severity: 'error',
        category: 'validation',
        constraint: expect.any(String),
        suggestion: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(String),
        context: expect.any(Object),
      });

      // Verify timestamp is valid ISO string
      expect(() => new Date(json.timestamp as string)).not.toThrow();

      // Verify the structure allows JSON serialization
      expect(() => JSON.stringify(json)).not.toThrow();
    });

    it('should provide user-friendly error messages', () => {
      const error = createAgeError('startAge', -5);
      const userMessage = error.getUserFriendlyMessage();

      expect(userMessage).toContain(error.constraint);
      expect(userMessage).toContain(error.suggestion);
      expect(userMessage).not.toContain('Received:'); // Should not include technical details
    });

    it('should correctly identify blocking vs non-blocking errors', () => {
      const error = createAgeError('startAge', -5);
      const warning = createWarning(
        GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
        'startReturn',
        0.25
      );

      expect(error.isBlockingError()).toBe(true);
      expect(warning.isBlockingError()).toBe(false);

      expect(error.severity).toBe('error');
      expect(warning.severity).toBe('warning');
    });

    describe('Edge Cases and Error Conditions', () => {
      it('should handle invalid parameters in createAgeError', () => {
        expect(() => createAgeError('invalidField', 25)).toThrow(
          'Invalid age error parameters'
        );
      });

      it('should handle invalid parameters in createReturnRateError', () => {
        expect(() => createReturnRateError('invalidField', 0.08)).toThrow(
          'Invalid return rate error parameters'
        );
      });

      it('should handle invalid parameters in createAllocationError', () => {
        expect(() => createAllocationError('invalidField', 0.5)).toThrow(
          'Invalid allocation error parameters'
        );
      });

      it('should handle invalid parameters in createConfigurationError', () => {
        expect(() =>
          createConfigurationError('invalidField', 'value', ['option1'])
        ).toThrow('Invalid configuration error parameters');
      });

      it('should handle invalid parameters in createWaypointError', () => {
        expect(() => createWaypointError('invalidField', 'value')).toThrow(
          'Invalid waypoint error parameters'
        );
      });

      it('should handle invalid warning codes in createWarning', () => {
        expect(() =>
          createWarning('INVALID_CODE' as any, 'field', 'value')
        ).toThrow('No template found for warning code: INVALID_CODE');
      });

      it('should handle non-number values in createReturnRateError', () => {
        const error = createReturnRateError(
          'startReturn',
          'not-a-number' as any
        );
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_RETURN_TYPE);
        expect(error.constraint).toBe('Must be a number');
        expect(error.suggestion).toBe('Try: 0.08 for 8% annual return');
      });

      it('should handle non-number values in createAllocationError', () => {
        const error = createAllocationError(
          'startEquityWeight',
          'not-a-number' as any
        );
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION_TYPE);
        expect(error.constraint).toBe('Must be a number');
        expect(error.suggestion).toBe('Try: 0.70 for 70% allocation');
      });

      it('should handle allocation values > 1 with percentage suggestion', () => {
        const error = createAllocationError('startEquityWeight', 80);
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION);
        expect(error.suggestion).toContain(
          'Did you mean 0.80? (80% as decimal)'
        );
      });

      it('should handle glidepathConfig field in createConfigurationError', () => {
        const error = createConfigurationError(
          'glidepathConfig',
          { invalid: 'config' },
          []
        );
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_CONFIG_STRUCTURE);
        expect(error.suggestion).toContain('mode: "fixed-return"');
      });

      it('should handle waypoints field in createWaypointError', () => {
        const error = createWaypointError('waypoints', []);
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.EMPTY_WAYPOINTS);
        expect(error.suggestion).toContain('age: 30, value: 0.80');
      });

      it('should handle age field in createWaypointError', () => {
        const error = createWaypointError('age', -5, 0);
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_WAYPOINT_AGE);
        expect(error.field).toBe('age[0]');
        expect(error.suggestion).toContain('age: 35 for waypoint at age 35');
      });

      it('should handle value field in createWaypointError', () => {
        const error = createWaypointError('value', 'invalid', 1);
        expect(error.code).toBe(GLIDEPATH_ERROR_CODES.INVALID_WAYPOINT_VALUE);
        expect(error.field).toBe('value[1]');
        expect(error.suggestion).toContain('0.08 for 8% return');
      });
    });

    describe('Utility Functions', () => {
      it('should correctly identify warnings with isWarning', () => {
        const error = createAgeError('startAge', -5);
        const warning = createWarning(
          GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
          'startReturn',
          0.25
        );

        expect(isWarning(error)).toBe(false);
        expect(isWarning(warning)).toBe(true);
      });

      it('should group errors by category correctly', () => {
        const errors = [
          createAgeError('startAge', -5), // validation
          createConfigurationError('mode', 'invalid', ['fixed']), // configuration
          createCalculationError('Test calc error'), // calculation
        ];

        const grouped = groupByCategory(errors);
        expect(grouped.validation).toHaveLength(1);
        expect(grouped.configuration).toHaveLength(1);
        expect(grouped.calculation).toHaveLength(1);
        expect(grouped.performance).toHaveLength(0);
        expect(grouped.usability).toHaveLength(0);
      });

      it('should test all warning templates', () => {
        const warningCodes = [
          GLIDEPATH_ERROR_CODES.LONG_SIMULATION_WARNING,
          GLIDEPATH_ERROR_CODES.LARGE_CONTRIBUTION_WARNING,
          GLIDEPATH_ERROR_CODES.UNUSUAL_ALLOCATION_PROGRESSION,
          GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
          GLIDEPATH_ERROR_CODES.EXTREME_LOSS_WARNING,
        ];

        warningCodes.forEach((code) => {
          const warning = createWarning(code, 'testField', 'testValue');
          expect(warning.code).toBe(code);
          expect(warning.severity).toBe('warning');
          expect(['usability', 'validation', 'performance']).toContain(
            warning.category
          );
          expect(warning.constraint).toBeTruthy();
          expect(warning.suggestion).toBeTruthy();
        });
      });
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

    it('should validate that constants work with error handling', () => {
      // Test that validation constants can be used in error creation
      const invalidAge = GLIDEPATH_VALIDATION.AGES.MIN_AGE - 1; // -0.9
      const ageError = createAgeError('startAge', invalidAge);

      expect(ageError.value).toBe(invalidAge);
      expect(ageError.code).toBe(GLIDEPATH_ERROR_CODES.NEGATIVE_AGE);
    });

    it('should validate that error messages reference validation constants', () => {
      // Ensure error messages are consistent with validation limits
      expect(GLIDEPATH_ERROR_MESSAGES.RETURNS.RETURN_TOO_LOW).toContain(
        '-0.99'
      );
      expect(GLIDEPATH_VALIDATION.RETURNS.MIN_RETURN).toBe(-0.99);

      expect(GLIDEPATH_ERROR_MESSAGES.AGES.AGE_DIFFERENCE_TOO_SMALL).toContain(
        '1 year'
      );
      expect(GLIDEPATH_VALIDATION.AGES.MIN_AGE_DIFFERENCE).toBe(1);
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

    it('should successfully validate configurations and produce meaningful errors', () => {
      const builder = new ValidationResultBuilder();

      // Test various validation scenarios
      try {
        createAgeError('startAge', -5);
      } catch (error) {
        // Expected for this test - the error should be caught in production
      }

      // Create a valid error and test it
      const error = createFinancialError('monthlyContribution', -500);
      builder.addError(error);

      const result = builder.build();
      expect(result.isValid).toBe(false);
      expect(result.errors[0].suggestion).toContain(
        'Try: 0 if not making regular contributions'
      );
    });

    it('should format errors for display correctly', () => {
      const errors = [
        createAgeError('startAge', -5),
        createReturnRateError('equityReturn', -1.2),
      ];

      const consoleOutput = formatForConsole(errors);
      expect(consoleOutput).toContain('❌ ERRORS:');
      expect(consoleOutput).toContain('startAge');
      expect(consoleOutput).toContain('equityReturn');

      const apiOutput = formatForAPI(errors);
      expect(apiOutput.errors).toHaveLength(2);
      expect(apiOutput.summary.errorCount).toBe(2);
    });

    it('should format console output with different options', () => {
      const errors = [
        createAgeError('startAge', -5),
        createWarning(
          GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING,
          'startReturn',
          0.25
        ),
      ];

      // Test with all options enabled
      const fullOutput = formatForConsole(errors, {
        showSuggestions: true,
        showErrorCodes: true,
        groupByCategory: true,
      });

      expect(fullOutput).toContain('💡 Try:');
      expect(fullOutput).toContain('NEGATIVE_AGE');
      expect(fullOutput).toContain('VALIDATION');

      // Test with minimal options
      const minimalOutput = formatForConsole(errors, {
        showSuggestions: false,
        showErrorCodes: false,
        groupByCategory: false,
      });

      expect(minimalOutput).not.toContain('💡 Try:');
      expect(minimalOutput).not.toContain('NEGATIVE_AGE');
    });

    it('should handle empty error array in formatForConsole', () => {
      const output = formatForConsole([]);
      expect(output).toBe('✅ No errors found');
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
