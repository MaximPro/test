'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Build Your Business Jarvis?
          </h2>
          <p className="mb-10 text-lg opacity-90">
            Join agencies already using SuperSynergy to automate their business
            and increase profit margins. Setup takes less than 30 minutes.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground shadow-lg transition-all hover:bg-background/90 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 bg-transparent px-8 py-4 text-base font-medium transition-all hover:bg-primary-foreground/10"
            >
              Read Documentation
            </Link>
          </div>
          <div className="mt-8 text-sm opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}
