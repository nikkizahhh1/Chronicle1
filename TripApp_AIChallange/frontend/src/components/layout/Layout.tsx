import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function Layout({ children, showHeader = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-primary-cream">
      {showHeader && (
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary-green">TripCraft</h1>
          </div>
        </header>
      )}
      <main className="pb-safe">
        {children}
      </main>
    </div>
  );
}
