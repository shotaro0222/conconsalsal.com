'use client';

import { useState } from 'react';

export default function ImageUploader() {
  // ★型を明示的に指定（File型またはnull）
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ★イベントの型（React.FormEvent）を指定
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('画像を選択してください');

    setIsLoading(true);
    setStatus('アップロード中...');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', altText);

    try {
      const res = await fetch('/upload-api.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      const responseText = await res.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(responseText.slice(0, 200) || 'サーバーが不正な応答を返しました。');
        }
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'アップロードに失敗しました。');
      }

      setStatus(`✅ 成功: ${data.message}`);
      setFile(null);
      setAltText('');
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ 通信エラー: ${err.message || 'サーバー側の設定を確認してください。'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🖼️ 新規画像のアップロード</h2>
      <p className="text-sm text-gray-500 mb-6">
        Xserverに保存され、AIの記事生成素材（media.json）に自動追加されます。
      </p>

      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">画像ファイル</label>
          {/* ★ onChangeのイベント型（React.ChangeEvent<HTMLInputElement>）を指定し、オプショナルチェーンを使用 */}
          <input 
            id="file-upload-input"
            type="file" 
            accept="image/png, image/jpeg, image/webp"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
            className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">画像の説明（AI用）</label>
          <input 
            type="text" 
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="例: ノートパソコンを開いてカフェで仕事をする女性"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full font-bold py-3 rounded-lg shadow-sm transition ${
            isLoading 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? '処理中...' : 'アップロード'}
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-3 rounded-lg font-medium text-sm ${status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
