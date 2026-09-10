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
  // settings.json から読み込むか、直接画像にあるIDを指定
  const GTM_ID = settings.gtmId || 'GTM-WCW3FWWM';

  return (
    <html lang="ja">
      <head>
        {/* ▼▼▼ 追加：Google AdSense のタグ ▼▼▼ */}
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8323476567735522"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* 1. <head> 用のGTMコード（Next.jsのScriptコンポーネントを使用） */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>

      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        
        {/* 2. <body> 直下のGTMコード（style属性をReact用に変換） */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

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
