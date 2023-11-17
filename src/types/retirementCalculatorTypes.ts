export interface ContributionFrequencyType {
  YEARLY: number;
  MONTHLY: number;
  WEEKLY: number;
}

export interface DetermineContributionType {
  contributionNeededPerPeriod: number;
  contributionNeededPerPeriodWithInflation: number;
  desiredBalance: number;
  desiredBalanceWithInflation: number;
  desiredBalanceValueAfterInflation: number;
}
