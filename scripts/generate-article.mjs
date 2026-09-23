import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { injectAffiliateLinks } from './injectAffiliates.mjs';
import { buildKeywordMap, injectInternalLinks } from './injectInternalLinks.mjs'; // ★ 追加

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const runCount = process.env.IS_BURST === 'true' ? 50 : 1;

const mediaPath = path.resolve(process.cwd(), 'src/data/media.json');
let availableImages = [];
if (fs.existsSync(mediaPath)) {
  availableImages = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
}

// 過去に生成した記事のタイトルを保持する配列
const generatedTitlesHistory = [];

async function generateSingleArticle(index) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // 履歴が存在する場合、プロンプトに過去のタイトルリストを注入
  const historyInstruction = generatedTitlesHistory.length > 0 
    ? `\n【重要：テーマの重複回避】\n過去に以下のテーマ・タイトルの記事を既に作成しました。これらと内容、視点、タイトルが「絶対に被らないように」、全く新しい切り口で執筆してください。\n${generatedTitlesHistory.map(t => `- ${t}`).join('\n')}\n`
    : '';

  // ★ プロンプト修正：エッセイ風のルールを適用しつつ、名言の引用とHTML表組みを活用
  const prompt = `
あなたは個人やスモールビジネスを支援するプロのビジネスコラムニストです。
「副業」「フリーランス」「起業」「ビジネススキル」「マーケティング」をテーマに、読者のモチベーションを高める「読み物（エッセイ風）」を作成してください。
${historyInstruction}
【厳守事項 - 以下のルールを絶対に守ってください】
1. AIとしての返事や挨拶は一切含めず、記事のコンテンツのみを4000字程度で出力してください。
2. 記事の先頭には必ず以下の形式でタイトルとカテゴリーを記述してください。
---
title: "ここに魅力的で具体的な記事のタイトルを記載"
category: "ここに記事のカテゴリーを記載（例：マーケティング、マインドセット、SEOなど）"
---
※【超重要】titleの中身は「純粋なプレーンテキスト」のみとし、HTMLタグやMarkdown記号は絶対に含めないでください。

【出力の厳密なルール（AIらしさの排除と適切な装飾）】
1. Markdownの記号（#、##、-、* など）は一切使用せず、見出しや箇条書きを作らないでください。
2. 【重要】情報を比較・整理するために「表（テーブル）」が必要な場面では、必ずHTMLタグ（<table>, <tr>, <th>, <td>など）を使用して、1記事の中に数回、美しく見やすい表を作成してください。
※ Markdownの表（|---|）はレイアウトが崩れるため絶対に使用禁止です。
3. 構造化フォーマットばかりに頼らず、自然な段落と適度な改行を使った「読み物（エッセイ・コラム風）」として全体を構成してください。
4. 記事の中で必ず1つ以上、「歴史上の偉人や著名な経営者の格言・名言」を紹介してください。引用部分のみ、Markdownの引用ブロック（>）を使用しても構いません。
5. 「結論から言うと」「〜と言えるでしょう」「まとめ」「いかがでしたか？」といった、AI特有の定型文や不自然なまとめの段落は禁止です。
6. 現場の温度感が伝わるような、血の通った人間らしい自然な文体で、読者に語り掛けるように記述し、読者が「今日から行動してみよう」と思える前向きな結末にしてください。
7. 以下の画像を、文脈に合わせて1〜2枚適切にMarkdown形式 (![alt](URL)) で挿入してください。画像挿入時のみMarkdownを使用しても構いません。

記事の最後には、必ず記事のテーマに直結する「読者向けの簡易診断システム（3問）」のデータを、以下のJSONフォーマットで出力してください。この部分のみMarkdownのコードブロック(\`\`\`json)で囲むこと。

\`\`\`json
{
  "title": "（例：あなたの市場価値・準備度診断など）",
  "questions": [
    "（はい/いいえで答えられる質問1）",
    "（はい/いいえで答えられる質問2）",
    "（はい/いいえで答えられる質問3）"
  ],
  "resultHigh": "（はいが多かった人へのフィードバック）。ビジネスをさらに加速させるためのITスキル・自動化術は <a href='https://あなたのリスキルブログのURL' target='_blank'>Re:Skill Blog</a> でチェック！",
  "resultLow": "（いいえが多かった人へのフィードバック）。少し立ち止まって心を整える時間が必要かもしれません。マインドフルネスのヒントは <a href='https://あなたのマインドフルシャッターのURL' target='_blank'>Mindful Shutter</a> で見つけてみてください。"
}
\`\`\`

【利用可能な画像URLリスト】
${availableImages.map(img => `- ${img.url} (内容: ${img.alt})`).join('\n')}
`;

  const result = await model.generateContent(prompt);
  let content = result.response.text();

  // AIが記事全体を ```markdown で囲ってきた場合のみ、外側のラッパーを除去する
  content = content.trim();
  const outerWrapperMatch = content.match(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```$/);
  if (outerWrapperMatch) {
    content = outerWrapperMatch[1].trim();
  }

  // タイトル部分（Frontmatter）を切り離して、広告挿入から保護する
  let frontmatter = '';
  let body = content;

  const match = content.match(/^(---[\s\S]*?---[\r\n]+)([\s\S]*)$/);
  if (match) {
    frontmatter = match[1]; // タイトルとカテゴリーの部分
    body = match[2];        // 記事の本文

    // frontmatterからタイトルを抽出して履歴に追加
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      generatedTitlesHistory.push(titleMatch[1]);
    } else {
      generatedTitlesHistory.push(`生成済み記事${index}`);
    }
  }

  // ★ 変更：アフィリエイト挿入後に内部リンクも自動挿入する
  body = injectAffiliateLinks(body);
  
  const postsDirectory = path.resolve(process.cwd(), 'content/posts');
  const keywordMap = buildKeywordMap(postsDirectory);
  body = injectInternalLinks(body, keywordMap);

  // 切り離していたタイトル部分を安全にくっつける
  content = frontmatter + body;

  // ファイル名の生成と保存
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `post-${dateStr}-${index}.md`;
  const dirPath = path.resolve(process.cwd(), 'content/posts');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(dirPath, filename), content);
  console.log(`✅ 記事生成完了: ${filename} (内部リンク処理済) (履歴件数: ${generatedTitlesHistory.length})`);
  
  // API制限回避のための待機時間（15秒）
  await new Promise(resolve => setTimeout(resolve, 15000));
}

async function main() {
  console.log(`🚀 生成開始: ${runCount}記事を生成します...`);
  for (let i = 1; i <= runCount; i++) {
    console.log(`⏳ ${i}/${runCount} 記事目を生成中...`);
    try {
      await generateSingleArticle(i);
    } catch (error) {
      console.error(`❌ エラー発生（${i}回目）:`, error);
      // エラーが起きたらループを抜けて、そこまでの記事を保存させる
      console.log(`⚠️ API制限などのため、${i - 1}記事目までを保存して終了します。`);
      break; 
    }
  }
  console.log('🎉 すべての生成プロセスが完了しました！');
}

main();
