import fs from 'fs';
import path from 'path';
import Link from 'next/link';
// ★ 追加：診断システムのパーツを読み込む
import InteractiveTool from '../../../components/InteractiveTool';

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  if (!fs.existsSync(postsDirectory)) return [];
  
  const filenames = fs.readdirSync(postsDirectory);
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => ({
      slug: filename.replace('.md', ''),
    }));
}

function parseMarkdownToHTML(markdown: string) {
  let html = markdown.replace(/---[\s\S]*?---/, '');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.2rem; margin-top: 2.5rem; margin-bottom: 1rem; color: #333;">$1</h3>')
             // ★ デザイン修正：見出し2の下線をBizPioneerのオレンジに変更
             .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-top: 3rem; margin-bottom: 1rem; color: #111;">$1</h2>')
             .replace(/^# (.*$)/gim, '') 
             .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
             // ★ デザイン修正：リンク色をBizPioneerのオレンジに変更
             .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #ea580c; text-decoration: underline;">$1</a>');
  html = html.replace(/\n\n/g, '<br /><br />');
  return html;
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>記事が見つかりません。</p>
        <Link href="/">トップページへ戻る</Link>
      </div>
    );
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  
  let title = '無題の記事';
  const titleMatch = fileContents.match(/title:\s*["']?([^"'\n]+)["']?/);
  if (titleMatch) {
    title = titleMatch[1];
  } else {
    const h1Match = fileContents.match(/^#\s+(.*)/m);
    if (h1Match) title = h1Match[1];
  }

  // ★ 追加：カテゴリーを抽出する
  let category = '未分類';
  const categoryMatch = fileContents.match(/category:\s*["']?([^"'\n]+)["']?/);
  if (categoryMatch) {
    category = categoryMatch[1];
  }

  // ★ 追加：Markdownの中から ```json 〜 ``` のブロックを探して抽出する
  let toolConfig = '';
  const jsonMatch = fileContents.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    toolConfig = jsonMatch[1];
  }

  // ★ 追加：Markdown本文からJSONブロックを取り除いたものを記事として表示する
  const contentWithoutJson = fileContents.replace(/```json\n[\s\S]*?\n```/, '');
  const contentHtml = parseMarkdownToHTML(contentWithoutJson);

  return (
    <article style={{ padding: '10px 20px', lineHeight: '1.8', color: '#444' }}>
      <div style={{ marginBottom: '30px' }}>
        {/* ★ デザイン修正：戻るリンクをBizPioneerのオレンジに変更 */}
        <Link href="/" style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          ← トップページへ戻る
        </Link>
      </div>

      {/* ★ 追加：カテゴリーバッジ（オレンジ基調） */}
      <span style={{ display: 'inline-block', backgroundColor: '#fff7ed', color: '#ea580c', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '16px', marginBottom: '12px' }}>
        {category}
      </span>

      {/* タイトルの margin-top を 0 に調整してバッジとの隙間を最適化 */}
      <h1 style={{ fontSize: '28px', color: '#111', marginBottom: '40px', lineHeight: '1.4', marginTop: '0' }}>
        {title}
      </h1>
      
      {/* 記事の本文 */}
      <div style={{ fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {/* ★ 追加：記事の最後に診断システムを自動配置（データがある場合のみ表示） */}
      {toolConfig && (
        <div style={{ marginTop: '50px' }}>
          <InteractiveTool configStr={toolConfig} />
        </div>
      )}
    </article>
  );
}
