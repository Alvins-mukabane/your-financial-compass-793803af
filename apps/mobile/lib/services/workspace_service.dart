import 'package:eva_app/models/bootstrap_data.dart';
import 'package:eva_app/services/edge_functions_service.dart';

class WorkspaceService {
  static Future<BootstrapData> fetchBootstrap() async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'bootstrap',
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> completeOnboarding(Map<String, dynamic> payload) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'complete_onboarding',
      ...payload,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> saveGoal(Map<String, dynamic> goal) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'save_goal',
      'goal': goal,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> deleteGoal(String goalId) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'delete_goal',
      'goal_id': goalId,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> saveBudgetLimit(Map<String, dynamic> limit) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'save_budget_limit',
      'budget_limit': limit,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> deleteBudgetLimit(String limitId) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'delete_budget_limit',
      'budget_limit_id': limitId,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> saveSubscription(Map<String, dynamic> subscription) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'save_subscription',
      'subscription': subscription,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> deleteSubscription(String subscriptionId) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'delete_subscription',
      'subscription_id': subscriptionId,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> saveFinancialEntry(Map<String, dynamic> entry) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'save_financial_entry',
      'financial_entry': entry,
    });
    return BootstrapData.fromJson(response);
  }

  static Future<BootstrapData> deleteFinancialEntry(String entryId) async {
    final response = await EdgeFunctionsService.invoke('finance-core', {
      'action': 'delete_financial_entry',
      'financial_entry_id': entryId,
    });
    return BootstrapData.fromJson(response);
  }
}
