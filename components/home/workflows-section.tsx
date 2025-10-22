'use client'

export function WorkflowsSection() {
  const categories = [
    { name: 'Email Marketing', count: 15, icon: '📧' },
    { name: 'Sales Automation', count: 20, icon: '🤝' },
    { name: 'Customer Support', count: 12, icon: '💬' },
    { name: 'Analytics & Reporting', count: 10, icon: '📊' },
    { name: 'Integrations', count: 15, icon: '🔗' },
    { name: 'Lead Generation', count: 10, icon: '🎯' },
    { name: 'Social Media', count: 8, icon: '📱' },
    { name: 'Operations', count: 10, icon: '🛠️' },
  ]

  return (
    <section className="bg-muted py-20 sm:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            100 Pre-Built Workflows
          </h2>
          <p className="text-lg text-muted-foreground">
            Ready to deploy. Fully customizable. Battle-tested by agencies.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-lg border bg-background p-6 text-center transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-4xl">{category.icon}</div>
              <h3 className="mb-1 font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.count} workflows
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            + More workflows added every week
          </p>
        </div>
      </div>
    </section>
  )
}
