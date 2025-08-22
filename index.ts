export { default as RetirementCalculator } from './src/RetirementCalculator';

// Constants
export {
  CONTRIBUTION_FREQUENCY,
  GLIDEPATH_DEFAULTS,
  GLIDEPATH_VALIDATION,
  GLIDEPATH_MATH,
  GLIDEPATH_TEMPLATES,
  GLIDEPATH_ERROR_MESSAGES,
  GLIDEPATH_PERFORMANCE,
  GLIDEPATH_PRESETS,
} from './src/constants/retirementCalculatorConstants';

// Traditional types
export type {
  ContributionFrequencyType,
  DetermineContributionType,
  CompoundingInterestObjectType,
  CompoundingPeriodDetailsType,
  YearlyCompoundingDetails,
} from './src/types/retirementCalculatorTypes';

// Dynamic glidepath types
export type {
  ContributionTiming,
  GlidepathMode,
  FixedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
  SteppedReturnGlidepathConfig,
  GlidepathWaypoint,
  DynamicGlidepathConfig,
  MonthlyTimelineEntry,
  DynamicGlidepathResult,
  ConfigForMode,
  RequiredFields,
  CustomWaypointsWithReturns,
} from './src/types/retirementCalculatorTypes';

// Type guards
export {
  isFixedReturnConfig,
  isAllocationBasedConfig,
  isCustomWaypointsConfig,
  isSteppedReturnConfig,
} from './src/types/retirementCalculatorTypes';

// Error handling
export {
  GLIDEPATH_ERROR_CODES,
  DynamicGlidepathError,
  DynamicGlidepathValidationError,
  DynamicGlidepathConfigurationError,
  DynamicGlidepathCalculationError,
  ValidationResultBuilder,
  createAgeError,
  createFinancialError,
  createReturnRateError,
  createAllocationError,
  createConfigurationError,
  createWaypointError,
  createWarning,
  createCalculationError,
  groupByCategory,
  groupBySeverity,
  getSummary,
  formatForConsole,
  formatForAPI,
  isDynamicGlidepathError,
  isValidationError,
  isConfigurationError,
  isCalculationError,
  isWarning,
  isBlockingError,
} from './src/errors/DynamicGlidepathErrors';

// Error types
export type {
  GlidepathErrorCode,
  ErrorSeverity,
  ErrorCategory,
  GlidepathErrorInfo,
  ValidationResult,
} from './src/errors/DynamicGlidepathErrors';
