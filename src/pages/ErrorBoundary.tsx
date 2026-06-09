import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { reportLovableError } from '@/lib/lovable-error-reporting'

interface Props {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    reportLovableError(error, { boundary: 'react_root_error' })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <Button onClick={reset} className="bg-brand-gradient">
            Try again
          </Button>
          <Button asChild variant="outline">
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
