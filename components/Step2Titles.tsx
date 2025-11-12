import React, { useState } from 'react';

interface Step2TitlesProps {
  titles: string[];
  catchphrases: string[];
  onNext: (selectedTitle: string, selectedCatchphrase: string) => void;
}

const SelectableCard: React.FC<{ text: string; isSelected: boolean; onSelect: () => void }> = ({ text, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 
        ${isSelected ? 'bg-purple-600 border-purple-400 shadow-lg scale-105' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-purple-500'}
      `}
    >
      <p className="text-center font-medium">{text}</p>
    </div>
  );
};

const Step2Titles: React.FC<Step2TitlesProps> = ({ titles, catchphrases, onNext }) => {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedCatchphrase, setSelectedCatchphrase] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedTitle && selectedCatchphrase) {
      onNext(selectedTitle, selectedCatchphrase);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center text-purple-400 mb-8">Step 2: タイトルとキャッチコピーの選択</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">タイトル案</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {titles.map((title, index) => (
            <SelectableCard
              key={index}
              text={title}
              isSelected={selectedTitle === title}
              onSelect={() => setSelectedTitle(title)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">キャッチコピー案</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {catchphrases.map((phrase, index) => (
            <SelectableCard
              key={index}
              text={phrase}
              isSelected={selectedCatchphrase === phrase}
              onSelect={() => setSelectedCatchphrase(phrase)}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedTitle || !selectedCatchphrase}
          className="bg-purple-600 text-white font-bold py-3 px-10 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default Step2Titles;
