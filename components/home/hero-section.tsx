'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Zap, Shield, TrendingUp } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 sm:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Zap className="h-4 w-4" />
            <span>100% DSGVO-Compliant | Self-Hosted | EU-Server</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your Local{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Business Jarvis
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            The AI-Agent-First CRM & Workflow Automation Platform.
            <br />
            <strong>100 Pre-Built Workflows</strong> ready to deploy. Powered by
            Claude, GPT, and your local AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-4 text-base font-medium shadow-sm transition-all hover:bg-accent"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">100</div>
              <div className="text-sm text-muted-foreground">Workflows</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">6</div>
              <div className="text-sm text-muted-foreground">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">90%+</div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">DSGVO</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Autonomous AI Agents</h3>
            <p className="text-sm text-muted-foreground">
              Research, Sales, Communication, and more agents working together
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">DSGVO-Compliant</h3>
            <p className="text-sm text-muted-foreground">
              All data on EU servers. Full control. Zero vendor lock-in
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">3.8x Higher Margin</h3>
            <p className="text-sm text-muted-foreground">
              $22,740/year more profit vs GoHighLevel at 50 clients
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
