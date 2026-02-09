import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-text-primary mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-text-secondary">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p>When you use CraftForms, we collect information you provide directly, such as your name, email address, and any data you enter into forms you create or respond to. We also collect usage data like browser type, pages visited, and interaction patterns to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to provide and maintain our service, send you updates and notifications you have opted into, analyze usage to improve CraftForms, and ensure the security of our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Form responses are stored in our database and are accessible only to the form creator and authorized team members. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time. You can export your form data or request complete account deletion by contacting our support team.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Cookies</h2>
            <p>We use essential cookies to keep you signed in and maintain your session. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Contact</h2>
            <p>If you have questions about this privacy policy, please reach out to us at privacy@craftforms.io.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
