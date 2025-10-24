import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthInitializer } from '@/providers/AuthInitializer';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Initiative Forge',
  description: 'D&D 5e Combat Tracker and Campaign Manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <AuthInitializer>
              {children}
              <Toaster />
            </AuthInitializer>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
