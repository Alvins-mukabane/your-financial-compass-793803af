import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <Link to="/signup" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to sign up
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Last updated: March 22, 2026</p>
        <h2 className="text-foreground text-lg font-medium">1. Information We Collect</h2>
        <p>We collect personal information you provide during registration, including your name, email address, and country. We also collect usage data to improve our services.</p>
        <h2 className="text-foreground text-lg font-medium">2. How We Use Your Information</h2>
        <p>Your data is used to provide personalized financial insights, improve our AI models, and communicate service updates (if opted in).</p>
        <h2 className="text-foreground text-lg font-medium">3. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
        <h2 className="text-foreground text-lg font-medium">4. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting our support team.</p>
      </div>
    </div>
  );
}
