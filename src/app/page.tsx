import Link from 'next/link';
import fs from 'fs';
import path from 'path';
// ★追加：InteractiveTool コンポーネントをインポート
import InteractiveTool from '../components/InteractiveTool';

// ★追加：BizPioneer用のデフォルト診断データ
const defaultDiagnosisData = {
  "title": "個人ビジネスの『戦略と生存確率』診断",
  "questions": [
    "現在の価格設定は、相場や競合ではなく「自分が提供する価値」を基準に決めている。",
    "売上の大部分が、特定の1社（または1人の顧客）に依存していない。",
    "自分のサービスの「誰にでもない、たった一人の理想の顧客」を即答できる。",
    "過去半年で、自分の軸や条件に合わない仕事を意図的に「断った」経験がある。",
    "1年後、自分の事業がどうなっていたいか、明確なビジョン（羅針盤）を持っている。"
  ],
  "resultHigh": "素晴らしい戦略とビジネスの軸を持っています！向かうべき方向は明確なので、あとは実務を自動化して加速させるだけです。効率化のヒントは <a href='https://reskill.bizpioneer.com' target='_blank' style='color:#2563eb; text-decoration:underline;'>Re:Skill Blog</a> で手に入れましょう。",
  "resultLow": "目の前の売上や作業に追われ、「戦略の羅針盤」を見失っている危険性があります。まずはBizPioneerの記事でビジネスモデルを見直しましょう。もし焦りや疲れを感じているなら、<a href='https://mindful.bizpioneer.com' target='_blank' style='color:#52796f; text-decoration:underline;'>Mindful Shutter</a> で一度心を整えるのも一つの手です。"
};

// ★生成されたMarkdownファイルを読み込む関数
async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs.readdirSync(postsDirectory);
  
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      let title = '無題の記事';
      const titleMatch = fileContents.match(/title:\s*["']?([^"'\n]+)["']?/);
      if (titleMatch) title = titleMatch[1];
      else {
        const h1Match = fileContents.match(/^#\s+(.*)/m);
        if (h1Match) title = h1Match[1];
      }

      // ★ 追加：カテゴリーを抽出する
      let category = '未分類';
      const categoryMatch = fileContents.match(/category:\s*["']?([^"'\n]+)["']?/);
      if (categoryMatch) {
        category = categoryMatch[1];
      }

      let excerpt = '記事の詳細を読む...';
      const bodyLines = fileContents.replace(/---[\s\S]*?---/, '').replace(/^#.*$/m, '').split('\n');
      const firstLine = bodyLines.find(line => line.trim().length > 0 && !line.startsWith('<'));
      if (firstLine) excerpt = firstLine.substring(0, 80) + '...';

      return { 
        slug: filename.replace('.md', ''), 
        title, 
        excerpt,
        category // ★ 追加：カテゴリーを返す
      };
    });

  return posts.sort((a, b) => (a.slug < b.slug ? 1 : -1));
}

export default async function Home() {
  const posts = await getPosts(); 

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 0 40px 0' }}>
      {/* メインビジュアル */}
      <section style={{ marginBottom: '40px', padding: '50px 20px', borderBottom: '4px solid #ea580c', textAlign: 'center', backgroundColor: '#fff' }}>
        
        {/* トップページ用の中央ロゴ (SVG: クォーテーションとひらめき) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="340" height="48" viewBox="0 0 340 48" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 4)">
              <path d="M 8 16 Q 8 8 16 8 L 16 16 L 12 16 Q 12 24 8 28 Z" fill="#ea580c" />
              <path d="M 22 16 Q 22 8 30 8 L 30 16 L 26 16 Q 26 24 22 28 Z" fill="#ea580c" />
              <path d="M 34 4 Q 36 10 42 12 Q 36 14 34 20 Q 32 14 26 12 Q 32 10 34 4 Z" fill="#f59e0b" />
            </g>
            <text x="56" y="32" fontFamily="sans-serif" fontSize="28" fontWeight="bold" fill="#0f172a">BizPioneer</text>
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '16px', lineHeight: '1.5', fontWeight: 'bold' }}>
          先人たちの知恵を、<br />
          あなたのビジネスの推進力に。
        </h1>
        <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
          フリーランス、副業、そして起業。<br />
          ゼロから道を切り拓くあなたへ、実践的なビジネススキルと、<br />
          困難を乗り越える「偉人たちの格言」をお届けします。
        </p>
      </section>

      {/* ▼▼▼ 追加：デフォルト診断ツール配置エリア ▼▼▼ */}
      <section style={{ maxWidth: '800px', margin: '0 auto 40px auto', padding: '0 20px' }}>
        <InteractiveTool config={defaultDiagnosisData} />
      </section>
      {/* ▲▲▲ 追加ここまで ▲▲▲ */}

      {/* 記事一覧セクション */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px', borderLeft: '5px solid #ea580c', paddingLeft: '12px' }}>
          最新のインサイト ({posts.length}件)
        </h2>
        
        {posts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>現在、公開されている記事はありません。</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map(post => (
              <article key={post.slug} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                
                {/* カテゴリーバッジ（オレンジ基調） */}
                <span style={{ display: 'inline-block', backgroundColor: '#fff7ed', color: '#ea580c', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '16px', marginBottom: '12px' }}>
                  {post.category}
                </span>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '19px' }}>
                  <Link href={`/posts/${post.slug}`} style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 'bold' }}>
                    {post.title}
                  </Link>
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{post.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
