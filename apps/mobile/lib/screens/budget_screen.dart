import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:eva_app/providers/public_user_provider.dart';

class BudgetScreen extends ConsumerWidget {
  const BudgetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final publicUser = ref.watch(publicUserProvider);

    if (publicUser.loading || publicUser.bootstrap == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final budgetStatuses = publicUser.bootstrap!.budgetStatuses;
    final currencyFormat = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budget Limits'),
        backgroundColor: const Color(0xFFF3A21C),
      ),
      body: budgetStatuses.isEmpty
          ? const Center(
              child: Text('No budget limits set'),
            )
          : ListView.builder(
              itemCount: budgetStatuses.length,
              itemBuilder: (context, index) {
                final status = budgetStatuses[index];
                final progress = status.spentThisMonth / status.monthlyLimit;

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          status.category,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${currencyFormat.format(status.spentThisMonth)} / ${currencyFormat.format(status.monthlyLimit)}',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: progress.clamp(0.0, 1.0),
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getBudgetColor(status.status.toString()),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${(status.percentUsed).round()}% used',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Text(
                              '${currencyFormat.format(status.remainingAmount)} left',
                              style: TextStyle(
                                color: _getBudgetColor(status.status.toString()),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new budget limit
        },
        backgroundColor: const Color(0xFFF3A21C),
        child: const Icon(Icons.add),
      ),
    );
  }

  Color _getBudgetColor(String status) {
    switch (status) {
      case 'healthy':
        return Colors.green;
      case 'watch':
        return Colors.orange;
      case 'over':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
