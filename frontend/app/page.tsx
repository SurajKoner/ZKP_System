"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Activity, Database, Lock, Smartphone, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans">
      <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-neutral-950 border-b relative z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">MediGuard</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/hospital" className="text-sm font-medium hover:text-primary transition-colors">Hospital Portal</Link>
          <Link href="/wallet" className="text-sm font-medium hover:text-primary transition-colors">Patient Wallet</Link>
          <Link href="/provider/apollo-pharmacy" className="text-sm font-medium hover:text-primary transition-colors">Provider Portal</Link>
          <Link href="/benchmarks" className="text-sm font-medium hover:text-primary transition-colors">Benchmarks</Link>
        </nav>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link href="/demo">Live Demo</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
            <Link href="/wallet">Get Wallet</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{ zIndex: -1 }}></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in-up">
            <Activity className="w-4 h-4" />
            <span>Protecting Patient Privacy in India</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 leading-tight">
            Verify Health. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Protect Privacy.</span>
          </h1>

          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mb-10 leading-relaxed">
            MediGuard is a zero-knowledge proof credential system that allows patients to prove medical eligibility without revealing sensitive health data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 w-full sm:w-auto">
              <Link href="/wallet">
                Launch Patient Wallet
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-2 w-full sm:w-auto">
              <Link href="/hospital">
                Hospital Portal
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg border-2 w-full sm:w-auto">
              <Link href="/provider/apollo-pharmacy">
                Provider Portal
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-white dark:bg-neutral-950">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Unlinkable Verification</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Every verification generates a unique proof. Pharmacies and insurers cannot track your activity across different providers.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Selective Disclosure</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Prove you are vaccinated without revealing the manufacturer, date, or hospital. Share only what is strictly necessary.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Offline-First PWA</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Works on any smartphone. Credentials act like digital cards in your pocket, accessible even without internet.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Footer */}
        <footer className="py-12 px-6 border-t bg-neutral-50 dark:bg-neutral-900 text-center">
          <div className="flex justify-center gap-8 mb-6 text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> BBS+ Signatures</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Zero-Knowledge Proofs</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Privacy-Preserving</span>
          </div>
          <p className="text-neutral-500 text-sm">
            Built for India&apos;s Healthcare Infrastructure • Powered by Advanced Cryptography
          </p>
        </footer>
      </main>
    </div >
  );
}
