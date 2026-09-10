import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', alignItems: 'center' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* ヘッダー用の小型ロゴ (SVG) */}
        <svg width="28" height="28" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, 4)">
            <path d="M 8 16 Q 8 8 16 8 L 16 16 L 12 16 Q 12 24 8 28 Z" fill="#ea580c" />
            <path d="M 22 16 Q 22 8 30 8 L 30 16 L 26 16 Q 26 24 22 28 Z" fill="#ea580c" />
            <path d="M 34 4 Q 36 10 42 12 Q 36 14 34 20 Q 32 14 26 12 Q 32 10 34 4 Z" fill="#f59e0b" />
          </g>
        </svg>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>BizPioneer</span>
      </Link>
    </header>
  );
}
