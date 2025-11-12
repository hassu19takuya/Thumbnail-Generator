import React from 'react';

interface Step4ResultProps {
  thumbnails: string[];
  onRestart: () => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const Step4Result: React.FC<Step4ResultProps> = ({ thumbnails, onRestart }) => {
  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail_option_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-2">🎉 サムネイルが完成しました！ 🎉</h2>
      <p className="text-center text-gray-300 mb-8">3つのデザイン案です。好きなものをダウンロードしてください。</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {thumbnails.map((url, index) => (
          <div key={index} className="rounded-lg overflow-hidden group border-2 border-gray-700">
             <div className="relative">
                <img src={url} alt={`Final thumbnail ${index + 1}`} className="aspect-video w-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                        onClick={() => handleDownload(url, index)}
                        className="flex items-center justify-center bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transform hover:scale-105 transition-all">
                        <DownloadIcon /> ダウンロード
                    </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onRestart}
          className="bg-gray-600 text-white font-bold py-3 px-10 rounded-full hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200"
        >
          最初からやり直す
        </button>
      </div>
    </div>
  );
};

export default Step4Result;
