import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthInitializer } from '@/providers/AuthInitializer';
import { NavigationProgressProvider } from '@/providers/NavigationProgressProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { NetworkProgressBar } from '@/components/shared/NetworkProgressBar';
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
            <NavigationProgressProvider>
              <NetworkProgressBar />
              <AuthInitializer>
                {children}
                <Toaster />
              </AuthInitializer>
            </NavigationProgressProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
