export interface TradingGoals {
  dailyProfitGoal: number
  weeklyProfitGoal: number
  monthlyProfitGoal: number
  yearlyProfitGoal: number
  winRateGoal: number // %
  avgRrGoal: number
  maxDrawdownGoal: number // %
  maxRiskPerTradeGoal: number // %
  monthlyScoreGoal: number
  consistencyGoal: number // %
}

export const defaultTradingGoals: TradingGoals = {
  dailyProfitGoal: 300,
  weeklyProfitGoal: 1200,
  monthlyProfitGoal: 5000,
  yearlyProfitGoal: 50000,
  winRateGoal: 65,
  avgRrGoal: 2.0,
  maxDrawdownGoal: 8,
  maxRiskPerTradeGoal: 1.5,
  monthlyScoreGoal: 85,
  consistencyGoal: 80,
}

export interface RiskRules {
  maxDailyLoss: number
  maxWeeklyLoss: number
  maxMonthlyLoss: number
  maxConsecutiveLosses: number
  maxConsecutiveWins: number
  maxTradesPerDay: number
  maxTradesPerWeek: number
  maxRiskPercentage: number
  maxLotSize: number
  maxOpenPositions: number
  tradingCutoffTime: string
}

export const defaultRiskRules: RiskRules = {
  maxDailyLoss: 500,
  maxWeeklyLoss: 1500,
  maxMonthlyLoss: 4000,
  maxConsecutiveLosses: 3,
  maxConsecutiveWins: 5,
  maxTradesPerDay: 4,
  maxTradesPerWeek: 20,
  maxRiskPercentage: 2.0,
  maxLotSize: 5.0,
  maxOpenPositions: 2,
  tradingCutoffTime: '20:00',
}

export interface CustomTradingRule {
  id: string
  title: string
  description: string
  category: 'Risk' | 'Execution' | 'Strategy' | 'Psychology'
  enabled: boolean
  isSystemRule?: boolean
}

export const defaultCustomRules: CustomTradingRule[] = [
  { id: 'rule_1', title: 'Never Move Stop Loss', description: 'Once defined, SL must not be moved wider.', category: 'Risk', enabled: true, isSystemRule: true },
  { id: 'rule_2', title: 'Always Use Take Profit Target', description: 'Define TP target before entering.', category: 'Execution', enabled: true, isSystemRule: true },
  { id: 'rule_3', title: 'Minimum RR = 1:1.5', description: 'Refuse setups offering less than 1.5 R:R.', category: 'Strategy', enabled: true, isSystemRule: true },
  { id: 'rule_4', title: 'Wait for Confirmation Candle', description: 'Enter only after candle closure on entry timeframe.', category: 'Execution', enabled: true, isSystemRule: true },
  { id: 'rule_5', title: 'Maximum 3 Trades Daily', description: 'Cap executions to 3 trades per day.', category: 'Execution', enabled: true, isSystemRule: true },
  { id: 'rule_6', title: 'Only Trade London & NY Session', description: 'Avoid off-hours low liquidity trading.', category: 'Strategy', enabled: true, isSystemRule: true },
  { id: 'rule_7', title: 'Avoid Trading During High-Impact News', description: 'Pause trading 30m before and after CPI/NFP.', category: 'Risk', enabled: true, isSystemRule: true },
  { id: 'rule_8', title: 'Never Revenge Trade', description: 'Take a 15-minute break after every loss.', category: 'Psychology', enabled: true, isSystemRule: true },
  { id: 'rule_9', title: 'No Emotional Entries', description: 'Log mood and verify plan before clicking buy or sell.', category: 'Psychology', enabled: true, isSystemRule: true },
  { id: 'rule_10', title: 'Use Proper Position Sizing', description: 'Risk no more than 2% per trade.', category: 'Risk', enabled: true, isSystemRule: true },
]

export interface Achievement {
  id: string
  title: string
  description: string
  category: 'Milestone' | 'Discipline' | 'Profit' | 'Streak'
  iconName: string
  unlocked: boolean
  unlockedAt?: string
  progress: number // 0 - 100
}

export interface StreakData {
  winningDaysStreak: number
  losingDaysStreak: number
  goalAchievementStreak: number
  disciplineStreak: number
  noRevengeStreak: number
  consistencyStreak: number
}

export interface UserGoalsState {
  goals: TradingGoals
  riskRules: RiskRules
  customRules: CustomTradingRule[]
  achievements: Achievement[]
  streaks: StreakData
  lastUpdated?: string
}

export const defaultUserGoalsState: UserGoalsState = {
  goals: defaultTradingGoals,
  riskRules: defaultRiskRules,
  customRules: defaultCustomRules,
  achievements: [],
  streaks: {
    winningDaysStreak: 0,
    losingDaysStreak: 0,
    goalAchievementStreak: 0,
    disciplineStreak: 0,
    noRevengeStreak: 0,
    consistencyStreak: 0,
  },
}
