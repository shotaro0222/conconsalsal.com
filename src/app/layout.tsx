// src/app/layout.tsx
import Script from 'next/script';
import settings from '../data/settings.json';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'BizPioneer',
  description: '先人たちの知恵を、あなたのビジネスの推進力に。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GTM_ID = settings.gtmId;

  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        <Header />
        <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '40px', padding: '0 20px', alignItems: 'flex-start' }}>
          
          <main style={{ flex: 1, backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {children}
          </main>
          <Sidebar />
          
        </div>
        <footer style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
          © {new Date().getFullYear()} BizPioneer. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
