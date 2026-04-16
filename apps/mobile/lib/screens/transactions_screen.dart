import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:eva_app/providers/public_user_provider.dart';

class TransactionsScreen extends ConsumerWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final publicUser = ref.watch(publicUserProvider);

    if (publicUser.loading || publicUser.bootstrap == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final logs = publicUser.bootstrap!.spendingLogs;
    final currencyFormat = NumberFormat.currency(symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        backgroundColor: const Color(0xFFF3A21C),
      ),
      body: logs.isEmpty
          ? const Center(
              child: Text('No transactions yet'),
            )
          : ListView.builder(
              itemCount: logs.length,
              itemBuilder: (context, index) {
                final log = logs[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
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
                    onTap: () {
                      // Show transaction details
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text(log.rawInput),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Date: ${DateFormat.yMMMd().format(DateTime.parse(log.date))}'),
                              Text('Total: ${currencyFormat.format(log.total)}'),
                              const SizedBox(height: 16),
                              const Text('Items:'),
                              ...log.items.map((item) => Padding(
                                padding: const EdgeInsets.only(left: 16, top: 4),
                                child: Text('${item.category}: ${currencyFormat.format(item.amount)}'),
                              )),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: const Text('Close'),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new transaction
        },
        backgroundColor: const Color(0xFFF3A21C),
        child: const Icon(Icons.add),
      ),
    );
  }
}
