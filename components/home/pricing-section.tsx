'use client'

import { Check } from 'lucide-react'

export function PricingSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Self-Hosted = Maximum Profit
          </h2>
          <p className="text-lg text-muted-foreground">
            Compare the cost at 50 clients. The math speaks for itself.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {/* GoHighLevel */}
          <div className="rounded-lg border bg-card p-8">
            <h3 className="mb-2 text-xl font-semibold">GoHighLevel</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold">$1,294</div>
              <div className="text-sm text-muted-foreground">/month at 50 clients</div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>US-based servers</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>Basic workflows</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>Variable SMS/Voice costs</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>82.7% profit margin</span>
              </li>
            </ul>
            <div className="mt-6 text-sm font-medium text-muted-foreground">
              Annual Profit: $74,472
            </div>
          </div>

          {/* SuperSynergy */}
          <div className="relative rounded-lg border-2 border-primary bg-card p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
              Recommended
            </div>
            <h3 className="mb-2 text-xl font-semibold">SuperSynergy</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold">$899</div>
              <div className="text-sm text-muted-foreground">/month at 50 clients</div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>EU servers</strong> (DSGVO compliant)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>100 AI workflows</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>Flat-rate</strong> predictable costs</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span><strong>90%+ profit margin</strong></span>
              </li>
            </ul>
            <div className="mt-6 text-sm font-medium text-primary">
              Annual Profit: $97,212 (+$22,740/year)
            </div>
          </div>

          {/* HubSpot */}
          <div className="rounded-lg border bg-card p-8">
            <h3 className="mb-2 text-xl font-semibold">HubSpot</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold">$3,200+</div>
              <div className="text-sm text-muted-foreground">/month at 50 clients</div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>US-based SaaS</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>Limited customization</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>Per-seat pricing</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>~65% profit margin</span>
              </li>
            </ul>
            <div className="mt-6 text-sm font-medium text-muted-foreground">
              Annual Profit: ~$50,000
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
