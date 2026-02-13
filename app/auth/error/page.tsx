import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage({ searchParams }: { searchParams: { message?: string } }) {
  const message = searchParams.message || 'An authentication error occurred'

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Authentication Error</h1>
          <p className="text-center text-muted-foreground mb-6">{message}</p>

          <div className="space-y-3">
            <Link href="/" className="block w-full">
              <Button size="lg" className="w-full rounded-xl">
                Back to Home
              </Button>
            </Link>
            <Link href="/" className="block w-full">
              <Button size="lg" variant="outline" className="w-full rounded-xl">
                Try Again
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            If the problem persists, please try again later or contact support.
          </p>
        </div>
      </div>
    </main>
  )
}
