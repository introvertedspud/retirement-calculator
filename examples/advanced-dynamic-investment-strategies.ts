/**
 * @fileoverview Advanced Dynamic Investment Strategies Example
 * 
 * WHEN TO USE THIS:
 * - You want to model changing investment strategies over time (like target-date funds)
 * - You're comparing different glidepath approaches for retirement planning
 * - You want to understand how investment allocation changes as you age
 * - You need sophisticated modeling beyond simple fixed returns
 * 
 * PERFECT FOR:
 * - Advanced investors who want to optimize returns over time
 * - People using target-date funds who want to understand the underlying strategy
 * - Financial planners modeling complex allocation strategies
 * - Anyone interested in age-based investment approaches
 * 
 * KEY LEARNING OUTCOMES:
 * - How dynamic investment strategies can optimize returns over decades
 * - Popular strategies like "100 minus age" equity allocation
 * - The difference between simple and sophisticated retirement planning
 * - How front-loaded returns compound more than back-loaded returns
 * - Why Monte Carlo analysis is needed for real investment decisions
 * 
 * IMPORTANT NOTE:
 * These examples compare different strategies for educational purposes only.
 * They assume steady returns in idealized conditions. For actual investment
 * decisions, use Monte Carlo analysis (coming soon) to account for market
 * volatility and find the strategy that matches your risk tolerance.
 */

import RetirementCalculator from '../src/RetirementCalculator';
import type {
  FixedReturnGlidepathConfig,
  AllocationBasedGlidepathConfig,
  CustomWaypointsGlidepathConfig,
} from '../src/types/retirementCalculatorTypes';
import { GLIDEPATH_PRESETS } from '../src/constants/retirementCalculatorConstants';

const calculator = new RetirementCalculator();

console.log('🚀 ADVANCED DYNAMIC INVESTMENT STRATEGIES');
console.log('=' .repeat(70));
console.log('🎯 MASTER-LEVEL RETIREMENT PLANNING:');
console.log('   Learn how sophisticated investors optimize returns over time');
console.log('   Compare different strategies used by target-date funds');
console.log('   See why "set it and forget it" isn\'t always optimal');
console.log();

// ============================================================================
// SCENARIO 1: THE YOUNG PROFESSIONAL'S STRATEGY
// ============================================================================

console.log('📈 SCENARIO 1: The Young Professional\'s Strategy');
console.log('-'.repeat(55));
console.log('👤 YOU: 25-year-old professional, just starting your career');
console.log('🎯 GOAL: Retire comfortably at 65 with maximum growth early on');
console.log('📊 STRATEGY: Start aggressive (10% returns), get conservative as you age');
console.log('💡 WHY: Higher returns early compound longer = bigger retirement balance');
console.log();

const fixedReturnConfig: FixedReturnGlidepathConfig = {
  mode: 'fixed-return',
  startReturn: 0.1, // 10% at age 25
  endReturn: 0.055, // 5.5% at age 65
};

try {
  const fixedResult = calculator.getCompoundInterestWithGlidepath(
    25000, // Starting with $25,000
    1000, // Contributing $1,000 monthly
    25, // Starting at age 25
    65, // Retiring at age 65
    fixedReturnConfig
  );

  console.log(`🎉 YOUR RESULTS:`);
  console.log(`   Final retirement balance: $${calculator.formatNumberWithCommas(fixedResult.finalBalance)}`);
  console.log(`   Your total contributions: $${calculator.formatNumberWithCommas(fixedResult.totalContributions)}`);
  console.log(`   FREE money from compound growth: $${calculator.formatNumberWithCommas(fixedResult.totalInterestEarned)}`);
  console.log(`   Account growth rate: ${(fixedResult.effectiveAnnualReturn * 100).toFixed(2)}% (includes contributions)`);
  console.log(`   Investment return rate: ${(fixedResult.averageAnnualInterestRate * 100).toFixed(2)}% (market performance)`);
  console.log(`   Years of financial freedom this buys: ${Math.floor(fixedResult.finalBalance / 50000)} years at $50K/year!`);

  console.log(`\n📊 How Your Strategy Changes Over Time:`);
  [25, 35, 45, 55, 65].forEach((age) => {
    const ageEntry = fixedResult.monthlyTimeline.find(
      (entry) => Math.abs(entry.age - age) < 0.1
    );
    if (ageEntry) {
      const stage = age <= 30 ? '🚀 AGGRESSIVE' : age <= 45 ? '📈 GROWTH' : age <= 55 ? '⚖️  BALANCED' : '🛡️  CONSERVATIVE';
      console.log(
        `   Age ${age}: ${(ageEntry.currentAnnualReturn * 100).toFixed(2)}% return (${stage})`
      );
    }
  });
  
  const dailyCost = (fixedResult.totalContributions / (40 * 365)).toFixed(2);
  console.log(`\n💡 PERSPECTIVE: You invested only $${dailyCost} per day for 40 years`);
  console.log(`   That turned into $${calculator.formatNumberWithCommas(fixedResult.finalBalance)} - that\'s $${(fixedResult.finalBalance / (40 * 365)).toFixed(2)} per day of value!`);
} catch (error) {
  console.error('❌ Fixed return calculation failed:', error);
}

// ============================================================================
// SCENARIO 2: THE TARGET-DATE FUND APPROACH
// ============================================================================

console.log('\n\n🎯 SCENARIO 2: The Target-Date Fund Approach');
console.log('-'.repeat(60));
console.log('👤 YOU: 30-year-old who wants a "set it and forget it" strategy');
console.log('🎯 GOAL: Let professionals manage your allocation as you age');
console.log('📊 STRATEGY: Start 90% stocks/10% bonds → End 30% stocks/70% bonds');
console.log('💡 WHY: Reduces risk as you near retirement (can\'t afford big losses)');
console.log();

const allocationConfig: AllocationBasedGlidepathConfig = {
  mode: 'allocation-based',
  startEquityWeight: 0.9, // 90% equity at age 30
  endEquityWeight: 0.3, // 30% equity at age 65
  equityReturn: 0.12, // 12% equity returns
  bondReturn: 0.04, // 4% bond returns
};

try {
  const allocationResult = calculator.getCompoundInterestWithGlidepath(
    50000, // Starting with $50,000
    1500, // Contributing $1,500 monthly
    30, // Starting at age 30
    65, // Retiring at age 65
    allocationConfig
  );

  console.log(`🎉 YOUR TARGET-DATE RESULTS:`);
  console.log(`   Final retirement balance: $${calculator.formatNumberWithCommas(allocationResult.finalBalance)}`);
  console.log(`   Your total contributions: $${calculator.formatNumberWithCommas(allocationResult.totalContributions)}`);
  console.log(`   FREE money from compound growth: $${calculator.formatNumberWithCommas(allocationResult.totalInterestEarned)}`);
  console.log(`   Account growth rate: ${(allocationResult.effectiveAnnualReturn * 100).toFixed(2)}% (includes contributions)`);
  console.log(`   Investment return rate: ${(allocationResult.averageAnnualInterestRate * 100).toFixed(2)}% (market performance)`);
  
  const monthlyWithdrawal = Math.floor(allocationResult.finalBalance * 0.04 / 12);
  console.log(`   Monthly retirement income (4% rule): $${calculator.formatNumberWithCommas(monthlyWithdrawal)}`);

  console.log(`\n📊 How Your Target-Date Fund Changes Over Time:`);
  [30, 40, 50, 60, 65].forEach((age) => {
    const ageEntry = allocationResult.monthlyTimeline.find(
      (entry) => Math.abs(entry.age - age) < 0.1
    );
    if (ageEntry && ageEntry.currentEquityWeight !== undefined) {
      const equityWeight = ageEntry.currentEquityWeight * 100;
      const equityPercent = equityWeight.toFixed(0);
      const bondPercent = ((1 - ageEntry.currentEquityWeight) * 100).toFixed(0);
      const returnPercent = (ageEntry.currentAnnualReturn * 100).toFixed(2);
      const riskLevel = equityWeight >= 70 ? '🔥 HIGH GROWTH' : equityWeight >= 50 ? '📈 MODERATE' : '🛡️  CONSERVATIVE';
      console.log(
        `   Age ${age}: ${equityPercent}% stocks/${bondPercent}% bonds → ${returnPercent}% return (${riskLevel})`
      );
    }
  });
  
  console.log(`\n💰 This is why target-date funds are popular - professional management`);
  console.log(`   without you having to think about rebalancing!`);
} catch (error) {
  console.error('❌ Allocation-based calculation failed:', error);
}

// ============================================================================
// SCENARIO 3: THE SOPHISTICATED INVESTOR'S CUSTOM STRATEGY
// ============================================================================

console.log('\n\n🎨 SCENARIO 3: The Sophisticated Investor\'s Custom Strategy');
console.log('-'.repeat(65));
console.log('👤 YOU: Savvy investor who wants precise control over your strategy');
console.log('🎯 GOAL: Custom allocation targets that match your specific risk tolerance');
console.log('📊 STRATEGY: You set exact equity percentages at key life stages');
console.log('💡 WHY: Maximum control - you decide exactly when and how to reduce risk');
console.log();

const customConfig: CustomWaypointsGlidepathConfig = {
  mode: 'custom-waypoints',
  valueType: 'equityWeight',
  waypoints: [
    { age: 25, value: 1.0 }, // 100% equity at 25
    { age: 35, value: 0.85 }, // 85% equity at 35
    { age: 45, value: 0.7 }, // 70% equity at 45
    { age: 55, value: 0.5 }, // 50% equity at 55
    { age: 65, value: 0.25 }, // 25% equity at retirement
  ],
  equityReturn: 0.11, // 11% equity returns
  bondReturn: 0.035, // 3.5% bond returns
};

try {
  const customResult = calculator.getCompoundInterestWithGlidepath(
    15000, // Starting with $15,000
    800, // Contributing $800 monthly
    25, // Starting at age 25
    65, // Retiring at age 65
    customConfig
  );

  console.log(`🎉 YOUR CUSTOM STRATEGY RESULTS:`);
  console.log(`   Final retirement balance: $${calculator.formatNumberWithCommas(customResult.finalBalance)}`);
  console.log(`   Your total contributions: $${calculator.formatNumberWithCommas(customResult.totalContributions)}`);
  console.log(`   FREE money from compound growth: $${calculator.formatNumberWithCommas(customResult.totalInterestEarned)}`);
  console.log(`   Account growth rate: ${(customResult.effectiveAnnualReturn * 100).toFixed(2)}% (includes contributions)`);
  console.log(`   Investment return rate: ${(customResult.averageAnnualInterestRate * 100).toFixed(2)}% (market performance)`);
  
  const growthMultiple = (customResult.finalBalance / customResult.totalContributions).toFixed(1);
  console.log(`   Your money grew ${growthMultiple}x - every dollar became $${growthMultiple}!`);

  console.log(`\n📊 Your Precisely-Controlled Strategy:`);
  customConfig.waypoints.forEach((waypoint) => {
    const ageEntry = customResult.monthlyTimeline.find(
      (entry) => Math.abs(entry.age - waypoint.age) < 0.1
    );
    if (ageEntry && ageEntry.currentEquityWeight !== undefined) {
      const equityPercent = (ageEntry.currentEquityWeight * 100).toFixed(0);
      const bondPercent = ((1 - ageEntry.currentEquityWeight) * 100).toFixed(0);
      const returnPercent = (ageEntry.currentAnnualReturn * 100).toFixed(2);
      const lifeStage = waypoint.age <= 30 ? '(Career Building)' : waypoint.age <= 45 ? '(Peak Earning)' : waypoint.age <= 55 ? '(Pre-Retirement)' : '(Near Retirement)';
      console.log(
        `   Age ${waypoint.age}: ${equityPercent}% stocks/${bondPercent}% bonds → ${returnPercent}% return ${lifeStage}`
      );
    }
  });
  
  console.log(`\n💡 This level of control lets you optimize for your specific situation!`);
} catch (error) {
  console.error('❌ Custom waypoints calculation failed:', error);
}

// ============================================================================
// SCENARIO 4: THE MONEY GUY SHOW STRATEGY (POPULAR PRESET)
// ============================================================================

console.log('\n\n💰 SCENARIO 4: The Money Guy Show Strategy (Popular Preset)');
console.log('-'.repeat(65));
console.log('👤 YOU: Fan of The Money Guy Show podcast (or similar financial advice)');
console.log('🎯 GOAL: Use their proven, conservative return assumptions');
console.log('📊 STRATEGY: 10% returns until 20, then decline 0.1% yearly to 5.5% floor');
console.log('💡 WHY: Based on long-term market analysis - realistic but optimistic');
console.log();

try {
  const moneyGuyResult = calculator.getCompoundInterestWithGlidepath(
    30000, // Starting with $30,000
    1200, // Contributing $1,200 monthly
    22, // Starting at age 22
    65, // Retiring at age 65
    GLIDEPATH_PRESETS.MONEY_GUY_SHOW
  );

  console.log(`🎉 YOUR MONEY GUY SHOW RESULTS:`);
  console.log(`   Final retirement balance: $${calculator.formatNumberWithCommas(moneyGuyResult.finalBalance)}`);
  console.log(`   Your total contributions: $${calculator.formatNumberWithCommas(moneyGuyResult.totalContributions)}`);
  console.log(`   FREE money from compound growth: $${calculator.formatNumberWithCommas(moneyGuyResult.totalInterestEarned)}`);
  console.log(`   Account growth rate: ${(moneyGuyResult.effectiveAnnualReturn * 100).toFixed(2)}% (includes contributions)`);
  console.log(`   Investment return rate: ${(moneyGuyResult.averageAnnualInterestRate * 100).toFixed(2)}% (market performance)`);
  
  const yearlyIncome = Math.floor(moneyGuyResult.finalBalance * 0.04);
  console.log(`   Annual retirement income (4% rule): $${calculator.formatNumberWithCommas(yearlyIncome)}`);
  console.log(`   That\'s $${Math.floor(yearlyIncome / 12).toLocaleString()} per month for life!`);

  console.log(`\n📊 The Money Guy Show\'s Conservative Step-Down:`);
  [22, 25, 30, 40, 50, 60, 65, 70].forEach((age) => {
    const ageEntry = moneyGuyResult.monthlyTimeline.find(
      (entry) => Math.abs(entry.age - age) < 0.1
    );
    if (ageEntry) {
      const phase = age <= 25 ? '(Maximum Growth)' : age <= 40 ? '(Building Wealth)' : age <= 55 ? '(Protecting Gains)' : '(Preserving Capital)';
      console.log(
        `   Age ${age}: ${(ageEntry.currentAnnualReturn * 100).toFixed(2)}% return ${phase}`
      );
    }
  });
  
  console.log(`\n💡 This strategy balances optimism with realism - popular for good reason!`);
} catch (error) {
  console.error('❌ Money Guy preset calculation failed:', error);
}

// ============================================================================
// COMPARISON: WHY DYNAMIC STRATEGIES MATTER
// ============================================================================

console.log('\n\n⚖️  THE BIG COMPARISON: Dynamic vs. Traditional Investing');
console.log('-'.repeat(65));
console.log('🤔 THE QUESTION: Does all this complexity actually matter?');
console.log('📊 Let\'s compare a simple 8% fixed return vs. dynamic strategy...');
console.log();

try {
  // Traditional fixed-rate calculation
  const traditionalResult =
    calculator.getCompoundInterestWithAdditionalContributions(
      25000, // Initial balance
      1000, // Monthly contribution
      40, // Years
      0.08, // Fixed 8% return
      12, // Monthly contributions
      12 // Monthly compounding
    );

  // Dynamic glidepath with average 8% return
  const dynamicConfig: FixedReturnGlidepathConfig = {
    mode: 'fixed-return',
    startReturn: 0.1, // 10% early
    endReturn: 0.06, // 6% later (averages ~8%)
  };

  const dynamicResult = calculator.getCompoundInterestWithGlidepath(
    25000, // Same initial balance
    1000, // Same monthly contribution
    25, // Starting age
    65, // Ending age (40 years)
    dynamicConfig
  );

  console.log(`🔄 TRADITIONAL APPROACH (8% fixed forever):`);
  console.log(`   Final balance: $${calculator.formatNumberWithCommas(traditionalResult.balance)}`);
  console.log(`   Total contributions: $${calculator.formatNumberWithCommas(traditionalResult.totalContributions)}`);
  console.log(`   Total interest: $${calculator.formatNumberWithCommas(traditionalResult.totalInterestEarned)}`);
  console.log(`   Strategy: "Set it and forget it" - simple but unrealistic`);

  console.log(`\n🎆 DYNAMIC GLIDEPATH (10% early → 6% later, avg ~8%):`);
  console.log(`   Final balance: $${calculator.formatNumberWithCommas(dynamicResult.finalBalance)}`);
  console.log(`   Total contributions: $${calculator.formatNumberWithCommas(dynamicResult.totalContributions)}`);
  console.log(`   Total interest: $${calculator.formatNumberWithCommas(dynamicResult.totalInterestEarned)}`);
  console.log(`   Account growth rate: ${(dynamicResult.effectiveAnnualReturn * 100).toFixed(2)}%`);
  console.log(`   Investment return rate: ${(dynamicResult.averageAnnualInterestRate * 100).toFixed(2)}%`);
  console.log(`   Strategy: Age-appropriate risk management`);

  const difference = dynamicResult.finalBalance - traditionalResult.balance;
  const percentDiff = ((difference / traditionalResult.balance) * 100).toFixed(2);

  console.log(`\n🏆 THE WINNER: Dynamic strategy by $${calculator.formatNumberWithCommas(Math.abs(difference))} (${percentDiff}% ${difference >= 0 ? 'better' : 'worse'})!`);
  
  if (difference > 0) {
    const extraYearsOfSpending = Math.floor(difference / 50000);
    console.log(`   That\'s ${extraYearsOfSpending} extra years of $50,000/year retirement spending!`);
    console.log(`   💡 WHY: Higher returns early in your career compound for DECADES`);
    console.log(`   The extra growth from your 20s and 30s creates massive wealth later!`);
  } else {
    console.log(`   💡 Interesting: In this case, steady returns performed slightly better`);
    console.log(`   This shows why it\'s important to test different scenarios!`);
  }
} catch (error) {
  console.error('❌ Comparison calculation failed:', error);
}

// ============================================================================
// BONUS: USING TIMELINE DATA FOR ANALYSIS
// ============================================================================

console.log('\n\n📈 BONUS: Timeline Data for Charts and Analysis');
console.log('-'.repeat(55));
console.log('🔧 FOR DEVELOPERS: How to extract data for building charts and apps');
console.log('📊 Every calculation returns month-by-month timeline data');
console.log();

try {
  const timelineConfig: AllocationBasedGlidepathConfig = {
    mode: 'allocation-based',
    startEquityWeight: 0.8,
    endEquityWeight: 0.2,
    equityReturn: 0.1,
    bondReturn: 0.03,
  };

  const timelineResult = calculator.getCompoundInterestWithGlidepath(
    10000,
    500,
    30,
    50,
    timelineConfig
  );

  console.log(`\n📊 Sample Timeline Data (every 5 years):`);
  console.log(
    'Year | Age   | Balance    | Equity% | Annual Return | Interest Earned'
  );
  console.log('-'.repeat(75));

  // Show data every 5 years
  const yearlyData = timelineResult.monthlyTimeline.filter(
    (entry, index) => index % 60 === 59 // Every 60 months (5 years), at end of year
  );

  yearlyData.forEach((entry, index) => {
    const year = (index + 1) * 5;
    const equityPercent = entry.currentEquityWeight
      ? (entry.currentEquityWeight * 100).toFixed(0) + '%'
      : 'N/A';
    const returnPercent = (entry.currentAnnualReturn * 100).toFixed(2) + '%';
    const monthlyInterest = entry.monthlyInterestEarned;

    console.log(
      `${year.toString().padStart(4)} | ` +
        `${entry.age.toFixed(1).padStart(5)} | ` +
        `$${calculator
          .formatNumberWithCommas(entry.currentBalance)
          .padStart(9)} | ` +
        `${equityPercent.padStart(7)} | ` +
        `${returnPercent.padStart(11)} | ` +
        `$${monthlyInterest.toFixed(2).padStart(6)}`
    );
  });

  console.log(`\n🔥 DEVELOPER POWER: ${timelineResult.monthlyTimeline.length} monthly data points available!`);
  console.log(`   • Build interactive charts showing balance growth over time`);
  console.log(`   • Create allocation pie charts that change with age`);
  console.log(`   • Show return rate progression graphs`);
  console.log(`   • Build financial planning apps with detailed projections`);
} catch (error) {
  console.error('❌ Timeline demonstration failed:', error);
}

// ============================================================================
// KEY INSIGHTS & YOUR ACTION PLAN
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('🎓 KEY INSIGHTS FROM ADVANCED STRATEGIES');
console.log('='.repeat(70));

console.log(`
💡 WHAT YOU LEARNED TODAY:

1️⃣  FRONT-LOADED RETURNS ARE GOLD:
   Higher returns in your 20s and 30s compound for DECADES.
   A 25-year-old earning 10% beats a 25-year-old earning 8% by hundreds of thousands!

2️⃣  RISK MANAGEMENT MATTERS:
   Being 100% stocks at 64 is dangerous - you can\'t afford a 2008-style crash.
   Glidepath strategies protect your gains as you near retirement.

3️⃣  ONE SIZE DOESN\'T FIT ALL:
   Your optimal strategy depends on your risk tolerance, timeline, and goals.
   Custom strategies can significantly outperform generic approaches.

4️⃣  SIMPLE ISN\'T ALWAYS BEST:
   While "8% fixed forever" is easy to understand, it\'s unrealistic.
   Age-appropriate strategies can boost your final balance significantly.

🎯 WHICH STRATEGY IS RIGHT FOR YOU?

🚀 Young Professional (20s-30s): Custom Waypoints or Fixed Return Glidepath
   You can afford high risk early for maximum compound growth

🏆 Busy Professional (30s-40s): Target-Date Fund Approach
   "Set it and forget it" with professional risk management

💰 Conservative Planner (Any age): Money Guy Show Preset
   Proven, realistic assumptions that account for market reality

🔥 Advanced Investor (Any age): Custom Waypoints
   Maximum control to optimize for your specific situation`);

console.log(`\n🚀 YOUR ACTION PLAN:

✅ Experiment with these examples using YOUR real numbers
✅ Compare results - see which strategy works best for your situation
✅ Consider your risk tolerance - aggressive early, conservative later
✅ Automate your investments - consistency beats perfect timing
✅ Review annually - adjust as your life situation changes

⚠️  IMPORTANT DISCLAIMER:
   These examples are for EDUCATIONAL COMPARISON only - we're not recommending
   any specific strategy as "best." Each shows different approaches under
   idealized conditions with steady returns.
   
   📊 For REAL decision-making, you'll want to use Monte Carlo analysis
   (coming soon to this package!) which models thousands of scenarios
   with realistic market volatility to find the optimal strategy for
   YOUR specific risk tolerance and timeline.

💸 Remember: The best investment strategy is the one you'll actually stick to!
   Consistency over 30-40 years beats trying to time the market.

🔧 For developers: Use this rich timeline data to build amazing financial tools!`);

console.log('='.repeat(70));
