import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:eva_app/providers/public_user_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Profile data
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _countryController = TextEditingController();
  final _phoneController = TextEditingController();
  String _userType = 'personal';
  final _cashBalanceController = TextEditingController();
  final _monthlyIncomeController = TextEditingController();
  final _monthlyExpensesController = TextEditingController();
  String _budgetingFocus = 'Build an emergency cushion';
  final String _intentFocus = 'Save more money';
  final String _biggestProblem = 'Living paycheck to paycheck';
  final String _moneyStyle = 'Saver';
  final String _guidanceStyle = 'Detailed guidance';
  final String _goalFocus = 'Emergency fund';
  final String _subscriptionAwareness = 'I have some subscriptions';
  final _targetSavingsController = TextEditingController();

  final List<String> _budgetingFocusOptions = [
    'Build an emergency cushion',
    'Reduce unnecessary spending',
    'Pay down debt',
    'Grow investments',
    'Stabilize business cash flow',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome to EVA'),
        automaticallyImplyLeading: false,
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _handleContinue,
        onStepCancel: _handleCancel,
        steps: _buildSteps(),
      ),
    );
  }

  List<Step> _buildSteps() {
    return [
      Step(
        title: const Text('Basic Information'),
        content: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'First Name'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              TextFormField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Last Name'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              TextFormField(
                controller: _countryController,
                decoration: const InputDecoration(labelText: 'Country'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              DropdownButtonFormField<String>(
                initialValue: _userType,
                decoration: const InputDecoration(labelText: 'Account Type'),
                items: const [
                  DropdownMenuItem(value: 'personal', child: Text('Personal')),
                  DropdownMenuItem(value: 'business', child: Text('Business')),
                ],
                onChanged: (value) => setState(() => _userType = value!),
              ),
            ],
          ),
        ),
        isActive: _currentStep >= 0,
      ),
      Step(
        title: const Text('Financial Overview'),
        content: Column(
          children: [
            TextFormField(
              controller: _cashBalanceController,
              decoration: const InputDecoration(labelText: 'Current Cash Balance'),
              keyboardType: TextInputType.number,
            ),
            TextFormField(
              controller: _monthlyIncomeController,
              decoration: const InputDecoration(labelText: 'Monthly Income'),
              keyboardType: TextInputType.number,
            ),
            TextFormField(
              controller: _monthlyExpensesController,
              decoration: const InputDecoration(labelText: 'Monthly Fixed Expenses'),
              keyboardType: TextInputType.number,
            ),
            DropdownButtonFormField<String>(
              initialValue: _budgetingFocus,
              decoration: const InputDecoration(labelText: 'Main Budgeting Focus'),
              items: _budgetingFocusOptions
                  .map((option) => DropdownMenuItem(
                        value: option,
                        child: Text(option),
                      ))
                  .toList(),
              onChanged: (value) => setState(() => _budgetingFocus = value!),
            ),
          ],
        ),
        isActive: _currentStep >= 1,
      ),
      Step(
        title: const Text('Goals & Preferences'),
        content: Column(
          children: [
            TextFormField(
              controller: _targetSavingsController,
              decoration: const InputDecoration(labelText: 'Target Monthly Savings'),
              keyboardType: TextInputType.number,
            ),
            // Add more preference fields as needed
          ],
        ),
        isActive: _currentStep >= 2,
      ),
    ];
  }

  void _handleContinue() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      _completeOnboarding();
    }
  }

  void _handleCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _completeOnboarding() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final payload = {
        'profile': {
          'first_name': _firstNameController.text,
          'last_name': _lastNameController.text,
          'country': _countryController.text,
          'phone_number': _phoneController.text,
          'user_type': _userType,
          'updates_opt_in': true,
          'password_setup_completed': true,
          'cash_balance': double.tryParse(_cashBalanceController.text) ?? 0,
          'monthly_income': double.tryParse(_monthlyIncomeController.text) ?? 0,
          'monthly_fixed_expenses': double.tryParse(_monthlyExpensesController.text) ?? 0,
          'budgeting_focus': _budgetingFocus,
          'intent_focus': _intentFocus,
          'biggest_problem': _biggestProblem,
          'money_style': _moneyStyle,
          'guidance_style': _guidanceStyle,
          'goal_focus': _goalFocus,
          'subscription_awareness': _subscriptionAwareness,
          'target_monthly_savings': double.tryParse(_targetSavingsController.text) ?? 0,
        },
        'goals': [],
        'budget_limits': [],
        'financial_entries': [],
        'subscriptions': [],
      };

      await ref.read(publicUserProvider.notifier).completeOnboarding(payload);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }
}
