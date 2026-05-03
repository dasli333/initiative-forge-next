import { Sidebar } from '@/components/sidebar/Sidebar';
import { MobileTopBar } from '@/components/sidebar/MobileTopBar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen">
        <Sidebar />
        <MobileTopBar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 md:ml-60 bg-slate-950 min-h-screen p-4 md:p-8 overflow-auto"
        >
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
