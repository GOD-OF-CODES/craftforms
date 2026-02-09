import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              CraftForms
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-text-primary mb-8">Terms of Service</h1>

        <div className="space-y-6 text-text-secondary">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using CraftForms, you agree to be bound by these terms of service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Use of Service</h2>
            <p>CraftForms provides tools to create, distribute, and analyze forms and surveys. You may use the service for lawful purposes only. You are responsible for all content you create and all data you collect through your forms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Content Ownership</h2>
            <p>You retain ownership of all forms and data you create on CraftForms. We do not claim any intellectual property rights over your content. You grant us a limited license to host and display your content as necessary to provide the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Prohibited Uses</h2>
            <p>You may not use CraftForms to collect sensitive information without proper consent, distribute spam or malicious content, attempt to gain unauthorized access to our systems, or violate any applicable laws or regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Termination</h2>
            <p>We may suspend or terminate your access to CraftForms if you violate these terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Limitation of Liability</h2>
            <p>CraftForms is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">8. Contact</h2>
            <p>If you have questions about these terms, please reach out to us at legal@craftforms.io.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
