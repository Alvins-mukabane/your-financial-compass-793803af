import type {
  AdviceResult,
  AffordabilityResult,
  BudgetStatus,
  DashboardSummary,
  FinanceBudgetLimit,
  FinanceFinancialEntry,
  FinanceGoal,
  FinanceProfile,
  FinanceSpendingEvent,
  FinanceSubscription,
  ForecastResult,
  GoalStatus,
  PatternSummary,
  SubscriptionReview,
  SummaryResult,
} from "./types.ts";
import {
  clamp,
  getMonthEnd,
  getMonthMetrics,
  normalizeCategory,
  parseNumber,
  toIsoDate,
} from "./utils.ts";

function calculateHealthScore({
  monthlyIncome,
  monthlyCashflow,
  totalAssets,
  totalLiabilities,
  spendingEvents,
}: {
  monthlyIncome: number;
  monthlyCashflow: number;
  totalAssets: number;
  totalLiabilities: number;
  spendingEvents: FinanceSpendingEvent[];
}) {
  let score = 50;

  if (monthlyIncome > 0) {
    const savingsRate = monthlyCashflow / monthlyIncome;
    if (savingsRate >= 0.3) score += 20;
    else if (savingsRate >= 0.15) score += 10;
    else if (savingsRate < 0) score -= 15;
  }

  if (totalAssets > 0) {
    const leverage = totalLiabilities / totalAssets;
    if (leverage <= 0.25) score += 12;
    else if (leverage >= 0.75) score -= 10;
  }

  if (spendingEvents.length >= 10) score += 8;
  else if (spendingEvents.length >= 4) score += 4;

  return clamp(Math.round(score), 10, 100);
}

export function buildDashboardSummary(
  profile: FinanceProfile | null,
  spendingEvents: FinanceSpendingEvent[],
  financialEntries: FinanceFinancialEntry[],
  subscriptions: FinanceSubscription[],
): DashboardSummary {
  const cashBalance = parseNumber(profile?.cash_balance);
  const monthlyIncome = parseNumber(profile?.monthly_income);
  const monthlyFixedExpenses = parseNumber(profile?.monthly_fixed_expenses);
  const totalAssets =
    cashBalance +
    financialEntries
      .filter((entry) => entry.entry_type === "asset")
      .reduce((sum, entry) => sum + parseNumber(entry.value), 0);
  const totalLiabilities = financialEntries
    .filter((entry) => entry.entry_type === "liability")
    .reduce((sum, entry) => sum + parseNumber(entry.balance), 0);
  const monthlySubscriptionTotal = subscriptions
    .filter((subscription) => subscription.is_active)
    .reduce((sum, subscription) => {
      const amount = parseNumber(subscription.price);
      return sum + (subscription.billing_cycle === "yearly" ? amount / 12 : amount);
    }, 0);
  const monthlyCashflow = monthlyIncome - monthlyFixedExpenses - monthlySubscriptionTotal;
  const savingsRate =
    monthlyIncome > 0 ? clamp(Math.round((monthlyCashflow / monthlyIncome) * 100), -100, 100) : 0;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spendingThisMonth = spendingEvents
    .filter((event) => event.date.startsWith(currentMonth))
    .reduce((sum, event) => sum + parseNumber(event.total), 0);
  const latestSpendingDate = spendingEvents[0]?.date ?? null;

  return {
    cash_balance: cashBalance,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: totalAssets - totalLiabilities,
    monthly_income: monthlyIncome,
    monthly_fixed_expenses: monthlyFixedExpenses,
    monthly_subscription_total: monthlySubscriptionTotal,
    monthly_cashflow: monthlyCashflow,
    savings_rate: savingsRate,
    health_score: calculateHealthScore({
      monthlyIncome,
      monthlyCashflow,
      totalAssets,
      totalLiabilities,
      spendingEvents,
    }),
    spending_this_month: spendingThisMonth,
    latest_spending_date: latestSpendingDate,
  };
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildCurrentMonthCategoryTotals(spendingEvents: FinanceSpendingEvent[]) {
  const currentMonth = getCurrentMonthKey();
  const totals: Record<string, number> = {};

  for (const event of spendingEvents) {
    if (!event.date.startsWith(currentMonth)) continue;

    for (const item of Array.isArray(event.items) ? event.items : []) {
      const category = String(item.category ?? "Other");
      totals[category] = (totals[category] || 0) + parseNumber(item.amount);
    }
  }

  return totals;
}

function getStatusPriority(status: BudgetStatus["status"]) {
  if (status === "over") return 0;
  if (status === "watch") return 1;
  return 2;
}

export function buildBudgetStatuses(
  budgetLimits: FinanceBudgetLimit[],
  spendingEvents: FinanceSpendingEvent[],
) {
  const spendingByCategory = buildCurrentMonthCategoryTotals(spendingEvents);

  return budgetLimits
    .map<BudgetStatus>((budget) => {
      const spentThisMonth = parseNumber(spendingByCategory[budget.category]);
      const monthlyLimit = parseNumber(budget.monthly_limit);
      const percentUsed =
        monthlyLimit > 0 ? Math.round((spentThisMonth / monthlyLimit) * 100) : 0;

      return {
        category: budget.category,
        monthly_limit: monthlyLimit,
        spent_this_month: spentThisMonth,
        remaining_amount: Math.max(monthlyLimit - spentThisMonth, 0),
        percent_used: clamp(percentUsed, 0, 999),
        status:
          spentThisMonth > monthlyLimit
            ? "over"
            : percentUsed >= 80
              ? "watch"
              : "healthy",
      };
    })
    .sort((left, right) => {
      const priorityDiff = getStatusPriority(left.status) - getStatusPriority(right.status);
      if (priorityDiff !== 0) return priorityDiff;
      return right.percent_used - left.percent_used;
    });
}

export function buildGoalStatuses(
  goals: FinanceGoal[],
  dashboardSummary: DashboardSummary,
) {
  const dayMs = 1000 * 60 * 60 * 24;

  return goals
    .map<GoalStatus>((goal) => {
      const targetAmount = parseNumber(goal.target_amount);
      const currentAmount = parseNumber(goal.current_amount);
      const remainingAmount = Math.max(targetAmount - currentAmount, 0);
      const progressPercent =
        targetAmount > 0
          ? clamp(Math.round((currentAmount / targetAmount) * 100), 0, 100)
          : 0;
      const deadlineMs = new Date(goal.deadline).getTime();
      const rawDaysRemaining = Number.isFinite(deadlineMs)
        ? Math.ceil((deadlineMs - Date.now()) / dayMs)
        : 0;
      const daysRemaining = Math.max(rawDaysRemaining, 0);
      const monthsRemaining = Math.max(Math.ceil(daysRemaining / 30), 1);
      const monthlyContributionNeeded =
        remainingAmount > 0 ? Math.ceil(remainingAmount / monthsRemaining) : 0;
      const status: GoalStatus["status"] =
        remainingAmount <= 0
          ? "achieved"
          : dashboardSummary.monthly_cashflow >= monthlyContributionNeeded && daysRemaining > 0
            ? "on_track"
            : "needs_attention";

      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        target_amount: targetAmount,
        current_amount: currentAmount,
        remaining_amount: remainingAmount,
        progress_percent: progressPercent,
        deadline: goal.deadline,
        days_remaining: daysRemaining,
        monthly_contribution_needed: monthlyContributionNeeded,
        status,
      };
    })
    .sort((left, right) => {
      if (left.status === "needs_attention" && right.status !== "needs_attention") return -1;
      if (left.status !== "needs_attention" && right.status === "needs_attention") return 1;
      if (left.status === "achieved" && right.status !== "achieved") return 1;
      if (left.status !== "achieved" && right.status === "achieved") return -1;
      return left.days_remaining - right.days_remaining;
    });
}

function summarizeWindow(
  period: SummaryResult["period"],
  spendingEvents: FinanceSpendingEvent[],
  budgetStatuses: BudgetStatus[],
  goalStatuses: GoalStatus[],
) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (period === "daily" ? 0 : 6));

  const relevantEvents = spendingEvents.filter((event) => new Date(event.date) >= since);
  const categoryTotals: Record<string, number> = {};

  for (const event of relevantEvents) {
    for (const item of Array.isArray(event.items) ? event.items : []) {
      const category = String(item.category ?? "Other");
      categoryTotals[category] = (categoryTotals[category] || 0) + parseNumber(item.amount);
    }
  }

  const topCategoryEntry = Object.entries(categoryTotals).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const topCategory = topCategoryEntry?.[0] ?? null;
  const topCategoryAmount = parseNumber(topCategoryEntry?.[1]);
  const totalSpent = relevantEvents.reduce((sum, event) => sum + parseNumber(event.total), 0);
  const budgetAlert = budgetStatuses.find(
    (status) => status.status === "over" || status.status === "watch",
  );
  const goalAttention = goalStatuses.find((goal) => goal.status === "needs_attention");

  if (relevantEvents.length === 0) {
    return {
      period,
      status: "needs_more_data",
      headline:
        period === "daily"
          ? "No spending logged today yet"
          : "Your weekly summary will sharpen as you keep logging",
      body:
        period === "daily"
          ? "Log your first expense today and eva will turn it into a grounded daily pulse."
          : "You need a few more real logs this week before eva can confidently summarize your trend.",
      total_spent: 0,
      event_count: 0,
      top_category: null,
      generated_at: new Date().toISOString(),
    } satisfies SummaryResult;
  }

  const cadence = period === "daily" ? "today" : "this week";
  const nextPrompt = budgetAlert
    ? `${budgetAlert.category} is ${budgetAlert.status === "over" ? "already over" : "close to"} budget, so that is the next place to tighten.`
    : goalAttention
      ? `${goalAttention.name} needs about $${goalAttention.monthly_contribution_needed} per month to stay on track.`
      : "Keep logging in real time so eva can protect your trend before spending drifts.";

  return {
    period,
    status: "ready",
    headline:
      period === "daily"
        ? `You logged $${totalSpent.toFixed(2)} ${cadence}.`
        : `You logged $${totalSpent.toFixed(2)} ${cadence} across ${relevantEvents.length} record${relevantEvents.length === 1 ? "" : "s"}.`,
    body: topCategory
      ? `${topCategory} led your spending at $${topCategoryAmount.toFixed(2)} ${cadence}. ${nextPrompt}`
      : nextPrompt,
    total_spent: totalSpent,
    event_count: relevantEvents.length,
    top_category: topCategory,
    generated_at: new Date().toISOString(),
  } satisfies SummaryResult;
}

export function buildSummaries(
  spendingEvents: FinanceSpendingEvent[],
  budgetStatuses: BudgetStatus[],
  goalStatuses: GoalStatus[],
) {
  return [
    summarizeWindow("daily", spendingEvents, budgetStatuses, goalStatuses),
    summarizeWindow("weekly", spendingEvents, budgetStatuses, goalStatuses),
  ];
}

export function buildPatternSummaries(spendingEvents: FinanceSpendingEvent[]) {
  const now = new Date();
  const { currentMonthEvents, previousMonthEvents } = getMonthMetrics(spendingEvents, now);
  const recentWeekStart = new Date(now);
  recentWeekStart.setDate(recentWeekStart.getDate() - 6);
  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(previousWeekStart.getDate() - 13);
  const previousWeekEnd = new Date(now);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const weeklyTotals: Record<string, { current: number; previous: number }> = {};
  const monthlyTotals: Record<string, { current: number; previous: number }> = {};

  for (const event of currentMonthEvents) {
    for (const item of event.items ?? []) {
      const category = normalizeCategory(item.category);
      monthlyTotals[category] = monthlyTotals[category] ?? { current: 0, previous: 0 };
      monthlyTotals[category].current += parseNumber(item.amount);
    }
  }

  for (const event of previousMonthEvents) {
    for (const item of event.items ?? []) {
      const category = normalizeCategory(item.category);
      monthlyTotals[category] = monthlyTotals[category] ?? { current: 0, previous: 0 };
      monthlyTotals[category].previous += parseNumber(item.amount);
    }
  }

  for (const event of spendingEvents) {
    const eventDate = new Date(event.date);
    for (const item of event.items ?? []) {
      const category = normalizeCategory(item.category);
      weeklyTotals[category] = weeklyTotals[category] ?? { current: 0, previous: 0 };

      if (eventDate >= recentWeekStart) {
        weeklyTotals[category].current += parseNumber(item.amount);
      } else if (eventDate >= previousWeekStart && eventDate <= previousWeekEnd) {
        weeklyTotals[category].previous += parseNumber(item.amount);
      }
    }
  }

  const buildSummary = (
    idPrefix: string,
    period: PatternSummary["period"],
    category: string,
    currentAmount: number,
    previousAmount: number,
  ): PatternSummary => {
    const delta = currentAmount - previousAmount;
    const direction: PatternSummary["direction"] =
      Math.abs(delta) < 5 ? "steady" : delta > 0 ? "up" : "down";
    const confidence: PatternSummary["confidence"] =
      currentAmount >= 120 ? "high" : currentAmount >= 50 ? "medium" : "low";
    const movementText =
      direction === "steady"
        ? "is holding close to the prior period"
        : direction === "up"
          ? `is up by $${Math.abs(delta).toFixed(2)} versus the prior period`
          : `is down by $${Math.abs(delta).toFixed(2)} versus the prior period`;

    return {
      id: `${idPrefix}-${category.toLowerCase().replace(/\s+/g, "-")}`,
      title:
        period === "weekly"
          ? `${category} is shaping this week's pattern`
          : `${category} is shaping this month's pattern`,
      body: `${category} ${movementText}, with $${currentAmount.toFixed(2)} tracked in the current ${period}.`,
      category,
      period,
      amount: currentAmount,
      direction,
      confidence,
    };
  };

  const weeklySummaries = Object.entries(weeklyTotals)
    .filter(([, totals]) => totals.current > 0)
    .sort((left, right) => right[1].current - left[1].current)
    .slice(0, 2)
    .map(([category, totals]) =>
      buildSummary("weekly-pattern", "weekly", category, totals.current, totals.previous),
    );

  const monthlySummaries = Object.entries(monthlyTotals)
    .filter(([, totals]) => totals.current > 0)
    .sort((left, right) => right[1].current - left[1].current)
    .slice(0, 2)
    .map(([category, totals]) =>
      buildSummary("monthly-pattern", "monthly", category, totals.current, totals.previous),
    );

  return [...weeklySummaries, ...monthlySummaries];
}

export function buildForecastResult(
  dashboardSummary: DashboardSummary,
  spendingEvents: FinanceSpendingEvent[],
) {
  const now = new Date();
  const { currentMonthSpent, elapsedDays, daysInMonth } = getMonthMetrics(spendingEvents, now);
  const projectedEndOfMonthSpend =
    elapsedDays > 0 ? (currentMonthSpent / elapsedDays) * daysInMonth : currentMonthSpent;
  const projectedFreeCash =
    dashboardSummary.monthly_income -
    dashboardSummary.monthly_fixed_expenses -
    dashboardSummary.monthly_subscription_total -
    projectedEndOfMonthSpend;
  const projectedEndOfMonthCash = dashboardSummary.cash_balance + projectedFreeCash;
  const spendingRunRate = elapsedDays > 0 ? currentMonthSpent / elapsedDays : 0;

  let status: ForecastResult["status"] = "needs_more_data";
  if (spendingEvents.length >= 2) {
    if (projectedFreeCash >= 200) status = "on_track";
    else if (projectedFreeCash >= 0) status = "watch";
    else status = "overextended";
  }

  const summary =
    status === "needs_more_data"
      ? "Keep logging real expenses so eva can tighten the month-end forecast."
      : status === "on_track"
        ? `At the current run rate, you should finish the month with about $${projectedFreeCash.toFixed(2)} free after fixed costs, subscriptions, and variable spending.`
        : status === "watch"
          ? `At the current run rate, this month stays tight with about $${projectedFreeCash.toFixed(2)} left after planned costs.`
          : `At the current run rate, variable spending would push you about $${Math.abs(projectedFreeCash).toFixed(2)} past break-even by month end.`;

  return {
    period_end: toIsoDate(getMonthEnd(now)),
    days_remaining: Math.max(daysInMonth - elapsedDays, 0),
    month_to_date_spending: currentMonthSpent,
    projected_end_of_month_spend: Number(projectedEndOfMonthSpend.toFixed(2)),
    projected_end_of_month_cash: Number(projectedEndOfMonthCash.toFixed(2)),
    projected_free_cash: Number(projectedFreeCash.toFixed(2)),
    spending_run_rate: Number(spendingRunRate.toFixed(2)),
    status,
    summary,
  } satisfies ForecastResult;
}

export function buildSubscriptionReview(
  subscriptions: FinanceSubscription[],
  dashboardSummary: DashboardSummary,
) {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.is_active);
  const recommendations = activeSubscriptions
    .map((subscription) => {
      const monthlyImpact =
        subscription.billing_cycle === "yearly"
          ? parseNumber(subscription.price) / 12
          : parseNumber(subscription.price);
      const discretionaryCategory = /entertainment|music|video|gaming|shopping/i.test(
        subscription.category,
      );
      const action: "keep" | "review" | "cancel" =
        dashboardSummary.monthly_cashflow < 0 && discretionaryCategory && monthlyImpact >= 20
          ? "cancel"
          : monthlyImpact >= 25 || activeSubscriptions.length >= 5
            ? "review"
            : "keep";
      const reason =
        action === "cancel"
          ? "Your monthly cash flow is already under pressure, so this recurring cost is the cleanest place to cut first."
          : action === "review"
            ? "This subscription is large enough to deserve a deliberate keep-or-cut decision."
            : "This subscription currently fits the rest of your monthly plan.";

      return {
        id: subscription.id,
        name: subscription.name,
        action,
        reason,
        monthly_impact: Number(monthlyImpact.toFixed(2)),
      };
    })
    .sort((left, right) => {
      const order = { cancel: 0, review: 1, keep: 2 };
      return order[left.action] - order[right.action] || right.monthly_impact - left.monthly_impact;
    })
    .slice(0, 4);

  const flaggedCount = recommendations.filter((item) => item.action !== "keep").length;
  const status: SubscriptionReview["status"] =
    flaggedCount === 0 ? "clear" : flaggedCount >= 2 ? "trim" : "review";
  const summary =
    activeSubscriptions.length === 0
      ? "No active subscriptions are being tracked yet."
      : status === "clear"
        ? `Your ${activeSubscriptions.length} tracked subscription${activeSubscriptions.length === 1 ? "" : "s"} fit the rest of your monthly cash picture for now.`
        : status === "trim"
          ? `Recurring costs are putting noticeable pressure on monthly cash flow. Review the highlighted subscriptions first.`
          : `A few recurring costs are large enough to deserve a deliberate review before they become invisible habits.`;

  return {
    status,
    active_count: activeSubscriptions.length,
    monthly_total: Number(dashboardSummary.monthly_subscription_total.toFixed(2)),
    flagged_count: flaggedCount,
    summary,
    recommendations,
  } satisfies SubscriptionReview;
}

export function buildAffordabilityResult(input: {
  amount: number;
  category?: string | null;
  cadence?: "one_time" | "monthly";
  dashboardSummary: DashboardSummary;
  forecast: ForecastResult | null;
  budgetStatuses: BudgetStatus[];
  spendingEvents: FinanceSpendingEvent[];
}) {
  const amount = Math.max(parseNumber(input.amount), 0);
  const cadence = input.cadence === "monthly" ? "monthly" : "one_time";
  const forecast =
    input.forecast ?? buildForecastResult(input.dashboardSummary, input.spendingEvents);
  const category = input.category ? normalizeCategory(input.category) : null;
  const budgetStatus = category
    ? input.budgetStatuses.find((status) => status.category === category)
    : null;
  const monthlyBurden = cadence === "monthly" ? amount : 0;
  const projectedFreeCash =
    forecast.projected_free_cash - monthlyBurden - (cadence === "one_time" ? amount : 0);
  const suggestedLimit = Math.max(
    0,
    Number(
      (
        category && budgetStatus
          ? Math.min(budgetStatus.remaining_amount, Math.max(forecast.projected_free_cash, 0))
          : Math.max(forecast.projected_free_cash * 0.35, 0)
      ).toFixed(2),
    ),
  );

  let status: AffordabilityResult["status"] = "needs_more_data";
  if (input.spendingEvents.length >= 2) {
    if (projectedFreeCash >= 150 && (!budgetStatus || budgetStatus.status === "healthy")) {
      status = "comfortable";
    } else if (projectedFreeCash >= 0) {
      status = "tight";
    } else {
      status = "not_now";
    }
  }

  const summary =
    status === "needs_more_data"
      ? "eva needs a little more real spending history before it can answer confidently. Log a few more expenses first."
      : status === "comfortable"
        ? `Yes, this looks manageable right now. After accounting for your current forecast, you would still have about $${projectedFreeCash.toFixed(2)} of room left.`
        : status === "tight"
          ? `You can probably afford this, but it would leave only about $${projectedFreeCash.toFixed(2)} of cushion based on the current forecast.`
          : `Not comfortably right now. Based on the current forecast, this would push you about $${Math.abs(projectedFreeCash).toFixed(2)} past your safe monthly buffer.`;

  return {
    amount,
    category,
    cadence,
    projected_free_cash: Number(projectedFreeCash.toFixed(2)),
    health_score: input.dashboardSummary.health_score,
    status,
    suggested_limit: suggestedLimit,
    summary,
  } satisfies AffordabilityResult;
}

export function buildAdvice(
  dashboardSummary: DashboardSummary,
  spendingEvents: FinanceSpendingEvent[],
  budgetStatuses: BudgetStatus[],
  goalStatuses: GoalStatus[],
  subscriptions: FinanceSubscription[],
) {
  const advice: AdviceResult[] = [];
  const latestEvent = spendingEvents[0];

  if (latestEvent) {
    const itemCount = Array.isArray(latestEvent.items) ? latestEvent.items.length : 0;
    advice.push({
      id: "latest-spending",
      type: "spending_acknowledgement",
      tone: "info",
      title: "Your latest spending is already in the workspace",
      body: `eva logged ${itemCount} item${itemCount === 1 ? "" : "s"} worth $${parseNumber(latestEvent.total).toFixed(2)} on ${latestEvent.date}. That same record now powers your dashboard, summaries, and history.`,
      cta_label: "Review spending history",
      cta_href: "/spending-history",
    });
  } else {
    advice.push({
      id: "log-first-expense",
      type: "grounded_advice",
      tone: "info",
      title: "Start the loop by logging a real expense",
      body: "The fastest way to unlock grounded advice is to log one real purchase today. Once you do, eva will reflect it across history, summaries, and your dashboard.",
      cta_label: "Log an expense",
      cta_href: "/chat",
    });
  }

  const budgetAlert = budgetStatuses.find(
    (status) => status.status === "over" || status.status === "watch",
  );
  if (budgetAlert) {
    advice.push({
      id: "budget-alert",
      type: "budget_warning",
      tone: "warning",
      title:
        budgetAlert.status === "over"
          ? `${budgetAlert.category} is already over budget`
          : `${budgetAlert.category} is nearing its limit`,
      body:
        budgetAlert.status === "over"
          ? `You have spent $${budgetAlert.spent_this_month.toFixed(2)} against a $${budgetAlert.monthly_limit.toFixed(2)} limit this month. Tightening this category now will protect the rest of the month.`
          : `You have used ${budgetAlert.percent_used}% of your ${budgetAlert.category} budget this month. One or two more discretionary purchases could push it over.`,
      cta_label: "Review budgets",
      cta_href: "/budget",
    });
  } else if (dashboardSummary.monthly_cashflow < 0) {
    advice.push({
      id: "cashflow-reset",
      type: "grounded_advice",
      tone: "warning",
      title: "Your monthly plan needs breathing room",
      body: `Based on your current profile and recurring costs, you are about $${Math.abs(dashboardSummary.monthly_cashflow).toFixed(2)} below break-even each month. Use budgets and subscriptions to create a buffer before adding new goals.`,
      cta_label: "Review subscriptions",
      cta_href: "/subscriptions",
    });
  } else {
    advice.push({
      id: "cashflow-room",
      type: "grounded_advice",
      tone: "success",
      title: "You still have room to direct intentionally",
      body: `Your current monthly plan leaves about $${dashboardSummary.monthly_cashflow.toFixed(2)} after fixed costs and subscriptions. Direct that margin toward a goal before it disappears into reactive spending.`,
      cta_label: "Open goals",
      cta_href: "/goals",
    });
  }

  const goalStatus = goalStatuses.find((goal) => goal.status !== "achieved");
  if (goalStatus) {
    advice.push({
      id: "goal-progress",
      type: "goal_progress_nudge",
      tone: goalStatus.status === "on_track" ? "success" : "warning",
      title:
        goalStatus.status === "on_track"
          ? `${goalStatus.name} is still within reach`
          : `${goalStatus.name} needs a stronger monthly contribution`,
      body:
        goalStatus.status === "on_track"
          ? `You are ${goalStatus.progress_percent}% of the way there. Keeping about $${goalStatus.monthly_contribution_needed.toFixed(2)} per month pointed at this goal should keep the deadline realistic.`
          : `At the current pace, this goal needs about $${goalStatus.monthly_contribution_needed.toFixed(2)} per month. Either increase the contribution or extend the timeline so the plan stays honest.`,
      cta_label: "Review goals",
      cta_href: "/goals",
    });
  }

  if (subscriptions.length > 0 && advice.length < 4) {
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.is_active);
    advice.push({
      id: "subscription-visibility",
      type: "grounded_advice",
      tone: "info",
      title: "Recurring costs are now part of the picture",
      body: `eva is tracking ${activeSubscriptions.length} active subscription${activeSubscriptions.length === 1 ? "" : "s"}, so your monthly cash flow is grounded in more than one-off spending alone.`,
      cta_label: "Open subscriptions",
      cta_href: "/subscriptions",
    });
  }

  return advice.slice(0, 4);
}
