export default function PaymentField() {
  return (
    <div className="p-6 border border-border rounded-lg bg-surface text-center">
      <svg className="w-12 h-12 mx-auto text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <p className="text-text-primary font-medium mb-1">Payment Collection</p>
      <p className="text-sm text-text-secondary">
        Payment integration coming soon. Connect with Stripe to collect payments.
      </p>
    </div>
  )
}
