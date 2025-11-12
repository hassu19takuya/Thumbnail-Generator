import React, { useState, useCallback } from 'react';
import type { VideoSource, ThumbnailCandidate } from './types';
// FIX: Corrected import path from videoUtils to fileUtils.
import { extractFramesFromVideo } from './utils/fileUtils';
import * as geminiService from './services/geminiService';

import Step1Input from './components/Step1Input';
import Step2Titles from './components/Step2Titles';
import Step3Images from './components/Step3Images';
import Step4Result from './components/Step4Result';
import Loader from './components/Loader';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // State for each step's data
    const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
    const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
    const [catchphraseSuggestions, setCatchphraseSuggestions] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState<string>('');
    const [selectedCatchphrase, setSelectedCatchphrase] = useState<string>('');
    const [thumbnailCandidates, setThumbnailCandidates] = useState<ThumbnailCandidate[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [finalThumbnails, setFinalThumbnails] = useState<string[]>([]);

    const resetState = () => {
        setCurrentStep(1);
        setIsLoading(false);
        setError(null);
        setVideoSource(null);
        setTitleSuggestions([]);
        setCatchphraseSuggestions([]);
        setSelectedTitle('');
        setSelectedCatchphrase('');
        setThumbnailCandidates([]);
        setSelectedImage('');
        setFinalThumbnails([]);
    };

    const handleError = (message: string) => {
        setError(message);
        setIsLoading(false);
    };

    const handleStep1Next = useCallback(async (source: VideoSource) => {
        setIsLoading(true);
        setError(null);
        setVideoSource(source);
        
        try {
            setLoadingMessage('タイトルとキャッチコピーを生成中...');
            let context = '';
            if (source.type === 'file') {
                context = source.userDescription!;
            } else {
                context = await geminiService.getYoutubeVideoTitle(source.data as string);
            }
            const { titles, catchphrases } = await geminiService.generateTitlesAndCatchphrases(context);
            setTitleSuggestions(titles);
            setCatchphraseSuggestions(catchphrases);
            setCurrentStep(2);
        } catch (e: any) {
            handleError(e.message || 'An unknown error occurred in Step 1.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleStep2Next = useCallback(async (title: string, catchphrase: string) => {
        setIsLoading(true);
        setError(null);
        setSelectedTitle(title);
        setSelectedCatchphrase(catchphrase);

        try {
            if (videoSource?.type === 'file') {
                setLoadingMessage('動画から画像を抽出中...');
                const frames = await extractFramesFromVideo(videoSource.data as File, 3);
                setThumbnailCandidates(frames);
            } else {
                setLoadingMessage('サムネイル画像を生成中...');
                const images = await geminiService.generateImageCandidatesFromPrompt(title);
                setThumbnailCandidates(images.map(url => ({ url })));
            }
            setCurrentStep(3);
        } catch (e: any) {
             handleError(e.message || 'An unknown error occurred in Step 2.');
        } finally {
            setIsLoading(false);
        }
    }, [videoSource]);

    const handleStep3Next = useCallback(async (imageUrl: string) => {
        setIsLoading(true);
        setError(null);
        setSelectedImage(imageUrl);

        try {
            setLoadingMessage('最終的なサムネイルをデザイン中...');
            const thumbnails = await geminiService.createFinalThumbnails(imageUrl, selectedTitle, selectedCatchphrase);
            setFinalThumbnails(thumbnails);
            setCurrentStep(4);
        } catch (e: any) {
            handleError(e.message || 'An unknown error occurred in Step 3.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedTitle, selectedCatchphrase]);


    const renderContent = () => {
        if (isLoading) {
            return <Loader message={loadingMessage} />;
        }
        if (error) {
            return (
                <div className="text-center p-8 bg-red-900 bg-opacity-30 rounded-lg">
                    <h3 className="text-2xl font-bold text-red-400 mb-4">エラーが発生しました</h3>
                    <p className="text-red-300 mb-6">{error}</p>
                    <button
                        onClick={resetState}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-500"
                    >
                        最初からやり直す
                    </button>
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return <Step1Input onNext={handleStep1Next} />;
            case 2:
                return <Step2Titles titles={titleSuggestions} catchphrases={catchphraseSuggestions} onNext={handleStep2Next} />;
            case 3:
                return <Step3Images candidates={thumbnailCandidates} onNext={handleStep3Next} />;
            case 4:
                return <Step4Result thumbnails={finalThumbnails} onRestart={resetState} />;
            default:
                return <Step1Input onNext={handleStep1Next} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        AI Thumbnail Pro
                    </span>
                </h1>
                <p className="text-gray-400 mt-2">AIの力で、クリックされるサムネイルを簡単に作成</p>
            </header>
            <main className="w-full">
               {!isLoading && !error && <StepIndicator currentStep={currentStep} totalSteps={4} />}
               <div className="mt-8">
                {renderContent()}
               </div>
            </main>
        </div>
    );
};

export default App;