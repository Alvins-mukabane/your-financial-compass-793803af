// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bootstrap_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthUser _$AuthUserFromJson(Map<String, dynamic> json) =>
    AuthUser(id: json['id'] as String, email: json['email'] as String?);

Map<String, dynamic> _$AuthUserToJson(AuthUser instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
};

UserProfile _$UserProfileFromJson(Map<String, dynamic> json) => UserProfile(
  userId: json['userId'] as String,
  legacyPublicUserId: json['legacyPublicUserId'] as String?,
  firstName: json['firstName'] as String,
  lastName: json['lastName'] as String,
  country: json['country'] as String,
  phoneNumber: json['phoneNumber'] as String,
  userType: $enumDecode(_$UserTypeEnumMap, json['userType']),
  updatesOptIn: json['updatesOptIn'] as bool,
  passwordSetupCompleted: json['passwordSetupCompleted'] as bool,
  cashBalance: (json['cashBalance'] as num).toDouble(),
  monthlyIncome: (json['monthlyIncome'] as num).toDouble(),
  monthlyFixedExpenses: (json['monthlyFixedExpenses'] as num).toDouble(),
  budgetingFocus: json['budgetingFocus'] as String,
  intentFocus: json['intentFocus'] as String,
  biggestProblem: json['biggestProblem'] as String,
  moneyStyle: json['moneyStyle'] as String,
  guidanceStyle: json['guidanceStyle'] as String,
  goalFocus: json['goalFocus'] as String,
  subscriptionAwareness: json['subscriptionAwareness'] as String,
  targetMonthlySavings: (json['targetMonthlySavings'] as num).toDouble(),
  onboardingCompleted: json['onboardingCompleted'] as bool,
  onboardingCompletedAt: json['onboardingCompletedAt'] as String?,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$UserProfileToJson(UserProfile instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'legacyPublicUserId': instance.legacyPublicUserId,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'country': instance.country,
      'phoneNumber': instance.phoneNumber,
      'userType': _$UserTypeEnumMap[instance.userType]!,
      'updatesOptIn': instance.updatesOptIn,
      'passwordSetupCompleted': instance.passwordSetupCompleted,
      'cashBalance': instance.cashBalance,
      'monthlyIncome': instance.monthlyIncome,
      'monthlyFixedExpenses': instance.monthlyFixedExpenses,
      'budgetingFocus': instance.budgetingFocus,
      'intentFocus': instance.intentFocus,
      'biggestProblem': instance.biggestProblem,
      'moneyStyle': instance.moneyStyle,
      'guidanceStyle': instance.guidanceStyle,
      'goalFocus': instance.goalFocus,
      'subscriptionAwareness': instance.subscriptionAwareness,
      'targetMonthlySavings': instance.targetMonthlySavings,
      'onboardingCompleted': instance.onboardingCompleted,
      'onboardingCompletedAt': instance.onboardingCompletedAt,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

const _$UserTypeEnumMap = {
  UserType.personal: 'personal',
  UserType.business: 'business',
};

UserGoal _$UserGoalFromJson(Map<String, dynamic> json) => UserGoal(
  id: json['id'] as String,
  userId: json['userId'] as String?,
  name: json['name'] as String,
  targetAmount: (json['targetAmount'] as num).toDouble(),
  currentAmount: (json['currentAmount'] as num).toDouble(),
  deadline: json['deadline'] as String,
  icon: json['icon'] as String,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$UserGoalToJson(UserGoal instance) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'name': instance.name,
  'targetAmount': instance.targetAmount,
  'currentAmount': instance.currentAmount,
  'deadline': instance.deadline,
  'icon': instance.icon,
  'createdAt': instance.createdAt,
  'updatedAt': instance.updatedAt,
};

BudgetLimit _$BudgetLimitFromJson(Map<String, dynamic> json) => BudgetLimit(
  id: json['id'] as String,
  userId: json['userId'] as String?,
  category: json['category'] as String,
  monthlyLimit: (json['monthlyLimit'] as num).toDouble(),
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$BudgetLimitToJson(BudgetLimit instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'category': instance.category,
      'monthlyLimit': instance.monthlyLimit,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

SpendingEventItem _$SpendingEventItemFromJson(Map<String, dynamic> json) =>
    SpendingEventItem(
      category: json['category'] as String,
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String,
    );

Map<String, dynamic> _$SpendingEventItemToJson(SpendingEventItem instance) =>
    <String, dynamic>{
      'category': instance.category,
      'amount': instance.amount,
      'description': instance.description,
    };

SpendingEvent _$SpendingEventFromJson(Map<String, dynamic> json) =>
    SpendingEvent(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      date: json['date'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => SpendingEventItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      rawInput: json['rawInput'] as String,
      total: (json['total'] as num).toDouble(),
      source: json['source'] as String,
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$SpendingEventToJson(SpendingEvent instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'date': instance.date,
      'items': instance.items,
      'rawInput': instance.rawInput,
      'total': instance.total,
      'source': instance.source,
      'createdAt': instance.createdAt,
    };

FinancialEntry _$FinancialEntryFromJson(Map<String, dynamic> json) =>
    FinancialEntry(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      name: json['name'] as String,
      type: json['type'] as String,
      entryType: $enumDecode(_$FinancialEntryTypeEnumMap, json['entryType']),
      value: (json['value'] as num).toDouble(),
      cashflow: (json['cashflow'] as num).toDouble(),
      balance: (json['balance'] as num).toDouble(),
      payment: (json['payment'] as num).toDouble(),
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$FinancialEntryToJson(FinancialEntry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'name': instance.name,
      'type': instance.type,
      'entryType': _$FinancialEntryTypeEnumMap[instance.entryType]!,
      'value': instance.value,
      'cashflow': instance.cashflow,
      'balance': instance.balance,
      'payment': instance.payment,
      'description': instance.description,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

const _$FinancialEntryTypeEnumMap = {
  FinancialEntryType.asset: 'asset',
  FinancialEntryType.liability: 'liability',
};

Subscription _$SubscriptionFromJson(Map<String, dynamic> json) => Subscription(
  id: json['id'] as String,
  userId: json['userId'] as String?,
  name: json['name'] as String,
  price: (json['price'] as num).toDouble(),
  billingCycle: json['billingCycle'] as String,
  category: json['category'] as String,
  isActive: json['isActive'] as bool,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$SubscriptionToJson(Subscription instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'name': instance.name,
      'price': instance.price,
      'billingCycle': instance.billingCycle,
      'category': instance.category,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

DashboardSummary _$DashboardSummaryFromJson(Map<String, dynamic> json) =>
    DashboardSummary(
      cashBalance: (json['cashBalance'] as num).toDouble(),
      totalAssets: (json['totalAssets'] as num).toDouble(),
      totalLiabilities: (json['totalLiabilities'] as num).toDouble(),
      netWorth: (json['netWorth'] as num).toDouble(),
      monthlyIncome: (json['monthlyIncome'] as num).toDouble(),
      monthlyFixedExpenses: (json['monthlyFixedExpenses'] as num).toDouble(),
      monthlySubscriptionTotal: (json['monthlySubscriptionTotal'] as num)
          .toDouble(),
      monthlyCashflow: (json['monthlyCashflow'] as num).toDouble(),
      savingsRate: (json['savingsRate'] as num).toDouble(),
      healthScore: (json['healthScore'] as num).toDouble(),
      spendingThisMonth: (json['spendingThisMonth'] as num).toDouble(),
      latestSpendingDate: json['latestSpendingDate'] as String?,
    );

Map<String, dynamic> _$DashboardSummaryToJson(DashboardSummary instance) =>
    <String, dynamic>{
      'cashBalance': instance.cashBalance,
      'totalAssets': instance.totalAssets,
      'totalLiabilities': instance.totalLiabilities,
      'netWorth': instance.netWorth,
      'monthlyIncome': instance.monthlyIncome,
      'monthlyFixedExpenses': instance.monthlyFixedExpenses,
      'monthlySubscriptionTotal': instance.monthlySubscriptionTotal,
      'monthlyCashflow': instance.monthlyCashflow,
      'savingsRate': instance.savingsRate,
      'healthScore': instance.healthScore,
      'spendingThisMonth': instance.spendingThisMonth,
      'latestSpendingDate': instance.latestSpendingDate,
    };

AdviceResult _$AdviceResultFromJson(Map<String, dynamic> json) => AdviceResult(
  id: json['id'] as String,
  type: $enumDecode(_$AdviceTypeEnumMap, json['type']),
  tone: $enumDecode(_$AdviceToneEnumMap, json['tone']),
  title: json['title'] as String,
  body: json['body'] as String,
  ctaLabel: json['ctaLabel'] as String?,
  ctaHref: json['ctaHref'] as String?,
);

Map<String, dynamic> _$AdviceResultToJson(AdviceResult instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$AdviceTypeEnumMap[instance.type]!,
      'tone': _$AdviceToneEnumMap[instance.tone]!,
      'title': instance.title,
      'body': instance.body,
      'ctaLabel': instance.ctaLabel,
      'ctaHref': instance.ctaHref,
    };

const _$AdviceTypeEnumMap = {
  AdviceType.spendingAcknowledgement: 'spendingAcknowledgement',
  AdviceType.groundedAdvice: 'groundedAdvice',
  AdviceType.budgetWarning: 'budgetWarning',
  AdviceType.goalProgressNudge: 'goalProgressNudge',
};

const _$AdviceToneEnumMap = {
  AdviceTone.info: 'info',
  AdviceTone.success: 'success',
  AdviceTone.warning: 'warning',
};

SummaryResult _$SummaryResultFromJson(Map<String, dynamic> json) =>
    SummaryResult(
      period: $enumDecode(_$SummaryPeriodEnumMap, json['period']),
      status: json['status'] as String,
      headline: json['headline'] as String,
      body: json['body'] as String,
      totalSpent: (json['totalSpent'] as num).toDouble(),
      eventCount: (json['eventCount'] as num).toInt(),
      topCategory: json['topCategory'] as String?,
      generatedAt: json['generatedAt'] as String,
    );

Map<String, dynamic> _$SummaryResultToJson(SummaryResult instance) =>
    <String, dynamic>{
      'period': _$SummaryPeriodEnumMap[instance.period]!,
      'status': instance.status,
      'headline': instance.headline,
      'body': instance.body,
      'totalSpent': instance.totalSpent,
      'eventCount': instance.eventCount,
      'topCategory': instance.topCategory,
      'generatedAt': instance.generatedAt,
    };

const _$SummaryPeriodEnumMap = {
  SummaryPeriod.daily: 'daily',
  SummaryPeriod.weekly: 'weekly',
};

BudgetStatus _$BudgetStatusFromJson(Map<String, dynamic> json) => BudgetStatus(
  category: json['category'] as String,
  monthlyLimit: (json['monthlyLimit'] as num).toDouble(),
  spentThisMonth: (json['spentThisMonth'] as num).toDouble(),
  remainingAmount: (json['remainingAmount'] as num).toDouble(),
  percentUsed: (json['percentUsed'] as num).toDouble(),
  status: $enumDecode(_$BudgetStatusTypeEnumMap, json['status']),
);

Map<String, dynamic> _$BudgetStatusToJson(BudgetStatus instance) =>
    <String, dynamic>{
      'category': instance.category,
      'monthlyLimit': instance.monthlyLimit,
      'spentThisMonth': instance.spentThisMonth,
      'remainingAmount': instance.remainingAmount,
      'percentUsed': instance.percentUsed,
      'status': _$BudgetStatusTypeEnumMap[instance.status]!,
    };

const _$BudgetStatusTypeEnumMap = {
  BudgetStatusType.healthy: 'healthy',
  BudgetStatusType.watch: 'watch',
  BudgetStatusType.over: 'over',
};

GoalStatus _$GoalStatusFromJson(Map<String, dynamic> json) => GoalStatus(
  id: json['id'] as String,
  name: json['name'] as String,
  icon: json['icon'] as String,
  targetAmount: (json['targetAmount'] as num).toDouble(),
  currentAmount: (json['currentAmount'] as num).toDouble(),
  remainingAmount: (json['remainingAmount'] as num).toDouble(),
  progressPercent: (json['progressPercent'] as num).toDouble(),
  deadline: json['deadline'] as String,
  daysRemaining: (json['daysRemaining'] as num).toInt(),
  monthlyContributionNeeded: (json['monthlyContributionNeeded'] as num)
      .toDouble(),
  status: $enumDecode(_$GoalStatusTypeEnumMap, json['status']),
);

Map<String, dynamic> _$GoalStatusToJson(GoalStatus instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'icon': instance.icon,
      'targetAmount': instance.targetAmount,
      'currentAmount': instance.currentAmount,
      'remainingAmount': instance.remainingAmount,
      'progressPercent': instance.progressPercent,
      'deadline': instance.deadline,
      'daysRemaining': instance.daysRemaining,
      'monthlyContributionNeeded': instance.monthlyContributionNeeded,
      'status': _$GoalStatusTypeEnumMap[instance.status]!,
    };

const _$GoalStatusTypeEnumMap = {
  GoalStatusType.onTrack: 'onTrack',
  GoalStatusType.needsAttention: 'needsAttention',
  GoalStatusType.achieved: 'achieved',
};

EmptyFlags _$EmptyFlagsFromJson(Map<String, dynamic> json) => EmptyFlags(
  hasSpendingHistory: json['hasSpendingHistory'] as bool,
  hasGoals: json['hasGoals'] as bool,
  hasBudgetLimits: json['hasBudgetLimits'] as bool,
  hasSubscriptions: json['hasSubscriptions'] as bool,
  hasBalanceSheet: json['hasBalanceSheet'] as bool,
);

Map<String, dynamic> _$EmptyFlagsToJson(EmptyFlags instance) =>
    <String, dynamic>{
      'hasSpendingHistory': instance.hasSpendingHistory,
      'hasGoals': instance.hasGoals,
      'hasBudgetLimits': instance.hasBudgetLimits,
      'hasSubscriptions': instance.hasSubscriptions,
      'hasBalanceSheet': instance.hasBalanceSheet,
    };

MigrationState _$MigrationStateFromJson(Map<String, dynamic> json) =>
    MigrationState(
      legacyPublicUserId: json['legacyPublicUserId'] as String?,
      migratedFromPublic: json['migratedFromPublic'] as bool,
    );

Map<String, dynamic> _$MigrationStateToJson(MigrationState instance) =>
    <String, dynamic>{
      'legacyPublicUserId': instance.legacyPublicUserId,
      'migratedFromPublic': instance.migratedFromPublic,
    };

BootstrapData _$BootstrapDataFromJson(
  Map<String, dynamic> json,
) => BootstrapData(
  userId: json['userId'] as String,
  email: json['email'] as String?,
  hasOnboarded: json['hasOnboarded'] as bool,
  migration: MigrationState.fromJson(json['migration'] as Map<String, dynamic>),
  profile: json['profile'] == null
      ? null
      : UserProfile.fromJson(json['profile'] as Map<String, dynamic>),
  goals: (json['goals'] as List<dynamic>)
      .map((e) => UserGoal.fromJson(e as Map<String, dynamic>))
      .toList(),
  budgetLimits: (json['budgetLimits'] as List<dynamic>)
      .map((e) => BudgetLimit.fromJson(e as Map<String, dynamic>))
      .toList(),
  spendingEvents: (json['spendingEvents'] as List<dynamic>)
      .map((e) => SpendingEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  spendingLogs: (json['spendingLogs'] as List<dynamic>)
      .map((e) => SpendingEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  financialEntries: (json['financialEntries'] as List<dynamic>)
      .map((e) => FinancialEntry.fromJson(e as Map<String, dynamic>))
      .toList(),
  subscriptions: (json['subscriptions'] as List<dynamic>)
      .map((e) => Subscription.fromJson(e as Map<String, dynamic>))
      .toList(),
  dashboardSummary: DashboardSummary.fromJson(
    json['dashboardSummary'] as Map<String, dynamic>,
  ),
  advice: (json['advice'] as List<dynamic>)
      .map((e) => AdviceResult.fromJson(e as Map<String, dynamic>))
      .toList(),
  summaries: (json['summaries'] as List<dynamic>)
      .map((e) => SummaryResult.fromJson(e as Map<String, dynamic>))
      .toList(),
  budgetStatuses: (json['budgetStatuses'] as List<dynamic>)
      .map((e) => BudgetStatus.fromJson(e as Map<String, dynamic>))
      .toList(),
  goalStatuses: (json['goalStatuses'] as List<dynamic>)
      .map((e) => GoalStatus.fromJson(e as Map<String, dynamic>))
      .toList(),
  emptyFlags: EmptyFlags.fromJson(json['emptyFlags'] as Map<String, dynamic>),
);

Map<String, dynamic> _$BootstrapDataToJson(BootstrapData instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'email': instance.email,
      'hasOnboarded': instance.hasOnboarded,
      'migration': instance.migration,
      'profile': instance.profile,
      'goals': instance.goals,
      'budgetLimits': instance.budgetLimits,
      'spendingEvents': instance.spendingEvents,
      'spendingLogs': instance.spendingLogs,
      'financialEntries': instance.financialEntries,
      'subscriptions': instance.subscriptions,
      'dashboardSummary': instance.dashboardSummary,
      'advice': instance.advice,
      'summaries': instance.summaries,
      'budgetStatuses': instance.budgetStatuses,
      'goalStatuses': instance.goalStatuses,
      'emptyFlags': instance.emptyFlags,
    };
