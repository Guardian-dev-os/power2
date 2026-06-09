import { Navigate } from 'react-router-dom'

// Legacy redirect — auth page renamed to /sign-in
export default function AuthPage() {
  return <Navigate to="/sign-in" replace />
}
