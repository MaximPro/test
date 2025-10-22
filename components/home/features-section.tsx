'use client'

export function FeaturesSection() {
  const features = [
    {
      title: 'Research Agent',
      description: 'Web scraping, data enrichment, competitive intelligence, lead scoring',
      icon: '🔍',
    },
    {
      title: 'Sales Agent',
      description: 'BANT qualification, discovery calls, proposal generation, deal forecasting',
      icon: '💼',
    },
    {
      title: 'Communication Agent',
      description: 'Email personalization, smart follow-ups, sentiment analysis, multi-language',
      icon: '💬',
    },
    {
      title: 'Automation Agent',
      description: 'Self-learning workflows, intelligent routing, cross-system sync',
      icon: '⚡',
    },
    {
      title: 'Analytics Agent',
      description: 'Automated reports, predictive analytics, KPI tracking, natural language queries',
      icon: '📊',
    },
    {
      title: 'Customer Success Agent',
      description: 'Onboarding automation, health monitoring, proactive support, renewal prediction',
      icon: '🎯',
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            6 Autonomous AI Agents
          </h2>
          <p className="text-lg text-muted-foreground">
            Each agent is powered by Claude Sonnet 4, GPT-4, or your local LLM.
            They work together to automate your entire business.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
