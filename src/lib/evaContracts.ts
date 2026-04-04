export type UserType = "personal" | "business";
export type FinancialEntryType = "asset" | "liability";

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface UserProfile {
  user_id: string;
  legacy_public_user_id: string | null;
  first_name: string;
  last_name: string;
  country: string;
  user_type: UserType;
  updates_opt_in: boolean;
  cash_balance: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  budgeting_focus: string;
  intent_focus: string;
  biggest_problem: string;
  money_style: string;
  guidance_style: string;
  goal_focus: string;
  subscription_awareness: string;
  target_monthly_savings: number;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetLimit {
  id: string;
  user_id?: string;
  category: string;
  monthly_limit: number;
  created_at?: string;
  updated_at?: string;
}

export interface SpendingEventItem {
  category: string;
  amount: number;
  description: string;
}

export interface SpendingEvent {
  id: string;
  user_id?: string;
  date: string;
  items: SpendingEventItem[];
  raw_input: string;
  total: number;
  source: string;
  created_at?: string;
}

export interface FinancialEntry {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  entry_type: FinancialEntryType;
  value: number;
  cashflow: number;
  balance: number;
  payment: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardSummary {
  cash_balance: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  monthly_subscription_total: number;
  monthly_cashflow: number;
  savings_rate: number;
  health_score: number;
  spending_this_month: number;
  latest_spending_date: string | null;
}

export interface EmptyFlags {
  has_spending_history: boolean;
  has_goals: boolean;
  has_budget_limits: boolean;
  has_subscriptions: boolean;
  has_balance_sheet: boolean;
}

export interface MigrationState {
  legacy_public_user_id: string | null;
  migrated_from_public: boolean;
}

export interface BootstrapData {
  user_id: string;
  email: string | null;
  has_onboarded: boolean;
  migration: MigrationState;
  profile: UserProfile | null;
  goals: UserGoal[];
  budget_limits: BudgetLimit[];
  spending_events: SpendingEvent[];
  spending_logs: SpendingEvent[];
  financial_entries: FinancialEntry[];
  subscriptions: Subscription[];
  dashboard_summary: DashboardSummary;
  empty_flags: EmptyFlags;
}

export interface OnboardingPayload {
  profile: {
    first_name: string;
    last_name: string;
    country: string;
    user_type: UserType;
    updates_opt_in: boolean;
    cash_balance: number;
    monthly_income: number;
    monthly_fixed_expenses: number;
    budgeting_focus: string;
    intent_focus: string;
    biggest_problem: string;
    money_style: string;
    guidance_style: string;
    goal_focus: string;
    subscription_awareness: string;
    target_monthly_savings: number;
  };
  goals: Array<{
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    icon: string;
  }>;
  budget_limits: Array<{
    category: string;
    monthly_limit: number;
  }>;
  financial_entries: Array<{
    name: string;
    type: string;
    entry_type: FinancialEntryType;
    value: number;
    cashflow: number;
    balance: number;
    payment: number;
    description?: string | null;
  }>;
  subscriptions: Array<{
    name: string;
    price: number;
    billing_cycle: "monthly" | "yearly";
    category: string;
    is_active: boolean;
  }>;
}

export interface AgentTask {
  id: string;
  user_id: string;
  task_type: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  reason: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  trace_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionIntent {
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

export interface ApprovalRequest {
  id: string;
  user_id: string;
  action_type: string;
  risk_class: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "expired";
  title: string;
  description: string;
  request_payload: Record<string, unknown>;
  execution_intent: ExecutionIntent | Record<string, unknown>;
  expires_at: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolResult<TData = Record<string, unknown>> {
  ok: boolean;
  tool: string;
  data: TData;
  message?: string;
}
