import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:eva_app/providers/public_user_provider.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final publicUser = ref.watch(publicUserProvider);

    if (publicUser.loading || publicUser.bootstrap == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final goals = publicUser.bootstrap!.goals;
    final currencyFormat = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Goals'),
        backgroundColor: const Color(0xFFF3A21C),
      ),
      body: goals.isEmpty
          ? const Center(
              child: Text('No goals set yet'),
            )
          : ListView.builder(
              itemCount: goals.length,
              itemBuilder: (context, index) {
                final goal = goals[index];
                final progress = goal.currentAmount / goal.targetAmount;
                final daysLeft = DateTime.parse(goal.deadline).difference(DateTime.now()).inDays;

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              goal.icon,
                              style: const TextStyle(fontSize: 24),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                goal.name,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${currencyFormat.format(goal.currentAmount)} / ${currencyFormat.format(goal.targetAmount)}',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: progress.clamp(0.0, 1.0),
                          backgroundColor: Colors.grey[300],
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            Color(0xFFF3A21C),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${(progress * 100).round()}% complete',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        if (daysLeft > 0) ...[
                          const SizedBox(height: 4),
                          Text(
                            '$daysLeft days left',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new goal
        },
        backgroundColor: const Color(0xFFF3A21C),
        child: const Icon(Icons.add),
      ),
    );
  }
}
