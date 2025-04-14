import ProtectedRoute from "@/components/protected-route"

export default function ProjectLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
