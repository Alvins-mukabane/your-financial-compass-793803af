import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Brain, Shield, Target, ArrowRight, Sparkles } from "lucide-react";
import FAQSection from "@/components/FAQSection";
import { landingFAQs } from "@/data/faqData";
import SEO, { generateFAQSchema, generateOrganizationSchema } from "@/components/SEO";
import evaLogo from "@/assets/eva-logo.png";

const features = [
  { icon: Brain, title: "AI-Powered Insights", desc: "Get personalized financial advice from your intelligent advisor, 24/7." },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Track spending patterns, predict balances, and optimize your finances." },
  { icon: Target, title: "Goal Planning", desc: "Set savings goals and get AI-generated strategies to reach them faster." },
  { icon: Shield, title: "Financial Health Score", desc: "Monitor your financial wellness with a real-time health score." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Landing() {
  const faqSchema = generateFAQSchema(landingFAQs.map(f => ({ question: f.question, answer: f.answer })));
  const orgSchema = generateOrganizationSchema();

  return (
    <>
      <SEO
        title="AI-Powered Financial Advisor — Understand · Plan · Grow"
        description="eva is an AI-powered financial advisor that analyzes your spending, predicts future balances, and provides personalized money advice. Track expenses, set goals, and improve your financial health with AI."
        schema={{ "@graph": [orgSchema, faqSchema] }}
        geo={{ region: "US", placename: "United States" }}
      />
      <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem]">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-56 w-56 rounded-full bg-[hsl(151_58%_36%/.08)] blur-3xl" />
      </div>
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 max-w-[1200px] mx-auto backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <img src={evaLogo} alt="eva" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-semibold text-foreground tracking-tight text-[15px]">eva</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/chat">
            <Button variant="ghost" size="sm">Try advisor</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="gap-1.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-border shadow-sm text-xs font-medium text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Finance by useaima
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-3xl mx-auto text-balance">
            Your money, guided with <span className="text-primary">clarity</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            eva brings the useaima experience into your finances with warm, confident guidance on spending, planning, and long-term decisions.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 px-8">
                Explore dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" size="lg" className="px-8">
                Ask the AI
              </Button>
            </Link>
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-border/80 bg-card/80 px-6 py-5 shadow-[0_30px_80px_-48px_rgba(50,38,32,0.45)] backdrop-blur">
            <div className="grid gap-4 text-left md:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Track</p>
                <p className="mt-2 text-sm font-semibold text-foreground">See where money actually goes</p>
                <p className="mt-1 text-sm text-muted-foreground">Log spending naturally and keep every decision grounded in clear category trends.</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Plan</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Look ahead with confidence</p>
                <p className="mt-1 text-sm text-muted-foreground">Get balance forecasts, savings targets, and budget signals before surprises hit.</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Grow</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Turn habits into momentum</p>
                <p className="mt-1 text-sm text-muted-foreground">Use AI guidance to tighten routines, improve your score, and build long-term stability.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card/85 border border-border rounded-[1.25rem] p-6 space-y-3 shadow-[0_20px_50px_-40px_rgba(50,38,32,0.5)] hover:border-primary/30 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 pb-24 max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Everything you need to know about eva</p>
          <FAQSection faqs={landingFAQs} />
        </motion.div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 eva. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
