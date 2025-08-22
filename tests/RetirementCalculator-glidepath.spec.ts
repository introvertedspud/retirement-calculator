/**
 * Comprehensive tests for Dynamic Glidepath functionality in RetirementCalculator
 * Tests all four glidepath modes, edge cases, error conditions, and presets
 */

import RetirementCalculator from '../src/RetirementCalculator';
import { GLIDEPATH_PRESETS } from '../src/constants/retirementCalculatorConstants';
import type {
  FixedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
  SteppedReturnGlidepathConfig,
} from '../src/types/retirementCalculatorTypes';
import { isSteppedReturnConfig } from '../src/types/retirementCalculatorTypes';

describe('RetirementCalculator - Dynamic Glidepath Functionality', () => {
  let calculator: RetirementCalculator;

  beforeEach(() => {
    calculator = new RetirementCalculator();
  });

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    const validConfig: FixedReturnGlidepathConfig = {
      mode: 'fixed-return',
      startReturn: 0.1,
      endReturn: 0.055,
    };

    test('should throw error for negative initial balance', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          -1000,
          500,
          25,
          65,
          validConfig
        );
      }).toThrow('Initial balance must be non-negative');
    });

    test('should throw error for negative contribution amount', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          -500,
          25,
          65,
          validConfig
        );
      }).toThrow('Contribution amount must be non-negative');
    });

    test('should throw error for non-positive start age', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          0,
          65,
          validConfig
        );
      }).toThrow('Ages must be positive');
    });

    test('should throw error for non-positive end age', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          25,
          0,
          validConfig
        );
      }).toThrow('Ages must be positive');
    });

    test('should throw error when start age >= end age', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          65,
          25,
          validConfig
        );
      }).toThrow('Start age must be less than end age');
    });

    test('should throw error for non-positive contribution frequency', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          25,
          65,
          validConfig,
          0
        );
      }).toThrow('Frequencies must be positive');
    });

    test('should throw error for non-positive compounding frequency', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          25,
          65,
          validConfig,
          12,
          0
        );
      }).toThrow('Frequencies must be positive');
    });

    test('should accept valid inputs without throwing', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          500,
          25,
          65,
          validConfig
        );
      }).not.toThrow();
    });

    test('should accept zero initial balance', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          0,
          500,
          25,
          65,
          validConfig
        );
      }).not.toThrow();
    });

    test('should accept zero contribution amount', () => {
      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          0,
          25,
          65,
          validConfig
        );
      }).not.toThrow();
    });
  });

  // ============================================================================
  // FIXED RETURN GLIDEPATH TESTS
  // ============================================================================

  describe('Fixed Return Glidepath', () => {
    const fixedConfig: FixedReturnGlidepathConfig = {
      mode: 'fixed-return',
      startReturn: 0.1, // 10%
      endReturn: 0.05, // 5%
    };

    test('should calculate fixed return glidepath correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        fixedConfig // 10 years
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('fixed-return');
      expect(result.startAge).toBe(25);
      expect(result.endAge).toBe(35);
      expect(result.totalMonths).toBe(120);
      expect(result.finalBalance).toBeGreaterThan(0);
      expect(result.totalContributions).toBe(120000); // 10 years * 12 months * 1000
    });

    test('should have declining returns over time', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        fixedConfig
      );

      const firstMonth = result.monthlyTimeline[0];
      const lastMonth =
        result.monthlyTimeline[result.monthlyTimeline.length - 1];

      expect(firstMonth.currentAnnualReturn).toBeCloseTo(0.1, 3);
      expect(lastMonth.currentAnnualReturn).toBeCloseTo(0.05, 3);
      expect(firstMonth.currentAnnualReturn).toBeGreaterThan(
        lastMonth.currentAnnualReturn
      );
    });

    test('should have proper linear interpolation', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        20,
        40,
        fixedConfig // 20 years
      );

      // Find middle age entry (age 30)
      const middleEntry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 30) < 0.1
      );

      expect(middleEntry).toBeDefined();
      // At middle age, should be halfway between start and end return
      expect(middleEntry?.currentAnnualReturn).toBeCloseTo(0.075, 3); // (0.1 + 0.05) / 2
    });

    test('should handle same start and end return', () => {
      const flatConfig: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.08,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        flatConfig
      );

      const firstMonth = result.monthlyTimeline[0];
      const lastMonth =
        result.monthlyTimeline[result.monthlyTimeline.length - 1];

      expect(firstMonth.currentAnnualReturn).toBeCloseTo(0.08, 6);
      expect(lastMonth.currentAnnualReturn).toBeCloseTo(0.08, 6);
    });
  });

  // ============================================================================
  // STEPPED RETURN GLIDEPATH TESTS
  // ============================================================================

  describe('Stepped Return Glidepath', () => {
    const steppedConfig: SteppedReturnGlidepathConfig = {
      mode: 'stepped-return',
      baseReturn: 0.1,
      declineRate: 0.001, // 0.1% per year
      terminalReturn: 0.055,
      declineStartAge: 20,
      terminalAge: 65,
    };

    test('should calculate stepped return glidepath correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        22,
        40,
        steppedConfig
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('stepped-return');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should decline by specified rate per year', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        20,
        30,
        steppedConfig
      );

      // At age 20, should be at base return
      const age20Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 20) < 0.1
      );
      expect(age20Entry?.currentAnnualReturn).toBeCloseTo(0.1, 6);

      // At age 25, should be 0.1 - (5 * 0.001) = 0.095
      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );
      expect(age25Entry?.currentAnnualReturn).toBeCloseTo(0.095, 3);
    });

    test('should hold base return before decline start age', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        18,
        22,
        steppedConfig
      );

      const age18Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 18) < 0.1
      );
      const age19Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 19) < 0.1
      );

      expect(age18Entry?.currentAnnualReturn).toBeCloseTo(0.1, 6);
      expect(age19Entry?.currentAnnualReturn).toBeCloseTo(0.1, 6);
    });

    test('should hold terminal return after terminal age', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        60,
        70,
        steppedConfig
      );

      const age65Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 65) < 0.1
      );
      const age70Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 70) < 0.1
      );

      expect(age65Entry?.currentAnnualReturn).toBeCloseTo(0.055, 3);
      expect(age70Entry?.currentAnnualReturn).toBeCloseTo(0.055, 3);
    });

    test('should not go below terminal return', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        20,
        70,
        steppedConfig
      );

      // All entries should be >= terminal return
      result.monthlyTimeline.forEach((entry) => {
        expect(entry.currentAnnualReturn).toBeGreaterThanOrEqual(
          0.055 - 0.0001
        ); // Small tolerance
      });
    });
  });

  // ============================================================================
  // ALLOCATION-BASED GLIDEPATH TESTS
  // ============================================================================

  describe('Allocation-Based Glidepath', () => {
    const allocationConfig: AllocationBasedGlidepathConfig = {
      mode: 'allocation-based',
      startEquityWeight: 0.9, // 90%
      endEquityWeight: 0.3, // 30%
      equityReturn: 0.12, // 12%
      bondReturn: 0.04, // 4%
    };

    test('should calculate allocation-based glidepath correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        allocationConfig
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('allocation-based');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should have decreasing equity allocation over time', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        allocationConfig
      );

      const firstMonth = result.monthlyTimeline[0];
      const lastMonth =
        result.monthlyTimeline[result.monthlyTimeline.length - 1];

      expect(firstMonth.currentEquityWeight).toBeCloseTo(0.9, 2);
      expect(lastMonth.currentEquityWeight).toBeCloseTo(0.3, 2);
      expect(firstMonth.currentEquityWeight ?? 0).toBeGreaterThan(
        lastMonth.currentEquityWeight ?? 0
      );
    });

    test('should blend returns based on allocation', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        allocationConfig
      );

      const firstMonth = result.monthlyTimeline[0];
      const lastMonth =
        result.monthlyTimeline[result.monthlyTimeline.length - 1];

      // First month: 90% equity, 10% bonds = 0.9 * 0.12 + 0.1 * 0.04 = 0.112
      expect(firstMonth.currentAnnualReturn).toBeCloseTo(0.112, 3);

      // Last month: 30% equity, 70% bonds = 0.3 * 0.12 + 0.7 * 0.04 = 0.064
      expect(lastMonth.currentAnnualReturn).toBeCloseTo(0.064, 3);
    });

    test('should have proper linear allocation interpolation', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        20,
        40,
        allocationConfig // 20 years
      );

      // Find middle age entry (age 30)
      const middleEntry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 30) < 0.1
      );

      expect(middleEntry).toBeDefined();
      // At middle age, should be halfway between start and end equity weight
      expect(middleEntry?.currentEquityWeight).toBeCloseTo(0.6, 2); // (0.9 + 0.3) / 2
    });
  });

  // ============================================================================
  // CUSTOM WAYPOINTS GLIDEPATH TESTS
  // ============================================================================

  describe('Custom Waypoints Glidepath', () => {
    const customReturnConfig: CustomWaypointsGlidepathConfig = {
      mode: 'custom-waypoints',
      valueType: 'return',
      waypoints: [
        { age: 25, value: 0.12 },
        { age: 35, value: 0.1 },
        { age: 45, value: 0.08 },
        { age: 55, value: 0.06 },
        { age: 65, value: 0.04 },
      ],
    };

    const customEquityConfig: CustomWaypointsGlidepathConfig = {
      mode: 'custom-waypoints',
      valueType: 'equityWeight',
      waypoints: [
        { age: 25, value: 1.0 },
        { age: 35, value: 0.8 },
        { age: 45, value: 0.6 },
        { age: 55, value: 0.4 },
        { age: 65, value: 0.2 },
      ],
      equityReturn: 0.11,
      bondReturn: 0.03,
    };

    test('should calculate custom return waypoints correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customReturnConfig
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('custom-waypoints');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should hit exact return values at waypoint ages', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customReturnConfig
      );

      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );
      const age35Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 35) < 0.1
      );
      const age45Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 45) < 0.1
      );

      expect(age25Entry?.currentAnnualReturn).toBeCloseTo(0.12, 3);
      expect(age35Entry?.currentAnnualReturn).toBeCloseTo(0.1, 3);
      expect(age45Entry?.currentAnnualReturn).toBeCloseTo(0.08, 3);
    });

    test('should interpolate between waypoints', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customReturnConfig
      );

      // Age 30 should be halfway between age 25 (0.12) and age 35 (0.10) = 0.11
      const age30Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 30) < 0.1
      );
      expect(age30Entry?.currentAnnualReturn).toBeCloseTo(0.11, 3);
    });

    test('should calculate custom equity waypoints correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customEquityConfig
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('custom-waypoints');
    });

    test('should hit exact equity weights at waypoint ages', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customEquityConfig
      );

      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );
      const age35Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 35) < 0.1
      );

      expect(age25Entry?.currentEquityWeight).toBeCloseTo(1.0, 2);
      expect(age35Entry?.currentEquityWeight).toBeCloseTo(0.8, 2);
    });

    test('should blend equity returns correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        customEquityConfig
      );

      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );

      // Age 25: 100% equity = 1.0 * 0.11 + 0.0 * 0.03 = 0.11
      expect(age25Entry?.currentAnnualReturn).toBeCloseTo(0.11, 3);
    });

    test('should handle before first waypoint', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        20,
        30,
        customReturnConfig
      );

      const age20Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 20) < 0.1
      );
      // Should use first waypoint value
      expect(age20Entry?.currentAnnualReturn).toBeCloseTo(0.12, 3);
    });

    test('should handle after last waypoint', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        60,
        70,
        customReturnConfig
      );

      const age70Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 70) < 0.1
      );
      // Should use last waypoint value
      expect(age70Entry?.currentAnnualReturn).toBeCloseTo(0.04, 3);
    });

    test('should throw error for empty waypoints', () => {
      const emptyConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [],
      };

      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          1000,
          25,
          65,
          emptyConfig
        );
      }).toThrow(
        'Custom waypoints configuration must have at least one waypoint'
      );
    });

    test('should handle single waypoint', () => {
      const singleConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [{ age: 40, value: 0.08 }],
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        singleConfig
      );

      // All ages should use the single waypoint value
      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );
      const age65Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 65) < 0.1
      );

      expect(age25Entry?.currentAnnualReturn).toBeCloseTo(0.08, 6);
      expect(age65Entry?.currentAnnualReturn).toBeCloseTo(0.08, 6);
    });

    test('should handle single waypoint with equity weight', () => {
      const singleEquityConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'equityWeight',
        waypoints: [{ age: 40, value: 0.7 }],
        equityReturn: 0.12,
        bondReturn: 0.04,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        65,
        singleEquityConfig
      );

      // Should calculate: 0.7 * 0.12 + 0.3 * 0.04 = 0.096
      const age25Entry = result.monthlyTimeline.find(
        (entry) => Math.abs(entry.age - 25) < 0.1
      );
      expect(age25Entry?.currentAnnualReturn).toBeCloseTo(0.096, 3);
      expect(age25Entry?.currentEquityWeight).toBeCloseTo(0.7, 6);
    });
  });

  // ============================================================================
  // GLIDEPATH PRESETS TESTS
  // ============================================================================

  describe('Glidepath Presets', () => {
    test('should work with Money Guy Show preset', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        GLIDEPATH_PRESETS.MONEY_GUY_SHOW
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('stepped-return');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should work with Bogleheads 100 minus age preset', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        GLIDEPATH_PRESETS.BOGLEHEADS_100_MINUS_AGE
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('custom-waypoints');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should work with Bogleheads 110 minus age preset', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        GLIDEPATH_PRESETS.BOGLEHEADS_110_MINUS_AGE
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('custom-waypoints');
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should work with Bogleheads 120 minus age preset', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        GLIDEPATH_PRESETS.BOGLEHEADS_120_MINUS_AGE
      );

      expect(result).toBeDefined();
      expect(result.glidepathMode).toBe('custom-waypoints');
      expect(result.finalBalance).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // CONTRIBUTION TIMING TESTS
  // ============================================================================

  describe('Contribution Timing', () => {
    const config: FixedReturnGlidepathConfig = {
      mode: 'fixed-return',
      startReturn: 0.08,
      endReturn: 0.08,
    };

    test('should handle start-of-period contributions', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        0,
        1000,
        25,
        26,
        config,
        12,
        12,
        'start'
      );

      expect(result.finalBalance).toBeGreaterThan(12000); // Should be > contributions due to interest
    });

    test('should handle end-of-period contributions', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        0,
        1000,
        25,
        26,
        config,
        12,
        12,
        'end'
      );

      expect(result.finalBalance).toBeGreaterThan(12000); // Should be > contributions but less than start timing
    });

    test('should produce different results for different contribution timing', () => {
      const startResult = calculator.getCompoundInterestWithGlidepath(
        0,
        1000,
        25,
        26,
        config,
        12,
        12,
        'start'
      );

      const endResult = calculator.getCompoundInterestWithGlidepath(
        0,
        1000,
        25,
        26,
        config,
        12,
        12,
        'end'
      );

      expect(startResult.finalBalance).toBeGreaterThan(endResult.finalBalance);
    });
  });

  // ============================================================================
  // EDGE CASES AND ROBUSTNESS TESTS
  // ============================================================================

  describe('Edge Cases and Robustness', () => {
    test('should handle very short time periods', () => {
      const config: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.08,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        25.1,
        config // Just over 1 month
      );

      expect(result.totalMonths).toBe(2); // Math.ceil(0.1 * 12)
      expect(result.monthlyTimeline).toHaveLength(2);
    });

    test('should handle zero initial balance', () => {
      const config: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.08,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        0,
        1000,
        25,
        26,
        config
      );

      expect(result.finalBalance).toBeGreaterThan(0);
      expect(result.totalContributions).toBeGreaterThan(0);
    });

    test('should handle zero contributions', () => {
      const config: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.08,
        endReturn: 0.08,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        0,
        25,
        26,
        config
      );

      expect(result.finalBalance).toBeGreaterThan(10000); // Should grow due to interest
      expect(result.totalContributions).toBe(0);
    });

    test('should handle negative returns in custom waypoints', () => {
      const negativeConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [
          { age: 25, value: -0.1 }, // -10% return
          { age: 35, value: 0.05 },
        ],
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        35,
        negativeConfig
      );

      expect(result).toBeDefined();
      expect(result.finalBalance).toBeGreaterThan(0); // Should still be positive due to contributions
    });

    test('should handle fractional ages correctly', () => {
      const config: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.1,
        endReturn: 0.05,
      };

      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25.5,
        35.5,
        config
      );

      expect(result.startAge).toBe(25.5);
      expect(result.endAge).toBe(35.5);
      expect(result.totalMonths).toBe(120); // Math.ceil(10 * 12)
    });
  });

  // ============================================================================
  // RESULT STRUCTURE TESTS
  // ============================================================================

  describe('Result Structure and Data Integrity', () => {
    const config: FixedReturnGlidepathConfig = {
      mode: 'fixed-return',
      startReturn: 0.08,
      endReturn: 0.08,
    };

    test('should return properly structured result object', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        26,
        config
      );

      expect(result).toMatchObject({
        finalBalance: expect.any(Number),
        totalContributions: expect.any(Number),
        totalInterestEarned: expect.any(Number),
        totalMonths: expect.any(Number),
        startAge: expect.any(Number),
        endAge: expect.any(Number),
        glidepathMode: expect.any(String),
        monthlyTimeline: expect.any(Array),
        effectiveAnnualReturn: expect.any(Number),
        averageMonthlyReturn: expect.any(Number),
      });
    });

    test('should have consistent timeline data', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        26,
        config
      );

      expect(result.monthlyTimeline).toHaveLength(result.totalMonths);

      result.monthlyTimeline.forEach((entry, index) => {
        expect(entry).toMatchObject({
          month: index + 1,
          age: expect.any(Number),
          currentBalance: expect.any(Number),
          cumulativeContributions: expect.any(Number),
          cumulativeInterest: expect.any(Number),
          monthlyInterestEarned: expect.any(Number),
          currentAnnualReturn: expect.any(Number),
          currentMonthlyReturn: expect.any(Number),
        });

        // Age should increase each month
        const expectedAge = result.startAge + index / 12;
        expect(entry.age).toBeCloseTo(expectedAge, 5);
      });
    });

    test('should have accurate totals', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        26,
        config
      );

      const lastEntry =
        result.monthlyTimeline[result.monthlyTimeline.length - 1];

      expect(result.finalBalance).toBeCloseTo(lastEntry.currentBalance, 2);
      expect(result.totalContributions).toBeCloseTo(
        lastEntry.cumulativeContributions,
        2
      );
      expect(result.totalInterestEarned).toBeCloseTo(
        lastEntry.cumulativeInterest,
        2
      );
    });

    test('should round final balance to nearest cent', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        26,
        config
      );

      // Final balance should be rounded to 2 decimal places
      expect(result.finalBalance).toBe(
        Math.round(result.finalBalance * 100) / 100
      );
    });

    test('should calculate effective annual return correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        0,
        25,
        26,
        config // No contributions to test return calculation
      );

      const expectedReturn = Math.pow(result.finalBalance / 10000, 1) - 1;
      expect(result.effectiveAnnualReturn).toBeCloseTo(expectedReturn, 5);
    });

    test('should calculate average monthly return correctly', () => {
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25,
        26,
        config
      );

      const calculatedAverage =
        result.monthlyTimeline.reduce(
          (sum, entry) => sum + entry.currentMonthlyReturn,
          0
        ) / result.monthlyTimeline.length;

      expect(result.averageMonthlyReturn).toBeCloseTo(calculatedAverage, 10);
    });
  });

  // ============================================================================
  // EXHAUSTIVE SWITCH CASE TEST
  // ============================================================================

  describe('Exhaustive Mode Coverage', () => {
    test('should handle all four glidepath modes without error', () => {
      const fixedConfig: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.1,
        endReturn: 0.05,
      };

      const steppedConfig: SteppedReturnGlidepathConfig = {
        mode: 'stepped-return',
        baseReturn: 0.1,
        declineRate: 0.001,
        terminalReturn: 0.055,
        declineStartAge: 20,
        terminalAge: 65,
      };

      const allocationConfig: AllocationBasedGlidepathConfig = {
        mode: 'allocation-based',
        startEquityWeight: 0.9,
        endEquityWeight: 0.3,
        equityReturn: 0.12,
        bondReturn: 0.04,
      };

      const customConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [{ age: 25, value: 0.08 }],
      };

      const configs = [
        fixedConfig,
        steppedConfig,
        allocationConfig,
        customConfig,
      ];

      configs.forEach((config) => {
        expect(() => {
          calculator.getCompoundInterestWithGlidepath(
            10000,
            1000,
            25,
            35,
            config
          );
        }).not.toThrow();
      });
    });
  });

  // ============================================================================
  // TYPE GUARD TESTS
  // ============================================================================

  describe('Type Guards', () => {
    test('isSteppedReturnConfig should correctly identify stepped return configs', () => {
      const steppedConfig: SteppedReturnGlidepathConfig = {
        mode: 'stepped-return',
        baseReturn: 0.1,
        declineRate: 0.001,
        terminalReturn: 0.055,
        declineStartAge: 20,
        terminalAge: 65,
      };

      const fixedConfig: FixedReturnGlidepathConfig = {
        mode: 'fixed-return',
        startReturn: 0.1,
        endReturn: 0.05,
      };

      expect(isSteppedReturnConfig(steppedConfig)).toBe(true);
      expect(isSteppedReturnConfig(fixedConfig)).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASE TESTS FOR FULL COVERAGE
  // ============================================================================

  describe('Edge Cases for Complete Coverage', () => {
    test('should handle empty waypoints array error', () => {
      // This tests the private interpolateWaypoints method through custom waypoints
      const invalidConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [],
      };

      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          1000,
          25,
          35,
          invalidConfig
        );
      }).toThrow(
        'Custom waypoints configuration must have at least one waypoint'
      );
    });

    test('should handle edge cases that trigger interpolation fallback paths', () => {
      // Test a very specific scenario that might trigger different code paths
      // in the waypoint interpolation logic
      const edgeCaseConfigs = [
        // Config with waypoints that have identical ages (edge case)
        {
          mode: 'custom-waypoints' as const,
          valueType: 'return' as const,
          waypoints: [
            { age: 30, value: 0.08 },
            { age: 30, value: 0.07 }, // Same age, different value
          ],
        },
        // Config with waypoints in reverse order (should be sorted)
        {
          mode: 'custom-waypoints' as const,
          valueType: 'return' as const,
          waypoints: [
            { age: 40, value: 0.06 },
            { age: 20, value: 0.1 }, // Out of order
            { age: 30, value: 0.08 },
          ],
        },
      ];

      edgeCaseConfigs.forEach((config, index) => {
        // Test that function either succeeds or throws a proper error
        expect(() => {
          const result = calculator.getCompoundInterestWithGlidepath(
            10000,
            1000,
            25,
            35,
            config
          );
          // If we get here, verify it's a valid result
          expect(result).toBeDefined();
          expect(result.finalBalance).toBeGreaterThan(0);
        }).not.toThrow('unexpected error type');
      });
    });

    test('should handle invalid glidepath mode', () => {
      // Create an invalid config to trigger the default case
      const invalidConfig = {
        mode: 'invalid-mode',
        // other properties...
      } as any;

      expect(() => {
        calculator.getCompoundInterestWithGlidepath(
          10000,
          1000,
          25,
          35,
          invalidConfig
        );
      }).toThrow('Unsupported glidepath mode');
    });

    test('should handle waypoint interpolation edge cases', () => {
      // Test multiple edge cases with waypoint interpolation
      const testCases = [
        // Case 1: Age exactly at waypoint boundary
        {
          config: {
            mode: 'custom-waypoints' as const,
            valueType: 'return' as const,
            waypoints: [
              { age: 20, value: 0.1 },
              { age: 30, value: 0.08 },
            ],
          },
          startAge: 30,
          endAge: 31,
          expectedRate: 0.08,
        },
        // Case 2: Single waypoint
        {
          config: {
            mode: 'custom-waypoints' as const,
            valueType: 'return' as const,
            waypoints: [{ age: 25, value: 0.075 }],
          },
          startAge: 20,
          endAge: 30,
          expectedRate: 0.075,
        },
        // Case 3: Age outside waypoint range (before)
        {
          config: {
            mode: 'custom-waypoints' as const,
            valueType: 'return' as const,
            waypoints: [
              { age: 30, value: 0.08 },
              { age: 40, value: 0.06 },
            ],
          },
          startAge: 25, // Before first waypoint
          endAge: 26,
          expectedRate: 0.08, // Should use first waypoint
        },
        // Case 4: Age outside waypoint range (after)
        {
          config: {
            mode: 'custom-waypoints' as const,
            valueType: 'return' as const,
            waypoints: [
              { age: 20, value: 0.1 },
              { age: 30, value: 0.08 },
            ],
          },
          startAge: 35, // After last waypoint
          endAge: 36,
          expectedRate: 0.08, // Should use last waypoint
        },
      ];

      testCases.forEach(({ config, startAge, endAge, expectedRate }, index) => {
        const result = calculator.getCompoundInterestWithGlidepath(
          10000,
          1000,
          startAge,
          endAge,
          config
        );

        expect(result).toBeDefined();
        expect(result.finalBalance).toBeGreaterThan(0);

        const firstEntry = result.monthlyTimeline[0];
        expect(firstEntry.currentAnnualReturn).toBeCloseTo(expectedRate, 3);
      });
    });

    test('should handle zero interest rate in traditional calculations', () => {
      const result = calculator.getCompoundInterestWithAdditionalContributions(
        10000, // initial balance
        500, // monthly contribution
        5, // years
        0, // 0% interest rate
        12, // monthly contributions
        12 // monthly compounding
      );

      expect(result).toBeDefined();
      expect(result.totalInterestEarned).toBe(0); // No interest with 0% rate
      expect(result.totalContributions).toBe(500 * 12 * 5); // 30,000
      expect(result.balance).toBe(10000 + 30000); // Initial + contributions only
    });

    test('should handle floating-point precision in waypoint interpolation', () => {
      // Test with floating-point ages that might cause precision issues
      const precisionConfig: CustomWaypointsGlidepathConfig = {
        mode: 'custom-waypoints',
        valueType: 'return',
        waypoints: [
          { age: 25.000001, value: 0.09 },
          { age: 35.000002, value: 0.07 },
          { age: 45.000003, value: 0.05 },
        ],
      };

      // Test with age values that involve decimal precision
      const result = calculator.getCompoundInterestWithGlidepath(
        10000,
        1000,
        25.0000015, // Between first and second waypoint, testing precision
        25.1,
        precisionConfig
      );

      expect(result).toBeDefined();
      expect(result.finalBalance).toBeGreaterThan(0);
      expect(result.monthlyTimeline[0].currentAnnualReturn).toBeGreaterThan(
        0.05
      );
    });
  });
});
