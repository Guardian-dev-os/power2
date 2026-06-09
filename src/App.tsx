import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useOfflineDetector } from '@/hooks/use-offline'
import { Toaster } from '@/components/ui/sonner'
import { reportLovableError } from '@/lib/lovable-error-reporting'
import { useEffect } from 'react'

// Layouts
import RootLayout from '@/layouts/RootLayout'

// Pages - imported from routes
import Landing from '@/routes/index'
import SignInPage from '@/routes/sign-in'
import RequestAccessPage from '@/routes/request-access'
import Dashboard from '@/routes/dashboard'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthPage from '@/routes/auth'
import AdminSetup from '@/routes/admin-setup'
import AdminDashboard from '@/routes/admin'
import ReviseSet from '@/routes/revise.$setId'
import ExamMode from '@/routes/exam-mode'
import Bookmarks from '@/routes/bookmarks'
import Notes from '@/routes/notes'
import Search from '@/routes/search'
import Profile from '@/routes/profile'
import Support from '@/routes/support'
import Offline from '@/routes/offline'
import NotFound from '@/pages/NotFound'
import ErrorBoundary from '@/pages/ErrorBoundary'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

export default function App() {
  useOfflineDetector()

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Landing />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/request-access" element={<RequestAccessPage />} />
          <Route path="/support" element={<Support />} />
          <Route path="/offline" element={<Offline />} />

          {/* Auth routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Admin setup */}
          <Route path="/admin-setup" element={<AdminSetup />} />

          {/* Private routes - Dashboard and study */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/revise/:setId" element={<ReviseSet />} />
            <Route path="/exam-mode" element={<ExamMode />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin dashboard - protected */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Route>

        {/* 404 - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global UI */}
      <Toaster richColors theme="dark" />
    </>
  )
}
