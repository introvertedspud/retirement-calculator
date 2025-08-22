import RetirementCalculator from '../src/RetirementCalculator';
import type {
  DetermineContributionType,
  CompoundingInterestObjectType,
} from '../src/types/retirementCalculatorTypes';

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

    it('should handle zero interest rate correctly', (): void => {
      const startingBalance: number = 10000;
      const desiredBalance: number = 20000;
      const years: number = 10;
      const interestRate: number = 0; // Zero interest rate
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
      // With zero interest, we need to contribute the difference divided by periods
      expect(result.contributionNeededPerPeriod).toBeCloseTo(
        (desiredBalance - startingBalance) / (years * contributionFrequency),
        2
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

        const result: CompoundingInterestObjectType =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        expect(result.balance).toBe(32063.023871238656);
        expect(result.compoundingFrequency).toBe(12);
        expect(result.contributionFrequency).toBe(12);
        expect(result.totalContributions).toBe(12000);
        expect(result.totalInterestEarned).toBe(10063.023871238653);
        expect(result.years).toBe(10);
        expect(result.compoundingPeriodDetails.length).toBe(120);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with compound and ' +
        'contribution frequencies not matching',
      (): void => {
        const contributionFrequency: number = 52; // Monthly
        const compoundingFrequency: number = 12; // Monthly

        const result: CompoundingInterestObjectType =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        expect(result.balance).toBe(17183.796274401622);
        expect(result.compoundingFrequency).toBe(12);
        expect(result.contributionFrequency).toBe(52);
        expect(result.totalContributions).toBe(553.8461538461539);
        expect(result.totalInterestEarned).toBe(6629.950120555457);
        expect(result.years).toBe(10);
        expect(result.compoundingPeriodDetails.length).toBe(120);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with compound frequency ' +
        'higher than contribution frequency',
      (): void => {
        const contributionFrequency: number = 12; // Monthly
        const compoundingFrequency: number = 52; // Monthly

        const result: CompoundingInterestObjectType =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        expect(result.balance).toBe(33331.600864554675);
        expect(result.compoundingFrequency).toBe(52);
        expect(result.contributionFrequency).toBe(12);
        expect(result.totalContributions).toBe(13000);
        expect(result.totalInterestEarned).toBe(10331.600864554699);
        expect(result.years).toBe(10);
        expect(result.compoundingPeriodDetails.length).toBe(520);
      }
    );

    it(
      'should correctly calculate compound interest with additional contributions with contribution frequency ' +
        'equaling 1',
      (): void => {
        const contributionFrequency: number = 1; // Monthly
        const compoundingFrequency: number = 1; // Monthly

        const result: CompoundingInterestObjectType =
          calculator.getCompoundInterestWithAdditionalContributions(
            initialBalance,
            additionalContributionAmount,
            years,
            interestRate,
            contributionFrequency,
            compoundingFrequency
          );

        expect(result.balance).toBe(17609.62498400704);
        expect(result.compoundingFrequency).toBe(1);
        expect(result.contributionFrequency).toBe(1);
        expect(result.totalContributions).toBe(1000);
        expect(result.totalInterestEarned).toBe(6609.624984007041);
        expect(result.years).toBe(10);
        expect(result.compoundingPeriodDetails).toStrictEqual([
          {
            balance: 10605,
            balanceFromContributions: 100,
            balanceFromInterest: 10505,
            contributionTotal: 100,
            interestEarnedThisPeriod: 505,
            interestTotal: 505,
            period: 1,
          },
          {
            balance: 11240.25,
            balanceFromContributions: 200,
            balanceFromInterest: 11040.25,
            contributionTotal: 200,
            interestEarnedThisPeriod: 535.25,
            interestTotal: 1040.25,
            period: 2,
          },
          {
            balance: 11907.2625,
            balanceFromContributions: 300,
            balanceFromInterest: 11607.2625,
            contributionTotal: 300,
            interestEarnedThisPeriod: 567.0125,
            interestTotal: 1607.2625,
            period: 3,
          },
          {
            balance: 12607.625625,
            balanceFromContributions: 400,
            balanceFromInterest: 12207.625625,
            contributionTotal: 400,
            interestEarnedThisPeriod: 600.3631250000001,
            interestTotal: 2207.625625,
            period: 4,
          },
          {
            balance: 13343.00690625,
            balanceFromContributions: 500,
            balanceFromInterest: 12843.00690625,
            contributionTotal: 500,
            interestEarnedThisPeriod: 635.38128125,
            interestTotal: 2843.00690625,
            period: 5,
          },
          {
            balance: 14115.157251562501,
            balanceFromContributions: 600,
            balanceFromInterest: 13515.157251562501,
            contributionTotal: 600,
            interestEarnedThisPeriod: 672.1503453125001,
            interestTotal: 3515.1572515625003,
            period: 6,
          },
          {
            balance: 14925.915114140626,
            balanceFromContributions: 700,
            balanceFromInterest: 14225.915114140626,
            contributionTotal: 700,
            interestEarnedThisPeriod: 710.7578625781251,
            interestTotal: 4225.9151141406255,
            period: 7,
          },
          {
            balance: 15777.210869847657,
            balanceFromContributions: 800,
            balanceFromInterest: 14977.210869847657,
            contributionTotal: 800,
            interestEarnedThisPeriod: 751.2957557070313,
            interestTotal: 4977.210869847657,
            period: 8,
          },
          {
            balance: 16671.07141334004,
            balanceFromContributions: 900,
            balanceFromInterest: 15771.07141334004,
            contributionTotal: 900,
            interestEarnedThisPeriod: 793.8605434923829,
            interestTotal: 5771.07141334004,
            period: 9,
          },
          {
            balance: 17609.62498400704,
            balanceFromContributions: 1000,
            balanceFromInterest: 16609.62498400704,
            contributionTotal: 1000,
            interestEarnedThisPeriod: 838.5535706670021,
            interestTotal: 6609.624984007041,
            period: 10,
          },
        ]);
      }
    );
  });

  describe('aggregateDataByYear', (): void => {
    it('should aggregate the compounding details', (): void => {
      const result = calculator.aggregateDataByYear({
        balance: 17609.62498400704,
        compoundingFrequency: 1,
        compoundingPeriodDetails: [
          {
            balance: 10605,
            balanceFromContributions: 100,
            balanceFromInterest: 10505,
            contributionTotal: 100,
            interestEarnedThisPeriod: 505,
            interestTotal: 505,
            period: 1,
          },
          {
            balance: 11240.25,
            balanceFromContributions: 200,
            balanceFromInterest: 11040.25,
            contributionTotal: 200,
            interestEarnedThisPeriod: 535.25,
            interestTotal: 1040.25,
            period: 2,
          },
          {
            balance: 11907.2625,
            balanceFromContributions: 300,
            balanceFromInterest: 11607.2625,
            contributionTotal: 300,
            interestEarnedThisPeriod: 567.0125,
            interestTotal: 1607.2625,
            period: 3,
          },
          {
            balance: 12607.625625,
            balanceFromContributions: 400,
            balanceFromInterest: 12207.625625,
            contributionTotal: 400,
            interestEarnedThisPeriod: 600.3631250000001,
            interestTotal: 2207.625625,
            period: 4,
          },
          {
            balance: 13343.00690625,
            balanceFromContributions: 500,
            balanceFromInterest: 12843.00690625,
            contributionTotal: 500,
            interestEarnedThisPeriod: 635.38128125,
            interestTotal: 2843.00690625,
            period: 5,
          },
          {
            balance: 14115.157251562501,
            balanceFromContributions: 600,
            balanceFromInterest: 13515.157251562501,
            contributionTotal: 600,
            interestEarnedThisPeriod: 672.1503453125001,
            interestTotal: 3515.1572515625003,
            period: 6,
          },
          {
            balance: 14925.915114140626,
            balanceFromContributions: 700,
            balanceFromInterest: 14225.915114140626,
            contributionTotal: 700,
            interestEarnedThisPeriod: 710.7578625781251,
            interestTotal: 4225.9151141406255,
            period: 7,
          },
          {
            balance: 15777.210869847657,
            balanceFromContributions: 800,
            balanceFromInterest: 14977.210869847657,
            contributionTotal: 800,
            interestEarnedThisPeriod: 751.2957557070313,
            interestTotal: 4977.210869847657,
            period: 8,
          },
          {
            balance: 16671.07141334004,
            balanceFromContributions: 900,
            balanceFromInterest: 15771.07141334004,
            contributionTotal: 900,
            interestEarnedThisPeriod: 793.8605434923829,
            interestTotal: 5771.07141334004,
            period: 9,
          },
          {
            balance: 17609.62498400704,
            balanceFromContributions: 1000,
            balanceFromInterest: 16609.62498400704,
            contributionTotal: 1000,
            interestEarnedThisPeriod: 838.5535706670021,
            interestTotal: 6609.624984007041,
            period: 10,
          },
        ],
        contributionFrequency: 1,
        totalContributions: 1000,
        totalInterestEarned: 6609.624984007041,
        years: 10,
      });

      expect(result).toStrictEqual([
        {
          cumulativeContributions: 100,
          cumulativeInterest: 505,
          endOfYearBalance: 10605,
          year: 1,
        },
        {
          cumulativeContributions: 200,
          cumulativeInterest: 1040.25,
          endOfYearBalance: 11240.25,
          year: 2,
        },
        {
          cumulativeContributions: 300,
          cumulativeInterest: 1607.2625,
          endOfYearBalance: 11907.2625,
          year: 3,
        },
        {
          cumulativeContributions: 400,
          cumulativeInterest: 2207.625625,
          endOfYearBalance: 12607.625625,
          year: 4,
        },
        {
          cumulativeContributions: 500,
          cumulativeInterest: 2843.00690625,
          endOfYearBalance: 13343.00690625,
          year: 5,
        },
        {
          cumulativeContributions: 600,
          cumulativeInterest: 3515.1572515625003,
          endOfYearBalance: 14115.157251562501,
          year: 6,
        },
        {
          cumulativeContributions: 700,
          cumulativeInterest: 4225.9151141406255,
          endOfYearBalance: 14925.915114140626,
          year: 7,
        },
        {
          cumulativeContributions: 800,
          cumulativeInterest: 4977.210869847657,
          endOfYearBalance: 15777.210869847657,
          year: 8,
        },
        {
          cumulativeContributions: 900,
          cumulativeInterest: 5771.07141334004,
          endOfYearBalance: 16671.07141334004,
          year: 9,
        },
        {
          cumulativeContributions: 1000,
          cumulativeInterest: 6609.624984007041,
          endOfYearBalance: 17609.62498400704,
          year: 10,
        },
      ]);
    });

    it('should aggregate the compounding details 2', (): void => {
      const result = calculator.aggregateDataByYear({
        balance: 148.70640246399884,
        totalContributions: 24,
        totalInterestEarned: 24.706402463998792,
        years: 2,
        contributionFrequency: 12,
        compoundingFrequency: 12,
        compoundingPeriodDetails: [
          {
            period: 1,
            balance: 101.84166666666667,
            contributionTotal: 1,
            interestTotal: 0.8416666666666667,
            interestEarnedThisPeriod: 0.8416666666666667,
            balanceFromContributions: 1,
            balanceFromInterest: 100.84166666666667,
          },
          {
            period: 2,
            balance: 103.69868055555555,
            contributionTotal: 2,
            interestTotal: 1.6986805555555555,
            interestEarnedThisPeriod: 0.8570138888888889,
            balanceFromContributions: 2,
            balanceFromInterest: 101.69868055555555,
          },
          {
            period: 3,
            balance: 105.57116956018518,
            contributionTotal: 3,
            interestTotal: 2.571169560185185,
            interestEarnedThisPeriod: 0.8724890046296296,
            balanceFromContributions: 3,
            balanceFromInterest: 102.57116956018518,
          },
          {
            period: 4,
            balance: 107.45926263985339,
            contributionTotal: 4,
            interestTotal: 3.459262639853395,
            interestEarnedThisPeriod: 0.8880930796682098,
            balanceFromContributions: 4,
            balanceFromInterest: 103.45926263985339,
          },
          {
            period: 5,
            balance: 109.36308982851884,
            contributionTotal: 5,
            interestTotal: 4.36308982851884,
            interestEarnedThisPeriod: 0.9038271886654449,
            balanceFromContributions: 5,
            balanceFromInterest: 104.36308982851884,
          },
          {
            period: 6,
            balance: 111.2827822437565,
            contributionTotal: 6,
            interestTotal: 5.282782243756497,
            interestEarnedThisPeriod: 0.919692415237657,
            balanceFromContributions: 6,
            balanceFromInterest: 105.2827822437565,
          },
          {
            period: 7,
            balance: 113.2184720957878,
            contributionTotal: 7,
            interestTotal: 6.218472095787801,
            interestEarnedThisPeriod: 0.9356898520313042,
            balanceFromContributions: 7,
            balanceFromInterest: 106.2184720957878,
          },
          {
            period: 8,
            balance: 115.17029269658603,
            contributionTotal: 8,
            interestTotal: 7.170292696586033,
            interestEarnedThisPeriod: 0.9518206007982317,
            balanceFromContributions: 8,
            balanceFromInterest: 107.17029269658603,
          },
          {
            period: 9,
            balance: 117.13837846905759,
            contributionTotal: 9,
            interestTotal: 8.138378469057583,
            interestEarnedThisPeriod: 0.9680857724715503,
            balanceFromContributions: 9,
            balanceFromInterest: 108.13837846905759,
          },
          {
            period: 10,
            balance: 119.12286495629974,
            contributionTotal: 10,
            interestTotal: 9.122864956299729,
            interestEarnedThisPeriod: 0.9844864872421465,
            balanceFromContributions: 10,
            balanceFromInterest: 109.12286495629974,
          },
          {
            period: 11,
            balance: 121.12388883093557,
            contributionTotal: 11,
            interestTotal: 10.12388883093556,
            interestEarnedThisPeriod: 1.001023874635831,
            balanceFromContributions: 11,
            balanceFromInterest: 110.12388883093557,
          },
          {
            period: 12,
            balance: 123.1415879045267,
            contributionTotal: 12,
            interestTotal: 11.14158790452669,
            interestEarnedThisPeriod: 1.0176990735911298,
            balanceFromContributions: 12,
            balanceFromInterest: 111.1415879045267,
          },
          {
            period: 13,
            balance: 125.17610113706442,
            contributionTotal: 13,
            interestTotal: 12.176101137064412,
            interestEarnedThisPeriod: 1.0345132325377224,
            balanceFromContributions: 13,
            balanceFromInterest: 112.17610113706442,
          },
          {
            period: 14,
            balance: 127.22756864653996,
            contributionTotal: 14,
            interestTotal: 13.227568646539948,
            interestEarnedThisPeriod: 1.0514675094755368,
            balanceFromContributions: 14,
            balanceFromInterest: 113.22756864653996,
          },
          {
            period: 15,
            balance: 129.29613171859447,
            contributionTotal: 15,
            interestTotal: 14.296131718594449,
            interestEarnedThisPeriod: 1.0685630720544996,
            balanceFromContributions: 15,
            balanceFromInterest: 114.29613171859447,
          },
          {
            period: 16,
            balance: 131.38193281624942,
            contributionTotal: 16,
            interestTotal: 15.381932816249403,
            interestEarnedThisPeriod: 1.085801097654954,
            balanceFromContributions: 16,
            balanceFromInterest: 115.38193281624942,
          },
          {
            period: 17,
            balance: 133.48511558971816,
            contributionTotal: 17,
            interestTotal: 16.48511558971815,
            interestEarnedThisPeriod: 1.1031827734687452,
            balanceFromContributions: 17,
            balanceFromInterest: 116.48511558971816,
          },
          {
            period: 18,
            balance: 135.60582488629916,
            contributionTotal: 18,
            interestTotal: 17.605824886299132,
            interestEarnedThisPeriod: 1.1207092965809846,
            balanceFromContributions: 18,
            balanceFromInterest: 117.60582488629916,
          },
          {
            period: 19,
            balance: 137.74420676035166,
            contributionTotal: 19,
            interestTotal: 18.744206760351624,
            interestEarnedThisPeriod: 1.138381874052493,
            balanceFromContributions: 19,
            balanceFromInterest: 118.74420676035166,
          },
          {
            period: 20,
            balance: 139.9004084833546,
            contributionTotal: 20,
            interestTotal: 19.900408483354553,
            interestEarnedThisPeriod: 1.1562017230029304,
            balanceFromContributions: 20,
            balanceFromInterest: 119.9004084833546,
          },
          {
            period: 21,
            balance: 142.07457855404922,
            contributionTotal: 21,
            interestTotal: 21.074578554049175,
            interestEarnedThisPeriod: 1.1741700706946216,
            balanceFromContributions: 21,
            balanceFromInterest: 121.07457855404922,
          },
          {
            period: 22,
            balance: 144.2668667086663,
            contributionTotal: 22,
            interestTotal: 22.266866708666253,
            interestEarnedThisPeriod: 1.192288154617077,
            balanceFromContributions: 22,
            balanceFromInterest: 122.2668667086663,
          },
          {
            period: 23,
            balance: 146.47742393123852,
            contributionTotal: 23,
            interestTotal: 23.477423931238473,
            interestEarnedThisPeriod: 1.2105572225722192,
            balanceFromContributions: 23,
            balanceFromInterest: 123.47742393123852,
          },
          {
            period: 24,
            balance: 148.70640246399884,
            contributionTotal: 24,
            interestTotal: 24.706402463998792,
            interestEarnedThisPeriod: 1.2289785327603209,
            balanceFromContributions: 24,
            balanceFromInterest: 124.70640246399884,
          },
        ],
      });

      expect(result).toStrictEqual([
        {
          cumulativeContributions: 12,
          cumulativeInterest: 11.14158790452669,
          endOfYearBalance: 123.1415879045267,
          year: 1,
        },
        {
          cumulativeContributions: 24,
          cumulativeInterest: 24.706402463998792,
          endOfYearBalance: 148.70640246399884,
          year: 2,
        },
      ]);
    });
  });
});
