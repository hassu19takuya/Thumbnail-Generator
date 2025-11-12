import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    "動画の指定",
    "タイトル選択",
    "画像選択",
    "サムネイル完成"
  ];
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                    ${isActive ? 'bg-purple-600 text-white ring-2 ring-purple-400' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-700 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <p className={`mt-2 text-xs text-center ${isActive ? 'text-purple-400 font-semibold' : 'text-gray-400'}`}>{label}</p>
              </div>
              {stepNumber < totalSteps && (
                <div className={`flex-auto border-t-2 transition-all duration-300 mx-2
                  ${isCompleted ? 'border-green-500' : 'border-gray-700'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
