import 'package:json_annotation/json_annotation.dart';

part 'bootstrap_data.g.dart';

enum UserType { personal, business }

enum FinancialEntryType { asset, liability }

enum AdviceType {
  spendingAcknowledgement,
  groundedAdvice,
  budgetWarning,
  goalProgressNudge,
}

enum AdviceTone { info, success, warning }

enum SummaryPeriod { daily, weekly }

enum BudgetStatusType { healthy, watch, over }

enum GoalStatusType { onTrack, needsAttention, achieved }

@JsonSerializable()
class AuthUser {
  final String id;
  final String? email;

  AuthUser({required this.id, this.email});

  factory AuthUser.fromJson(Map<String, dynamic> json) =>
      _$AuthUserFromJson(json);

  Map<String, dynamic> toJson() => _$AuthUserToJson(this);
}

@JsonSerializable()
class UserProfile {
  final String userId;
  final String? legacyPublicUserId;
  final String firstName;
  final String lastName;
  final String country;
  final String phoneNumber;
  final UserType userType;
  final bool updatesOptIn;
  final bool passwordSetupCompleted;
  final double cashBalance;
  final double monthlyIncome;
  final double monthlyFixedExpenses;
  final String budgetingFocus;
  final String intentFocus;
  final String biggestProblem;
  final String moneyStyle;
  final String guidanceStyle;
  final String goalFocus;
  final String subscriptionAwareness;
  final double targetMonthlySavings;
  final bool onboardingCompleted;
  final String? onboardingCompletedAt;
  final String? createdAt;
  final String? updatedAt;

  UserProfile({
    required this.userId,
    this.legacyPublicUserId,
    required this.firstName,
    required this.lastName,
    required this.country,
    required this.phoneNumber,
    required this.userType,
    required this.updatesOptIn,
    required this.passwordSetupCompleted,
    required this.cashBalance,
    required this.monthlyIncome,
    required this.monthlyFixedExpenses,
    required this.budgetingFocus,
    required this.intentFocus,
    required this.biggestProblem,
    required this.moneyStyle,
    required this.guidanceStyle,
    required this.goalFocus,
    required this.subscriptionAwareness,
    required this.targetMonthlySavings,
    required this.onboardingCompleted,
    this.onboardingCompletedAt,
    this.createdAt,
    this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);

  Map<String, dynamic> toJson() => _$UserProfileToJson(this);
}

@JsonSerializable()
class UserGoal {
  final String id;
  final String? userId;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final String deadline;
  final String icon;
  final String? createdAt;
  final String? updatedAt;

  UserGoal({
    required this.id,
    this.userId,
    required this.name,
    required this.targetAmount,
    required this.currentAmount,
    required this.deadline,
    required this.icon,
    this.createdAt,
    this.updatedAt,
  });

  factory UserGoal.fromJson(Map<String, dynamic> json) =>
      _$UserGoalFromJson(json);

  Map<String, dynamic> toJson() => _$UserGoalToJson(this);
}

@JsonSerializable()
class BudgetLimit {
  final String id;
  final String? userId;
  final String category;
  final double monthlyLimit;
  final String? createdAt;
  final String? updatedAt;

  BudgetLimit({
    required this.id,
    this.userId,
    required this.category,
    required this.monthlyLimit,
    this.createdAt,
    this.updatedAt,
  });

  factory BudgetLimit.fromJson(Map<String, dynamic> json) =>
      _$BudgetLimitFromJson(json);

  Map<String, dynamic> toJson() => _$BudgetLimitToJson(this);
}

@JsonSerializable()
class SpendingEventItem {
  final String category;
  final double amount;
  final String description;

  SpendingEventItem({
    required this.category,
    required this.amount,
    required this.description,
  });

  factory SpendingEventItem.fromJson(Map<String, dynamic> json) =>
      _$SpendingEventItemFromJson(json);

  Map<String, dynamic> toJson() => _$SpendingEventItemToJson(this);
}

@JsonSerializable()
class SpendingEvent {
  final String id;
  final String? userId;
  final String date;
  final List<SpendingEventItem> items;
  final String rawInput;
  final double total;
  final String source;
  final String? createdAt;

  SpendingEvent({
    required this.id,
    this.userId,
    required this.date,
    required this.items,
    required this.rawInput,
    required this.total,
    required this.source,
    this.createdAt,
  });

  factory SpendingEvent.fromJson(Map<String, dynamic> json) =>
      _$SpendingEventFromJson(json);

  Map<String, dynamic> toJson() => _$SpendingEventToJson(this);
}

@JsonSerializable()
class FinancialEntry {
  final String id;
  final String? userId;
  final String name;
  final String type;
  final FinancialEntryType entryType;
  final double value;
  final double cashflow;
  final double balance;
  final double payment;
  final String? description;
  final String? createdAt;
  final String? updatedAt;

  FinancialEntry({
    required this.id,
    this.userId,
    required this.name,
    required this.type,
    required this.entryType,
    required this.value,
    required this.cashflow,
    required this.balance,
    required this.payment,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory FinancialEntry.fromJson(Map<String, dynamic> json) =>
      _$FinancialEntryFromJson(json);

  Map<String, dynamic> toJson() => _$FinancialEntryToJson(this);
}

@JsonSerializable()
class Subscription {
  final String id;
  final String? userId;
  final String name;
  final double price;
  final String billingCycle;
  final String category;
  final bool isActive;
  final String? createdAt;
  final String? updatedAt;

  Subscription({
    required this.id,
    this.userId,
    required this.name,
    required this.price,
    required this.billingCycle,
    required this.category,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) =>
      _$SubscriptionFromJson(json);

  Map<String, dynamic> toJson() => _$SubscriptionToJson(this);
}

@JsonSerializable()
class DashboardSummary {
  final double cashBalance;
  final double totalAssets;
  final double totalLiabilities;
  final double netWorth;
  final double monthlyIncome;
  final double monthlyFixedExpenses;
  final double monthlySubscriptionTotal;
  final double monthlyCashflow;
  final double savingsRate;
  final double healthScore;
  final double spendingThisMonth;
  final String? latestSpendingDate;

  DashboardSummary({
    required this.cashBalance,
    required this.totalAssets,
    required this.totalLiabilities,
    required this.netWorth,
    required this.monthlyIncome,
    required this.monthlyFixedExpenses,
    required this.monthlySubscriptionTotal,
    required this.monthlyCashflow,
    required this.savingsRate,
    required this.healthScore,
    required this.spendingThisMonth,
    this.latestSpendingDate,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) =>
      _$DashboardSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardSummaryToJson(this);
}

@JsonSerializable()
class AdviceResult {
  final String id;
  final AdviceType type;
  final AdviceTone tone;
  final String title;
  final String body;
  final String? ctaLabel;
  final String? ctaHref;

  AdviceResult({
    required this.id,
    required this.type,
    required this.tone,
    required this.title,
    required this.body,
    this.ctaLabel,
    this.ctaHref,
  });

  factory AdviceResult.fromJson(Map<String, dynamic> json) =>
      _$AdviceResultFromJson(json);

  Map<String, dynamic> toJson() => _$AdviceResultToJson(this);
}

@JsonSerializable()
class SummaryResult {
  final SummaryPeriod period;
  final String status;
  final String headline;
  final String body;
  final double totalSpent;
  final int eventCount;
  final String? topCategory;
  final String generatedAt;

  SummaryResult({
    required this.period,
    required this.status,
    required this.headline,
    required this.body,
    required this.totalSpent,
    required this.eventCount,
    this.topCategory,
    required this.generatedAt,
  });

  factory SummaryResult.fromJson(Map<String, dynamic> json) =>
      _$SummaryResultFromJson(json);

  Map<String, dynamic> toJson() => _$SummaryResultToJson(this);
}

@JsonSerializable()
class BudgetStatus {
  final String category;
  final double monthlyLimit;
  final double spentThisMonth;
  final double remainingAmount;
  final double percentUsed;
  final BudgetStatusType status;

  BudgetStatus({
    required this.category,
    required this.monthlyLimit,
    required this.spentThisMonth,
    required this.remainingAmount,
    required this.percentUsed,
    required this.status,
  });

  factory BudgetStatus.fromJson(Map<String, dynamic> json) =>
      _$BudgetStatusFromJson(json);

  Map<String, dynamic> toJson() => _$BudgetStatusToJson(this);
}

@JsonSerializable()
class GoalStatus {
  final String id;
  final String name;
  final String icon;
  final double targetAmount;
  final double currentAmount;
  final double remainingAmount;
  final double progressPercent;
  final String deadline;
  final int daysRemaining;
  final double monthlyContributionNeeded;
  final GoalStatusType status;

  GoalStatus({
    required this.id,
    required this.name,
    required this.icon,
    required this.targetAmount,
    required this.currentAmount,
    required this.remainingAmount,
    required this.progressPercent,
    required this.deadline,
    required this.daysRemaining,
    required this.monthlyContributionNeeded,
    required this.status,
  });

  factory GoalStatus.fromJson(Map<String, dynamic> json) =>
      _$GoalStatusFromJson(json);

  Map<String, dynamic> toJson() => _$GoalStatusToJson(this);
}

@JsonSerializable()
class EmptyFlags {
  final bool hasSpendingHistory;
  final bool hasGoals;
  final bool hasBudgetLimits;
  final bool hasSubscriptions;
  final bool hasBalanceSheet;

  EmptyFlags({
    required this.hasSpendingHistory,
    required this.hasGoals,
    required this.hasBudgetLimits,
    required this.hasSubscriptions,
    required this.hasBalanceSheet,
  });

  factory EmptyFlags.fromJson(Map<String, dynamic> json) =>
      _$EmptyFlagsFromJson(json);

  Map<String, dynamic> toJson() => _$EmptyFlagsToJson(this);
}

@JsonSerializable()
class MigrationState {
  final String? legacyPublicUserId;
  final bool migratedFromPublic;

  MigrationState({
    this.legacyPublicUserId,
    required this.migratedFromPublic,
  });

  factory MigrationState.fromJson(Map<String, dynamic> json) =>
      _$MigrationStateFromJson(json);

  Map<String, dynamic> toJson() => _$MigrationStateToJson(this);
}

@JsonSerializable()
class BootstrapData {
  final String userId;
  final String? email;
  final bool hasOnboarded;
  final MigrationState migration;
  final UserProfile? profile;
  final List<UserGoal> goals;
  final List<BudgetLimit> budgetLimits;
  final List<SpendingEvent> spendingEvents;
  final List<SpendingEvent> spendingLogs;
  final List<FinancialEntry> financialEntries;
  final List<Subscription> subscriptions;
  final DashboardSummary dashboardSummary;
  final List<AdviceResult> advice;
  final List<SummaryResult> summaries;
  final List<BudgetStatus> budgetStatuses;
  final List<GoalStatus> goalStatuses;
  final EmptyFlags emptyFlags;

  BootstrapData({
    required this.userId,
    this.email,
    required this.hasOnboarded,
    required this.migration,
    this.profile,
    required this.goals,
    required this.budgetLimits,
    required this.spendingEvents,
    required this.spendingLogs,
    required this.financialEntries,
    required this.subscriptions,
    required this.dashboardSummary,
    required this.advice,
    required this.summaries,
    required this.budgetStatuses,
    required this.goalStatuses,
    required this.emptyFlags,
  });

  factory BootstrapData.fromJson(Map<String, dynamic> json) =>
      _$BootstrapDataFromJson(json);

  Map<String, dynamic> toJson() => _$BootstrapDataToJson(this);
}
