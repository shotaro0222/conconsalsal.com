import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { injectAffiliateLinks } from './injectAffiliates.mjs';
import { buildKeywordMap, injectInternalLinks } from './injectInternalLinks.mjs';

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
  
  const historyInstruction = generatedTitlesHistory.length > 0 
    ? `\n【重要：テーマの重複回避】\n過去に以下のテーマ・タイトルの記事を既に作成しました。これらと内容、視点、タイトルが「絶対に被らないように」、全く新しい切り口で執筆してください。\n${generatedTitlesHistory.map(t => `- ${t}`).join('\n')}\n`
    : '';

  const prompt = `
あなたは個人やスモールビジネスを支援するプロのビジネスコラムニストです。
「副業」「フリーランス」「起業」「ビジネススキル」「マーケティング」をテーマに、読者のモチベーションを高める「読み物（エッセイ風）」を作成してください。
${historyInstruction}
【厳守事項 - 以下のルールを絶対に守ってください】
1. AIとしての返事や挨拶は一切含めず、記事のコンテンツのみを4000字程度で出力してください。
2. 記事の1行目は必ず以下の形式でタイトルとカテゴリーを記述してください。改行や余計な文字は不要です。
---
title: "ここに魅力的で具体的な記事のタイトルを記載"
category: "ここに記事のカテゴリーを記載"
---
※【超重要】titleの中身は「純粋なプレーンテキスト」のみとし、HTMLタグやMarkdown記号は絶対に含めないでください。

【出力の厳密なルール（AIらしさの排除と適切な装飾）】
1. Markdownの記号（#、##、-、* など）は一切使用せず、見出しや箇条書きを作らないでください。（※例外：画像挿入と、記事末尾のJSONコードブロックのみ使用を許可します）
2. 【重要】情報を比較・整理するために「表（テーブル）」が必要な場面では、必ずHTMLタグ（<table>, <tr>, <th>, <td>など）を使用して、1記事の中に数回、美しく見やすい表を作成してください。
※ Markdownの表（|---|）はレイアウトが崩れるため絶対に使用禁止です。
3. 構造化フォーマットばかりに頼らず、自然な段落と適度な改行を使った「読み物（エッセイ・コラム風）」として全体を構成してください。
4. 記事の中で必ず1つ以上、「歴史上の偉人や著名な経営者の格言・名言」を紹介してください。引用部分のみ、Markdownの引用ブロック（>）を使用しても構いません。
5. 「結論から言うと」「〜と言えるでしょう」「まとめ」「いかがでしたか？」といった、AI特有の定型文や不自然なまとめの段落は禁止です。
6. 現場の温度感が伝わるような、血の通った人間らしい自然な文体で、読者に語り掛けるように記述し、読者が「今日から行動してみよう」と思える前向きな結末にしてください。
7. 以下の画像を、文脈に合わせて1〜2枚適切にMarkdown形式 (![alt](URL)) で挿入してください。

【絶対条件：簡易診断システムの出力】
記事の一番最後には、必ず記事のテーマに直結する「読者向けの簡易診断システム（3問）」のデータを、以下のJSONフォーマットで出力してください。この部分のみMarkdownのコードブロック(\`\`\`json)で囲むこと。省略は絶対に許されません。

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

  content = content.trim();
  const outerWrapperMatch = content.match(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```$/);
  if (outerWrapperMatch) {
    content = outerWrapperMatch[1].trim();
  }

  // ★ 修正：AIが前置きを書いた場合でも、確実にタイトル部分（Frontmatter）を見つけて保護する
  let frontmatter = '';
  let body = content;

  const fmRegex = /---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
  const match = content.match(fmRegex);

  if (match) {
    // タイトルとカテゴリーを安全に再構築（HTMLタグが万が一入っていても強制除去）
    const rawFrontmatter = match[1].replace(/<[^>]+>/g, ''); 
    frontmatter = `---\n${rawFrontmatter.trim()}\n---\n\n`;
    
    // --- より後ろを本文とする
    body = content.substring(match.index + match[0].length).trim();

    const titleMatch = rawFrontmatter.match(/title:\s*"([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      generatedTitlesHistory.push(titleMatch[1]);
    } else {
      generatedTitlesHistory.push(`生成済み記事${index}`);
    }
  } else {
    generatedTitlesHistory.push(`生成済み記事${index}`);
  }

  // JSONブロックの退避
  let jsonBlock = '';
  const jsonRegex = /```json\s*[\s\S]*?\s*```/;
  const jsonMatch = body.match(jsonRegex);
  if (jsonMatch) {
    jsonBlock = jsonMatch[0];
    body = body.replace(jsonRegex, '');
  }

  // 本文（body）に対してのみリンクを挿入
  body = injectAffiliateLinks(body);
  
  const postsDirectory = path.resolve(process.cwd(), 'content/posts');
  const keywordMap = buildKeywordMap(postsDirectory);
  body = injectInternalLinks(body, keywordMap);

  // 退避させていたJSONブロックを復元
  if (jsonBlock) {
    body = body.trim() + '\n\n' + jsonBlock;
  }

  // 安全に切り離していたタイトル部分をくっつける
  content = frontmatter + body;

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `post-${dateStr}-${index}.md`;
  const dirPath = path.resolve(process.cwd(), 'content/posts');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(path.join(dirPath, filename), content);
  console.log(`✅ 記事生成完了: ${filename} (内部リンク処理済) (履歴件数: ${generatedTitlesHistory.length})`);
  
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
      console.log(`⚠️ API制限などのため、${i - 1}記事目までを保存して終了します。`);
      break; 
    }
  }
  console.log('🎉 すべての生成プロセスが完了しました！');
}

main();
