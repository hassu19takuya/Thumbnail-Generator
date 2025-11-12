import React, { useState } from 'react';
import type { VideoSource, VideoSourceType } from '../types';

interface Step1InputProps {
  onNext: (source: VideoSource) => void;
}

const FileUploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const YouTubeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.502-9.407-.502-9.407-.502s-7.537 0-9.407.502A3.007 3.007 0 0 0 .5 6.205C0 8.075 0 12 0 12s0 3.925.505 5.795a3.007 3.007 0 0 0 2.088 2.088c1.87.502 9.407.502 9.407.502s7.537 0 9.407-.502a3.007 3.007 0 0 0 2.088-2.088C24 15.925 24 12 24 12s0-3.925-.505-5.795zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const Step1Input: React.FC<Step1InputProps> = ({ onNext }) => {
  const [sourceType, setSourceType] = useState<VideoSourceType>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) { // 200MB limit
        setError('ファイルサイズは200MBを超えることはできません。');
        setVideoFile(null);
      } else {
        setVideoFile(file);
        setError('');
      }
    }
  };

  const handleSubmit = () => {
    setError('');
    if (sourceType === 'file') {
      if (!videoFile) {
        setError('動画ファイルを選択してください。');
        return;
      }
      if (!description.trim()) {
        setError('動画の簡単な説明を入力してください。');
        return;
      }
      onNext({ type: 'file', data: videoFile, userDescription: description });
    } else {
      if (!youtubeUrl.trim() || !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(youtubeUrl)) {
        setError('有効なYouTubeのURLを入力してください。');
        return;
      }
      onNext({ type: 'youtube', data: youtubeUrl });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">Step 1: 動画ソースの選択</h2>
      <div className="flex justify-center mb-6 border border-gray-700 rounded-lg p-1">
        <button
          onClick={() => setSourceType('file')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200 ${sourceType === 'file' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <FileUploadIcon /> ファイルアップロード
        </button>
        <button
          onClick={() => setSourceType('youtube')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors duration-200 ${sourceType === 'youtube' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
         <YouTubeIcon /> YouTube URL
        </button>
      </div>

      <div className="space-y-6">
        {sourceType === 'file' ? (
          <>
            <div>
              <label htmlFor="video-file" className="block text-sm font-medium text-gray-300 mb-2">動画ファイル (最大200MB)</label>
              <input 
                id="video-file"
                type="file" 
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
              />
              {videoFile && <p className="text-sm text-gray-400 mt-2">選択されたファイル: {videoFile.name}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">動画の簡単な説明</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例：美味しいチーズケーキの作り方を紹介する動画"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                rows={3}
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-2">YouTube動画のURL</label>
            <input
              id="youtube-url"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white font-bold py-3 px-10 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200"
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default Step1Input;