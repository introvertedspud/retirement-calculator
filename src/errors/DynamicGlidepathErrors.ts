/**
 * @fileoverview Comprehensive error handling infrastructure for Dynamic Glidepath calculations.
 *
 * This module provides:
 * - Custom error classes for all validation scenarios
 * - Error codes and categorization system
 * - User-friendly error messages with context
 * - Type guards and utilities for error handling
 * - Integration with existing TypeScript patterns
 *
 * @version 1.0.0
 */

// ============================================================================
// ERROR CODE DEFINITIONS
// ============================================================================

/**
 * Enumeration of all possible error codes for dynamic glidepath validation.
 * These codes provide machine-readable error identification.
 */
export const GLIDEPATH_ERROR_CODES = {
  // Age-related validation errors
  NEGATIVE_AGE: 'NEGATIVE_AGE',
  INVALID_AGE_RANGE: 'INVALID_AGE_RANGE',
  INSUFFICIENT_TIME_HORIZON: 'INSUFFICIENT_TIME_HORIZON',

  // Financial parameter validation errors
  NEGATIVE_BALANCE: 'NEGATIVE_BALANCE',
  NEGATIVE_CONTRIBUTION: 'NEGATIVE_CONTRIBUTION',

  // Return rate validation errors
  IMPOSSIBLE_LOSS: 'IMPOSSIBLE_LOSS',
  INVALID_RETURN_TYPE: 'INVALID_RETURN_TYPE',

  // Allocation validation errors
  INVALID_ALLOCATION: 'INVALID_ALLOCATION',
  INVALID_ALLOCATION_TYPE: 'INVALID_ALLOCATION_TYPE',

  // Configuration structure errors
  INVALID_CONFIG_STRUCTURE: 'INVALID_CONFIG_STRUCTURE',
  UNKNOWN_GLIDEPATH_MODE: 'UNKNOWN_GLIDEPATH_MODE',
  INVALID_CONTRIBUTION_TIMING: 'INVALID_CONTRIBUTION_TIMING',

  // Waypoint validation errors
  EMPTY_WAYPOINTS: 'EMPTY_WAYPOINTS',
  INVALID_WAYPOINT_AGE: 'INVALID_WAYPOINT_AGE',
  INVALID_WAYPOINT_VALUE: 'INVALID_WAYPOINT_VALUE',
  INVALID_VALUE_TYPE: 'INVALID_VALUE_TYPE',
  MISSING_EQUITY_RETURN: 'MISSING_EQUITY_RETURN',
  MISSING_BOND_RETURN: 'MISSING_BOND_RETURN',

  // Warning codes
  LONG_SIMULATION_WARNING: 'LONG_SIMULATION_WARNING',
  LARGE_CONTRIBUTION_WARNING: 'LARGE_CONTRIBUTION_WARNING',
  UNUSUAL_ALLOCATION_PROGRESSION: 'UNUSUAL_ALLOCATION_PROGRESSION',
  EXTREME_RETURN_WARNING: 'EXTREME_RETURN_WARNING',
  EXTREME_LOSS_WARNING: 'EXTREME_LOSS_WARNING',
  WAYPOINTS_OUTSIDE_RANGE: 'WAYPOINTS_OUTSIDE_RANGE',
  WAYPOINT_GAP_WARNING: 'WAYPOINT_GAP_WARNING',

  // Runtime errors
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  STRATEGY_CREATION_ERROR: 'STRATEGY_CREATION_ERROR',
  SIMULATION_ERROR: 'SIMULATION_ERROR',
} as const;

/**
 * Type for error code values.
 */
export type GlidepathErrorCode =
  (typeof GLIDEPATH_ERROR_CODES)[keyof typeof GLIDEPATH_ERROR_CODES];

/**
 * Error severity levels.
 */
export type ErrorSeverity = 'error' | 'warning';

/**
 * Error categories for grouping related errors.
 */
export type ErrorCategory =
  | 'validation'
  | 'configuration'
  | 'calculation'
  | 'performance'
  | 'usability';

// ============================================================================
// CORE ERROR INTERFACES
// ============================================================================

/**
 * Enhanced error information interface that extends the base Error.
 * Provides comprehensive context for debugging and user-facing applications.
 */
export type GlidepathErrorInfo = {
  /** Machine-readable error code */
  code: GlidepathErrorCode;
  /** Field name that caused the error */
  field: string;
  /** The invalid value that was provided */
  value: unknown;
  /** Description of the constraint that was violated */
  constraint: string;
  /** Helpful suggestion for fixing the error */
  suggestion: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Error category for grouping */
  category: ErrorCategory;
  /** Additional context data */
  context?: Record<string, unknown>;
};

/**
 * Validation result interface for comprehensive error reporting.
 */
export type ValidationResult = {
  /** Whether validation passed */
  isValid: boolean;
  /** Array of validation errors */
  errors: DynamicGlidepathValidationError[];
  /** Array of validation warnings */
  warnings: DynamicGlidepathValidationError[];
};

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Base class for all dynamic glidepath validation errors.
 * Extends the native Error class with enhanced error information.
 */
export class DynamicGlidepathError extends Error {
  public readonly name: string = 'DynamicGlidepathError';
  public readonly code: GlidepathErrorCode;
  public readonly field: string;
  public readonly value: unknown;
  public readonly constraint: string;
  public readonly suggestion: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(errorInfo: GlidepathErrorInfo) {
    const message = DynamicGlidepathError.formatErrorMessage(errorInfo);
    super(message);

    this.code = errorInfo.code;
    this.field = errorInfo.field;
    this.value = errorInfo.value;
    this.constraint = errorInfo.constraint;
    this.suggestion = errorInfo.suggestion;
    this.severity = errorInfo.severity;
    this.category = errorInfo.category;
    this.context = errorInfo.context ?? {};
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, DynamicGlidepathError);
    }
  }

  /**
   * Format error message with consistent structure.
   */
  private static formatErrorMessage(errorInfo: GlidepathErrorInfo): string {
    const valueStr =
      errorInfo.value !== undefined
        ? ` Received: ${String(errorInfo.value)}.`
        : '';
    return `Invalid ${errorInfo.field}:${valueStr} ${errorInfo.constraint}. ${errorInfo.suggestion}`;
  }

  /**
   * Convert error to JSON for serialization.
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      field: this.field,
      value: this.value,
      constraint: this.constraint,
      suggestion: this.suggestion,
      severity: this.severity,
      category: this.category,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly error summary for display.
   */
  public getUserFriendlyMessage(): string {
    return `${this.constraint}. ${this.suggestion}`;
  }

  /**
   * Check if this error should prevent calculation from proceeding.
   */
  public isBlockingError(): boolean {
    return this.severity === 'error';
  }
}

/**
 * Specific error class for validation errors.
 * Used for input parameter validation failures.
 */
export class DynamicGlidepathValidationError extends DynamicGlidepathError {
  public readonly name: string = 'DynamicGlidepathValidationError';

  constructor(errorInfo: GlidepathErrorInfo) {
    super({ ...errorInfo, category: 'validation' });
    this.name = 'DynamicGlidepathValidationError';
  }
}

/**
 * Specific error class for configuration errors.
 * Used for glidepath configuration structure issues.
 */
export class DynamicGlidepathConfigurationError extends DynamicGlidepathError {
  public readonly name: string = 'DynamicGlidepathConfigurationError';

  constructor(errorInfo: GlidepathErrorInfo) {
    super({ ...errorInfo, category: 'configuration' });
    this.name = 'DynamicGlidepathConfigurationError';
  }
}

/**
 * Specific error class for calculation runtime errors.
 * Used for errors that occur during the calculation process.
 */
export class DynamicGlidepathCalculationError extends DynamicGlidepathError {
  public readonly name: string = 'DynamicGlidepathCalculationError';

  constructor(errorInfo: GlidepathErrorInfo) {
    super({ ...errorInfo, category: 'calculation' });
    this.name = 'DynamicGlidepathCalculationError';
  }
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

/**
 * Create age-related validation errors.
 */
export function createAgeError(
  field: string,
  value: number,
  endAge?: number
): DynamicGlidepathValidationError {
  if (value <= 0) {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.NEGATIVE_AGE,
      field,
      value,
      constraint: 'Must be greater than 0',
      suggestion:
        'Try: startAge=25 for early career, startAge=40 for mid-career',
      severity: 'error',
      category: 'validation',
    });
  }

  if (endAge !== undefined && endAge !== null && value >= endAge) {
    const suggestedStartAge = Math.max(18, endAge - 40);
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_AGE_RANGE,
      field,
      value,
      constraint: 'startAge must be less than endAge',
      suggestion: `Try: startAge=${suggestedStartAge}, endAge=${endAge} for a ${
        endAge - suggestedStartAge
      }-year plan`,
      severity: 'error',
      category: 'validation',
      context: { endAge, suggestedStartAge },
    });
  }

  throw new Error('Invalid age error parameters');
}

/**
 * Create financial parameter validation errors.
 */
export function createFinancialError(
  field: string,
  value: number
): DynamicGlidepathValidationError {
  return new DynamicGlidepathValidationError({
    code:
      field === 'initialBalance'
        ? GLIDEPATH_ERROR_CODES.NEGATIVE_BALANCE
        : GLIDEPATH_ERROR_CODES.NEGATIVE_CONTRIBUTION,
    field,
    value,
    constraint: 'Must be non-negative',
    suggestion:
      field === 'initialBalance'
        ? 'Try: 0 if starting with no savings, or 25000 for $25K initial balance'
        : 'Try: 0 if not making regular contributions, or 1000 for $1K monthly contributions',
    severity: 'error',
    category: 'validation',
  });
}

/**
 * Create return rate validation errors.
 */
export function createReturnRateError(
  field: string,
  value: number
): DynamicGlidepathValidationError {
  if (typeof value !== 'number') {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_RETURN_TYPE,
      field,
      value,
      constraint: 'Must be a number',
      suggestion: 'Try: 0.08 for 8% annual return',
      severity: 'error',
      category: 'validation',
    });
  }

  if (value <= -1.0) {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.IMPOSSIBLE_LOSS,
      field,
      value,
      constraint: 'Must be greater than -1.0 (cannot lose more than 100%)',
      suggestion: 'Try: -0.30 for 30% loss, or 0.08 for 8% annual return',
      severity: 'error',
      category: 'validation',
    });
  }

  throw new Error('Invalid return rate error parameters');
}

/**
 * Create allocation weight validation errors.
 */
export function createAllocationError(
  field: string,
  value: number
): DynamicGlidepathValidationError {
  if (typeof value !== 'number') {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION_TYPE,
      field,
      value,
      constraint: 'Must be a number',
      suggestion: 'Try: 0.70 for 70% allocation',
      severity: 'error',
      category: 'validation',
    });
  }

  if (value < 0 || value > 1) {
    const suggestion =
      value > 1
        ? `Did you mean ${(value / 100).toFixed(2)}? (${value}% as decimal)`
        : 'Try: 0.70 for 70% allocation';

    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_ALLOCATION,
      field,
      value,
      constraint: 'Must be between 0.0 and 1.0 inclusive',
      suggestion,
      severity: 'error',
      category: 'validation',
    });
  }

  throw new Error('Invalid allocation error parameters');
}

/**
 * Create configuration structure errors.
 */
export function createConfigurationError(
  field: string,
  value: unknown,
  expectedValues?: string[]
): DynamicGlidepathConfigurationError {
  if (
    field === 'mode' &&
    expectedValues !== undefined &&
    expectedValues.length > 0
  ) {
    return new DynamicGlidepathConfigurationError({
      code: GLIDEPATH_ERROR_CODES.UNKNOWN_GLIDEPATH_MODE,
      field,
      value,
      constraint: `Must be one of: ${expectedValues.join(', ')}`,
      suggestion: 'Try: mode: "fixed-return" for simple linear return changes',
      severity: 'error',
      category: 'configuration',
    });
  }

  if (field === 'glidepathConfig') {
    return new DynamicGlidepathConfigurationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_CONFIG_STRUCTURE,
      field,
      value,
      constraint: 'Must be a valid configuration object',
      suggestion:
        'Try: { mode: "fixed-return", startReturn: 0.08, endReturn: 0.06 }',
      severity: 'error',
      category: 'configuration',
    });
  }

  throw new Error('Invalid configuration error parameters');
}

/**
 * Create waypoint-specific validation errors.
 */
export function createWaypointError(
  field: string,
  value: unknown,
  index?: number
): DynamicGlidepathValidationError {
  const fieldName = typeof index === 'number' ? `${field}[${index}]` : field;

  if (field === 'waypoints' && Array.isArray(value) && value.length === 0) {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.EMPTY_WAYPOINTS,
      field: fieldName,
      value,
      constraint: 'Must contain at least one waypoint',
      suggestion: 'Try: [{ age: 30, value: 0.80 }, { age: 65, value: 0.30 }]',
      severity: 'error',
      category: 'validation',
    });
  }

  if (field.includes('age')) {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_WAYPOINT_AGE,
      field: fieldName,
      value,
      constraint: 'Must be a positive number',
      suggestion: 'Try: age: 35 for waypoint at age 35',
      severity: 'error',
      category: 'validation',
    });
  }

  if (field.includes('value')) {
    return new DynamicGlidepathValidationError({
      code: GLIDEPATH_ERROR_CODES.INVALID_WAYPOINT_VALUE,
      field: fieldName,
      value,
      constraint: 'Must be a number',
      suggestion: 'Try: 0.08 for 8% return or 0.70 for 70% equity allocation',
      severity: 'error',
      category: 'validation',
    });
  }

  throw new Error('Invalid waypoint error parameters');
}

/**
 * Create warning errors for performance and usability issues.
 */
export function createWarning(
  code: GlidepathErrorCode,
  field: string,
  value: unknown,
  context?: Record<string, unknown>
): DynamicGlidepathValidationError {
  const warningTemplates: Record<
    string,
    { constraint: string; suggestion: string }
  > = {
    [GLIDEPATH_ERROR_CODES.LONG_SIMULATION_WARNING]: {
      constraint: 'Very long simulation may impact performance',
      suggestion: 'Consider breaking into shorter periods for analysis',
    },
    [GLIDEPATH_ERROR_CODES.LARGE_CONTRIBUTION_WARNING]: {
      constraint: 'Very large monthly contribution detected',
      suggestion: 'Verify this amount is correct (typical range: $100-$5,000)',
    },
    [GLIDEPATH_ERROR_CODES.UNUSUAL_ALLOCATION_PROGRESSION]: {
      constraint: 'Equity allocation increases with age (unusual pattern)',
      suggestion:
        'Consider decreasing equity allocation over time for typical retirement planning',
    },
    [GLIDEPATH_ERROR_CODES.EXTREME_RETURN_WARNING]: {
      constraint: 'Very high return rate detected',
      suggestion:
        'Typical returns range from 4% to 15% annually (0.04 to 0.15)',
    },
    [GLIDEPATH_ERROR_CODES.EXTREME_LOSS_WARNING]: {
      constraint: 'Very large loss rate detected',
      suggestion:
        'Consider more moderate loss scenarios for realistic planning',
    },
  };

  const template = warningTemplates[code];
  if (template === undefined) {
    throw new Error(`No template found for warning code: ${code}`);
  }

  return new DynamicGlidepathValidationError({
    code,
    field,
    value,
    constraint: template.constraint,
    suggestion: template.suggestion,
    severity: 'warning',
    category: 'usability',
    context,
  });
}

/**
 * Create runtime calculation errors.
 */
export function createCalculationError(
  message: string,
  context?: Record<string, unknown>
): DynamicGlidepathCalculationError {
  return new DynamicGlidepathCalculationError({
    code: GLIDEPATH_ERROR_CODES.CALCULATION_ERROR,
    field: 'calculation',
    value: undefined,
    constraint: 'Calculation failed during execution',
    suggestion: 'Please check your input parameters and try again',
    severity: 'error',
    category: 'calculation',
    context: { originalMessage: message, ...context },
  });
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard to check if an error is a DynamicGlidepathError.
 */
export function isDynamicGlidepathError(
  error: unknown
): error is DynamicGlidepathError {
  return error instanceof DynamicGlidepathError;
}

/**
 * Type guard to check if an error is a validation error.
 */
export function isValidationError(
  error: unknown
): error is DynamicGlidepathValidationError {
  return (
    error instanceof DynamicGlidepathValidationError &&
    error.category === 'validation'
  );
}

/**
 * Type guard to check if an error is a configuration error.
 */
export function isConfigurationError(
  error: unknown
): error is DynamicGlidepathConfigurationError {
  return (
    error instanceof DynamicGlidepathConfigurationError &&
    error.category === 'configuration'
  );
}

/**
 * Type guard to check if an error is a calculation error.
 */
export function isCalculationError(
  error: unknown
): error is DynamicGlidepathCalculationError {
  return (
    error instanceof DynamicGlidepathCalculationError &&
    error.category === 'calculation'
  );
}

/**
 * Type guard to check if an error is a warning (non-blocking).
 */
export function isWarning(error: DynamicGlidepathError): boolean {
  return error.severity === 'warning';
}

/**
 * Type guard to check if an error is blocking (prevents calculation).
 */
export function isBlockingError(error: DynamicGlidepathError): boolean {
  return error.severity === 'error';
}

// ============================================================================
// ERROR AGGREGATION AND FORMATTING
// ============================================================================

/**
 * Group errors by category for organized display.
 */
export function groupByCategory(
  errors: DynamicGlidepathError[]
): Record<ErrorCategory, DynamicGlidepathError[]> {
  const groups: Record<ErrorCategory, DynamicGlidepathError[]> = {
    validation: [],
    configuration: [],
    calculation: [],
    performance: [],
    usability: [],
  };

  errors.forEach((error) => {
    groups[error.category].push(error);
  });

  return groups;
}

/**
 * Group errors by severity for prioritized handling.
 */
export function groupBySeverity(errors: DynamicGlidepathError[]): {
  errors: DynamicGlidepathError[];
  warnings: DynamicGlidepathError[];
} {
  return {
    errors: errors.filter((e) => e.severity === 'error'),
    warnings: errors.filter((e) => e.severity === 'warning'),
  };
}

/**
 * Get summary statistics for error collection.
 */
export function getSummary(errors: DynamicGlidepathError[]): {
  total: number;
  errorCount: number;
  warningCount: number;
  categories: Record<ErrorCategory, number>;
  topCodes: Array<{ code: GlidepathErrorCode; count: number }>;
} {
  const severity = groupBySeverity(errors);
  const categories = groupByCategory(errors);

  // Count by error code
  const codeCounts = new Map<GlidepathErrorCode, number>();
  errors.forEach((error) => {
    codeCounts.set(error.code, (codeCounts.get(error.code) ?? 0) + 1);
  });

  const topCodes = Array.from(codeCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: errors.length,
    errorCount: severity.errors.length,
    warningCount: severity.warnings.length,
    categories: {
      validation: categories.validation.length,
      configuration: categories.configuration.length,
      calculation: categories.calculation.length,
      performance: categories.performance.length,
      usability: categories.usability.length,
    },
    topCodes,
  };
}

/**
 * Format errors for console display.
 */
export function formatForConsole(
  errors: DynamicGlidepathError[],
  options: {
    showSuggestions?: boolean;
    showErrorCodes?: boolean;
    groupByCategory?: boolean;
  } = {}
): string {
  const {
    showSuggestions = true,
    showErrorCodes = false,
    groupByCategory: shouldGroupByCategory = false,
  } = options;

  if (errors.length === 0) {
    return '✅ No errors found';
  }

  let output = '';

  if (shouldGroupByCategory) {
    const groups = groupByCategory(errors);
    Object.entries(groups).forEach(([category, categoryErrors]) => {
      if (categoryErrors.length > 0) {
        output += `\n📁 ${category.toUpperCase()} ERRORS:\n`;
        categoryErrors.forEach(
          (error: DynamicGlidepathError, index: number) => {
            output += formatSingleError(
              error,
              index + 1,
              showSuggestions,
              showErrorCodes
            );
          }
        );
      }
    });
  } else {
    const severity = groupBySeverity(errors);

    if (severity.errors.length > 0) {
      output += '❌ ERRORS:\n';
      severity.errors.forEach((error, index) => {
        output += formatSingleError(
          error,
          index + 1,
          showSuggestions,
          showErrorCodes
        );
      });
    }

    if (severity.warnings.length > 0) {
      output += '\n⚠️ WARNINGS:\n';
      severity.warnings.forEach((warning, index) => {
        output += formatSingleError(
          warning,
          index + 1,
          showSuggestions,
          showErrorCodes
        );
      });
    }
  }

  return output.trim();
}

/**
 * Format a single error for console display.
 */
function formatSingleError(
  error: DynamicGlidepathError,
  index: number,
  showSuggestions: boolean,
  showErrorCodes: boolean
): string {
  let output = `  ${index}. ${error.message}\n`;

  if (showSuggestions && error.suggestion !== '') {
    output += `     💡 ${error.suggestion}\n`;
  }

  if (showErrorCodes) {
    output += `     📋 Code: ${error.code}\n`;
    output += `     🏷️ Field: ${error.field}\n`;
  }

  return output + '\n';
}

/**
 * Convert errors to API-friendly format.
 */
export function formatForAPI(errors: DynamicGlidepathError[]): {
  errors: Array<{
    code: GlidepathErrorCode;
    field: string;
    message: string;
    suggestion: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
  }>;
  summary: ReturnType<typeof getSummary>;
} {
  return {
    errors: errors.map((error) => ({
      code: error.code,
      field: error.field,
      message: error.message,
      suggestion: error.suggestion,
      severity: error.severity,
      category: error.category,
    })),
    summary: getSummary(errors),
  };
}

// ============================================================================
// VALIDATION RESULT BUILDER
// ============================================================================

/**
 * Builder class for constructing validation results.
 */
export class ValidationResultBuilder {
  private errors: DynamicGlidepathValidationError[] = [];
  private warnings: DynamicGlidepathValidationError[] = [];

  /**
   * Add an error to the validation result.
   */
  addError(error: DynamicGlidepathValidationError): this {
    this.errors.push(error);
    return this;
  }

  /**
   * Add a warning to the validation result.
   */
  addWarning(warning: DynamicGlidepathValidationError): this {
    this.warnings.push(warning);
    return this;
  }

  /**
   * Add multiple errors.
   */
  addErrors(errors: DynamicGlidepathValidationError[]): this {
    this.errors.push(...errors);
    return this;
  }

  /**
   * Add multiple warnings.
   */
  addWarnings(warnings: DynamicGlidepathValidationError[]): this {
    this.warnings.push(...warnings);
    return this;
  }

  /**
   * Build the final validation result.
   */
  build(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }

  /**
   * Clear all errors and warnings.
   */
  clear(): this {
    this.errors = [];
    this.warnings = [];
    return this;
  }

  /**
   * Get current error count.
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Get current warning count.
   */
  getWarningCount(): number {
    return this.warnings.length;
  }

  /**
   * Check if there are any blocking errors.
   */
  hasBlockingErrors(): boolean {
    return this.errors.some((error) => isBlockingError(error));
  }
}
