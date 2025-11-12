import React, { useState } from 'react';
import type { ThumbnailCandidate } from '../types';

interface Step3ImagesProps {
  candidates: ThumbnailCandidate[];
  onNext: (selectedImageUrl: string) => void;
}

const ImageCard: React.FC<{ candidate: ThumbnailCandidate; isSelected: boolean; onSelect: () => void; }> = ({ candidate, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-4 
        ${isSelected ? 'border-purple-500 scale-105 shadow-2xl' : 'border-transparent hover:border-purple-500'}
      `}
    >
      <img src={candidate.url} alt="Thumbnail candidate" className="aspect-video w-full object-cover" />
      {candidate.timestamp !== undefined && (
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-lg">
          {new Date(candidate.timestamp * 1000).toISOString().substr(14, 5)}
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-purple-600 bg-opacity-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};


const Step3Images: React.FC<Step3ImagesProps> = ({ candidates, onNext }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedImage) {
      onNext(selectedImage);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-8">Step 3: サムネイル画像の選択</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {candidates.map((candidate, index) => (
          <ImageCard
            key={index}
            candidate={candidate}
            isSelected={selectedImage === candidate.url}
            onSelect={() => setSelectedImage(candidate.url)}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedImage}
          className="bg-purple-600 text-white font-bold py-3 px-10 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default Step3Images;
