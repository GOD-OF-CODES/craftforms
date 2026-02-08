'use client'

import Link from 'next/link'
import Button from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">CraftForms</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Sign up free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-text-primary mb-6">
            Create beautiful forms that people enjoy filling
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Build engaging surveys, quizzes, and forms with our intuitive drag-and-drop builder.
            Get more responses with a better experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Get started - it&apos;s free
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="secondary" size="lg">
                View templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
            Everything you need to collect data
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Drag & Drop Builder"
              description="Create forms in minutes with our intuitive visual editor. No coding required."
              icon="🎨"
            />
            <FeatureCard
              title="Smart Logic"
              description="Show or hide questions based on previous answers. Create personalized experiences."
              icon="🧠"
            />
            <FeatureCard
              title="Real-time Analytics"
              description="Track responses, completion rates, and insights with powerful analytics."
              icon="📊"
            />
            <FeatureCard
              title="Custom Themes"
              description="Match your brand with customizable colors, fonts, and backgrounds."
              icon="🎯"
            />
            <FeatureCard
              title="Integrations"
              description="Connect with your favorite tools via webhooks and native integrations."
              icon="🔗"
            />
            <FeatureCard
              title="Team Collaboration"
              description="Work together with your team on forms and share access easily."
              icon="👥"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to create better forms?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join thousands of teams already using CraftForms to collect responses.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg">
              Start for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <span className="text-text-secondary">
              &copy; {new Date().getFullYear()} CraftForms. All rights reserved.
            </span>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-text-secondary hover:text-text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-text-secondary hover:text-text-primary">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-background p-6 rounded-lg border border-border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}
