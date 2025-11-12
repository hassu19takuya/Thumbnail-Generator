import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 bg-opacity-75 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
      <p className="text-lg text-gray-200 font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
