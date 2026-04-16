import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:eva_app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: ".env");

  await Supabase.initialize(
    url: dotenv.env['VITE_SUPABASE_URL'] ?? '',
    anonKey: dotenv.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ?? '',
  );

  runApp(
    const ProviderScope(
      child: EvaApp(),
    ),
  );
}


