import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:eva_app/providers/public_user_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final publicUser = ref.watch(publicUserProvider);

    if (publicUser.loading || publicUser.bootstrap == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final summary = publicUser.bootstrap!.dashboardSummary;
    final currencyFormat = NumberFormat.currency(symbol: '\$');

    return RefreshIndicator(
      onRefresh: () => ref.read(publicUserProvider.notifier).refresh(),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 24),

            // Health Score
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      'Financial Health Score',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    CircularProgressIndicator(
                      value: summary.healthScore / 100,
                      backgroundColor: Colors.grey[300],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        summary.healthScore >= 70
                            ? Colors.green
                            : summary.healthScore >= 40
                                ? Colors.orange
                                : Colors.red,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${summary.healthScore.round()}%',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Key Metrics
            Row(
              children: [
                Expanded(
                  child: _MetricCard(
                    title: 'Cash Balance',
                    value: currencyFormat.format(summary.cashBalance),
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MetricCard(
                    title: 'Net Worth',
                    value: currencyFormat.format(summary.netWorth),
                    color: Colors.blue,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            Row(
              children: [
                Expanded(
                  child: _MetricCard(
                    title: 'Monthly Income',
                    value: currencyFormat.format(summary.monthlyIncome),
                    color: Colors.purple,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MetricCard(
                    title: 'Monthly Expenses',
                    value: currencyFormat.format(summary.monthlyFixedExpenses),
                    color: Colors.red,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Recent Activity
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),

            if (publicUser.bootstrap!.spendingLogs.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No recent spending activity'),
                ),
              )
            else
              ...publicUser.bootstrap!.spendingLogs.take(3).map(
                    (log) => Card(
                      child: ListTile(
                        title: Text(log.rawInput),
                        subtitle: Text(
                          DateFormat.yMMMd().format(DateTime.parse(log.date)),
                        ),
                        trailing: Text(
                          currencyFormat.format(log.total),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFF3A21C),
                          ),
                        ),
                      ),
                    ),
                  ),

            const SizedBox(height: 16),

            // Advice
            if (publicUser.bootstrap!.advice.isNotEmpty) ...[
              Text(
                'AI Advice',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              ...publicUser.bootstrap!.advice.map(
                (advice) => Card(
                  color: _getAdviceColor(advice.tone.toString()),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          advice.title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(advice.body),
                        if (advice.ctaLabel != null) ...[
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: () {
                              // Handle CTA action
                            },
                            child: Text(advice.ctaLabel!),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getAdviceColor(String tone) {
    switch (tone) {
      case 'success':
        return Colors.green[50]!;
      case 'warning':
        return Colors.orange[50]!;
      case 'info':
      default:
        return Colors.blue[50]!;
    }
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
