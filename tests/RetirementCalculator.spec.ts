import RetirementCalculator from '../src/RetirementCalculator';
import type { DetermineContributionType } from '../src/types/retirementCalculatorTypes';

describe('RetirementCalculator', (): void => {
  let calculator: RetirementCalculator;

  beforeEach((): void => {
    calculator = new RetirementCalculator();
  });

  describe('formatNumberWithCommas', (): void => {
    it('should correctly format numbers', (): void => {
      expect(calculator.formatNumberWithCommas(1234567.89)).toBe(
        '1,234,567.89'
      );
      expect(calculator.formatNumberWithCommas(1000)).toBe('1,000.00');
    });
  });

  describe('adjustDesiredBalanceDueToInflation', (): void => {
    it('should adjust the desired balance for inflation', (): void => {
      expect(
        calculator.adjustDesiredBalanceDueToInflation(100000, 10, 0.03)
      ).toBeCloseTo(134391.63, 1);
    });
  });

  describe('getDesiredBalanceByYearlySpend', (): void => {
    it('should calculate how much needs to be in retirement to spend a certain amount.', (): void => {
      expect(calculator.getDesiredBalanceByYearlySpend(40000)).toBe(1000000);
    });
    it('should calculate how much needs to be in retirement to spend a certain amount with custom withdraw Rate', (): void => {
      expect(calculator.getDesiredBalanceByYearlySpend(40000, 0.05)).toBe(
        800000
      );
    });
  });

  describe('getYearlyWithdrawalAmountByBalance', (): void => {
    it('should calculate how much could be spent in retirement.', (): void => {
      expect(calculator.getYearlyWithdrawalAmountByBalance(1000000, 0.04)).toBe(
        40000
      );
    });
  });

  describe('getContributionNeededForDesiredBalance', (): void => {
    const startingBalance: number = 100000;
    const desiredBalance: number = 200000;
    const years: number = 10;
    const interestRate: number = 0.05; // 5%
    it('should calculate how much needs to be contributed to hit a goal', (): void => {
      const contributionFrequency: number = 12; // Monthly
      const compoundingFrequency: number = 12; // Monthly

      const result: DetermineContributionType =
        calculator.getContributionNeededForDesiredBalance(
          startingBalance,
          desiredBalance,
          years,
          interestRate,
          contributionFrequency,
          compoundingFrequency
        );

      expect(result.contributionNeededPerPeriod).toBeGreaterThan(0);
      expect(result.desiredBalanceWithInflation).toBeGreaterThan(
        desiredBalance
      );
      expect(result.desiredBalanceValueAfterInflation).toBeLessThan(
        desiredBalance
      );
    });

    it(
      'should calculate how much needs to be contributed to hit a goal when contribution frequency is' +
        'higher than compounding frequency and custom inflation Rate',
      (): void => {
        const contributionFrequency: number = 52; // Monthly
        const compoundingFrequency: number = 12; // Monthly
        const inflationRate: number = 0.03; // 2%

        const result: DetermineContributionType =
          calculator.getContributionNeededForDesiredBalance(
            startingBalance,
            desiredBalance,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency,
            inflationRate
          );

        expect(result.contributionNeededPerPeriod).toBeGreaterThan(0);
        expect(result.desiredBalanceWithInflation).toBeGreaterThan(
          desiredBalance
        );
        expect(result.desiredBalanceValueAfterInflation).toBeLessThan(
          desiredBalance
        );
      }
    );

    it(
      'should calculate how much needs to be contributed to hit a goal when contribution frequency is' +
        'lower than compounding frequency',
      (): void => {
        const contributionFrequency: number = 12; // Monthly
        const compoundingFrequency: number = 52; // Monthly

        const result: DetermineContributionType =
          calculator.getContributionNeededForDesiredBalance(
            startingBalance,
            desiredBalance,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        expect(result.contributionNeededPerPeriod).toBeGreaterThan(0);
        expect(result.desiredBalanceWithInflation).toBeGreaterThan(
          desiredBalance
        );
        expect(result.desiredBalanceValueAfterInflation).toBeLessThan(
          desiredBalance
        );
      }
    );

    it('should not break when forcing a negative balance', (): void => {
      const startingBalance: number = -100000;
      const desiredBalance: number = -200000;

      const contributionFrequency: number = 12; // Monthly
      const compoundingFrequency: number = 12; // Monthly

      const result: DetermineContributionType =
        calculator.getContributionNeededForDesiredBalance(
          startingBalance,
          desiredBalance,
          years,
          interestRate,
          contributionFrequency,
          compoundingFrequency
        );

      expect(result.contributionNeededPerPeriod).toBe(0);
      expect(result.desiredBalanceWithInflation).toBe(-243798.88399895147);
      expect(result.desiredBalanceValueAfterInflation).toBe(
        -164069.65997503104
      );
    });
  });

  describe('getCompoundInterestWithAdditionalContributions', (): void => {
    const initialBalance: number = 10000;
    const additionalContributionAmount: number = 100;
    const years: number = 10;
    const interestRate: number = 0.05; // 5%
    it(
      'should correctly calculate compound interest with additional contributions with compound and ' +
        'contribution frequencies matching',
      (): void => {
        const contributionFrequency: number = 12; // Monthly
        const compoundingFrequency: number = 12; // Monthly

        const result: number =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        const expectedValue: number = 32063.02;
        expect(result).toBeCloseTo(expectedValue, 2);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with compound and ' +
        'contribution frequencies not matching',
      (): void => {
        const contributionFrequency: number = 52; // Monthly
        const compoundingFrequency: number = 12; // Monthly

        const result: number =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        const expectedValue: number = 17183.796274401608;
        expect(result).toBe(expectedValue);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with compound frequency ' +
        'higher than contribution frequency',
      (): void => {
        const contributionFrequency: number = 12; // Monthly
        const compoundingFrequency: number = 52; // Monthly

        const result: number =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        const expectedValue: number = 33331.60086455464;
        expect(result).toBe(expectedValue);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with contribution frequency ' +
        'equaling 1',
      (): void => {
        const contributionFrequency: number = 1; // Monthly
        const compoundingFrequency: number = 1; // Monthly

        const result: number =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        const expectedValue: number = 17609.624984007045;
        expect(result).toBe(expectedValue);
      }
    );
  });
});
