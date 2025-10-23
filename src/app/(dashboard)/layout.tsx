import { Sidebar } from '@/components/sidebar/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="flex-1 ml-60 bg-slate-950 min-h-screen p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
