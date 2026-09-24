import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getTotalPages, paginatePosts } from '@/lib/posts';
import Pagination from '@/components/Pagination';

// 静的エクスポート対象にする
export const dynamic = 'force-static';

// ★追加：記事一覧のページネーション用ルート（/page/2, /page/3, ...）
// 1ページ目はトップページ（/）が担当するので、ここでは2ページ目以降だけ生成する
export async function generateStaticParams() {
  const posts = await getPosts();
  const totalPages = getTotalPages(posts.length);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function PostsPage({ params }: { params: { page: string } }) {
  const pageNumber = Number(params.page);
  const posts = await getPosts();
  const totalPages = getTotalPages(posts.length);

  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > totalPages) {
    notFound();
  }

  const pagePosts = paginatePosts(posts, pageNumber);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 0 40px 0' }}>
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 0 20px' }}>
        <Link href="/" style={{ color: '#ea580c', textDecoration: 'none', fontSize: '14px' }}>
          ← トップへ戻る
        </Link>
      </section>

      <section style={{ maxWidth: '800px', margin: '20px auto 0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '24px', borderLeft: '5px solid #ea580c', paddingLeft: '12px' }}>
          記事一覧（{pageNumber}ページ目） ({posts.length}件)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pagePosts.map(post => (
            <article key={post.slug} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
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

        <Pagination currentPage={pageNumber} totalPages={totalPages} accentColor="#ea580c" />
      </section>
    </div>
  );
}
