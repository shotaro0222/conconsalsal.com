"use client"
import React, { useState } from 'react';
import Link from 'next/link';

export default function HubPage() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(0));
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 心・技・体の15問
  const questions = [
    // 【体：戦略（BizPioneer）】
    { axis: '体', text: "現在の価格設定は、相場ではなく「自分が提供する価値」を基準にしている。" },
    { axis: '体', text: "売上の大部分が、特定の1社や1人の顧客に依存していない。" },
    { axis: '体', text: "自分のサービスの「たった一人の理想の顧客（ペルソナ）」を即答できる。" },
    { axis: '体', text: "条件に合わない仕事を、意図的に「断る」ことができている。" },
    { axis: '体', text: "1年後、自分の事業がどうなっていたいか、明確なビジョンがある。" },
    // 【技：スキル（Re:Skill Blog）】
    { axis: '技', text: "毎日発生する「コピペ」や定型文入力をツールで自動化している。" },
    { axis: '技', text: "日程調整や請求書の発行に、ほとんど時間をかけていない。" },
    { axis: '技', text: "PCが今すぐ壊れても、クラウドを利用して別のPCで即座に業務を再開できる。" },
    { axis: '技', text: "業務フローが自分の頭の中だけでなく、メモやツールに書き出されている。" },
    { axis: '技', text: "AI（ChatGPTなど）を週に1回以上は実務の効率化に活用している。" },
    // 【心：メンタル（Mindful Shutter）】
    { axis: '心', text: "休日は仕事の連絡やメールを無意識に確認しないようにしている。" },
    { axis: '心', text: "寝る直前まで、明日のタスクや売上の不安について考えることはない。" },
    { axis: '心', text: "この1週間で、意図的に「何もしない時間」を3時間以上作った。" },
    { axis: '心', text: "SNSで同業者の活躍を見ても、焦りや自己嫌悪に陥ることはない。" },
    { axis: '心', text: "仕事とは全く関係のない「純粋な趣味」を心から楽しむ余裕がある。" }
  ];

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('result');
    }
  };

  const calculateScores = () => {
    const tai = answers.slice(0, 5).reduce((a, b) => a + b, 0); // 0〜25点
    const waza = answers.slice(5, 10).reduce((a, b) => a + b, 0); // 0〜25点
    const shin = answers.slice(10, 15).reduce((a, b) => a + b, 0); // 0〜25点
    return { tai, waza, shin };
  };

  const getAdvice = (scores: { tai: number; waza: number; shin: number }) => {
    const minScore = Math.min(scores.tai, scores.waza, scores.shin);
    if (minScore === scores.shin) {
      return {
        title: "警告：メンタル（心）がすり減っています",
        text: "戦略やスキル以前に、心が悲鳴を上げています。焦って新しいことを始める前に、まずはデジタルデトックスと休息が必要です。",
        link: "https://mindful.bizpioneer.com", // ★ご自身のMindful ShutterのURLに変更
        linkText: "Mindful Shutterで心を整える"
      };
    } else if (minScore === scores.tai) {
      return {
        title: "課題：ビジネスの軸（戦略）がブレています",
        text: "目の前の作業に追われ、「どこへ向かうべきか」を見失っています。ビジネスモデルと価格設定を見直すタイミングです。",
        link: "https://bizpioneer.com", // ★ご自身のBizPioneerのURLに変更
        linkText: "BizPioneerで戦略を練り直す"
      };
    } else {
      return {
        title: "課題：実務（スキル）がボトルネックです",
        text: "気合いや根性に頼りすぎており、労働集約型の働き方になっています。ITツールを活用して自分の時間を生み出しましょう。",
        link: "https://reskill.bizpioneer.com", // ★ご自身のRe:Skill BlogのURLに変更
        linkText: "Re:Skill Blogで自動化を学ぶ"
      };
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* 1. イントロダクション画面（UX大幅改善） */}
        {step === 'intro' && (
          <div>
            {/* ヒーローエリア */}
            <div style={{ backgroundColor: '#1e293b', padding: '50px 30px', textAlign: 'center', color: '#fff' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                ビジネスの現在地を知る<br />「SoloCompass」総合評価
              </h1>
              <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7', margin: '0' }}>
                戦略・実務・メンタル。15個の質問からあなたの現在地を即座に可視化し、<br />持続可能なビジネスを作るための「次の一手」を導き出します。
              </p>
            </div>

            <div style={{ padding: '40px 30px' }}>
              
              {/* なぜこの診断が必要なのか？（3軸の解説） */}
              <h2 style={{ fontSize: '20px', textAlign: 'center', color: '#0f172a', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
                行き詰まりの原因は、技術不足ではないかもしれません
              </h2>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', marginBottom: '30px', textAlign: 'center' }}>
                個人が自立し、長くビジネスを続けるためには「3つのバランス」が不可欠です。どれか1つでも欠けると、ビジネスは途端に苦しくなります。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#ea580c', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>体</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>戦略とビジネスモデル</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>どこへ向かうべきかの「羅針盤」。戦う場所を間違えれば利益は出ません。</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#0070f3', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>技</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>実務・自動化スキル</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>前に進むための「エンジン」。労働集約型から抜け出すためのIT技術です。</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#52796f', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>心</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>メンタル・マインドフルネス</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>走り続けるための「メンテナンス」。心が折れれば、すべての歩みは止まります。</p>
                  </div>
                </div>
              </div>

              {/* 診断で得られる結果 */}
              <div style={{ backgroundColor: '#f1f5f9', padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 16px 0', textAlign: 'center', fontWeight: 'bold' }}>
                  🎯 この無料診断でわかること
                </h3>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>15問の直感的な回答から、あなたの<b>「心・技・体」のバランスを即座にスコア化</b></li>
                  <li>現在抱えている<b>「見えないボトルネック（弱点）」の特定</b></li>
                  <li>弱点を補強し、次のステージへ進むための<b>具体的なアクションと推奨コンテンツ</b></li>
                </ul>
              </div>

              {/* スタートボタン */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => setStep('quiz')}
                  style={{ backgroundColor: '#2563eb', color: '#fff', padding: '16px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', width: '100%', maxWidth: '400px', transition: 'background 0.2s' }}
                >
                  無料で診断をスタートする (約1分)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. クイズ画面 */}
        {step === 'quiz' && (
          <div style={{ padding: '40px 30px' }}>
            <div style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>
              質問 {currentQuestion + 1} / 15 （{questions[currentQuestion].axis}の診断）
            </div>
            <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', marginBottom: '40px' }}>
              <div style={{ width: `${((currentQuestion) / 15) * 100}%`, backgroundColor: '#2563eb', height: '100%', borderRadius: '3px', transition: 'width 0.3s' }}></div>
            </div>

            <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '40px', lineHeight: '1.5', textAlign: 'center' }}>
              {questions[currentQuestion].text}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '全く当てはまらない', score: 1 },
                { label: 'あまり当てはまらない', score: 2 },
                { label: 'どちらとも言えない', score: 3 },
                { label: 'やや当てはまる', score: 4 },
                { label: '非常に当てはまる', score: 5 },
              ].map((option, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(option.score)}
                  style={{ padding: '16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', color: '#334155', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. 結果レポート画面 */}
        {step === 'result' && (() => {
          const scores = calculateScores();
          const advice = getAdvice(scores);
          return (
            <div>
              <div style={{ backgroundColor: '#f1f5f9', padding: '30px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '22px', color: '#0f172a', margin: '0' }}>あなたの総合評価レポート</h2>
              </div>
              
              <div style={{ padding: '40px 30px' }}>
                {/* スコア表示 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '16px' }}>
                  <div style={{ flex: 1, backgroundColor: '#fff7ed', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '14px', color: '#ea580c', fontWeight: 'bold', marginBottom: '8px' }}>体（戦略）</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9a3412' }}>{scores.tai}<span style={{ fontSize:'16px' }}>/25</span></div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: 'bold', marginBottom: '8px' }}>技（実務）</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>{scores.waza}<span style={{ fontSize:'16px' }}>/25</span></div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: 'bold', marginBottom: '8px' }}>心（メンタル）</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534' }}>{scores.shin}<span style={{ fontSize:'16px' }}>/25</span></div>
                  </div>
                </div>

                {/* AI（プログラム）からのアドバイス */}
                <div style={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '30px' }}>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                    {advice.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '24px' }}>
                    {advice.text}
                  </p>
                  
                  {/* 最も欠けている要素を補うためのサイトへ誘導 */}
                  <div style={{ textAlign: 'center' }}>
                    <a href={advice.link} style={{ display: 'inline-block', backgroundColor: '#0f172a', color: '#fff', padding: '14px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
                      👉 {advice.linkText}
                    </a>
                  </div>
                </div>

                {/* やり直しリンク */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button onClick={() => { setStep('intro'); setAnswers(Array(15).fill(0)); setCurrentQuestion(0); }} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}>
                    もう一度診断する
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
