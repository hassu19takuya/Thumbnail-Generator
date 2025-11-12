import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { fileToBase64, urlContentToBase64 } from '../utils/fileUtils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development, in production the key is expected to be set.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const titleSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: "3 catchy and concise Japanese title suggestions for a video, under 20 characters each.",
            items: { type: Type.STRING }
        },
        catchphrases: {
            type: Type.ARRAY,
            description: "3 short, punchy Japanese catchphrases that complement the titles, under 15 characters each.",
            items: { type: Type.STRING }
        }
    },
    required: ["titles", "catchphrases"]
};


export const generateTitlesAndCatchphrases = async (context: string): Promise<{ titles: string[], catchphrases: string[] }> => {
    try {
        const prompt = `以下の動画の内容を元に、Youtubeの視聴者の興味を引くようなタイトル案とキャッチコピー案を3つずつ提案してください。JSON形式で回答してください。\n\n動画内容：\n${context}`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: titleSchema
            }
        });

        const result = JSON.parse(response.text);
        return result;

    } catch (error) {
        console.error("Error generating titles and catchphrases:", error);
        throw new Error("Failed to generate titles and catchphrases.");
    }
};

export const generateImageCandidatesFromPrompt = async (prompt: string): Promise<string[]> => {
    try {
        const imagePromises = Array(3).fill(null).map(() => 
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: `YouTubeのサムネイル用の背景画像を生成してください。テーマは「${prompt}」です。画像は高品質で、後から文字を載せやすいように、中心や主要な部分に余白がある構成にしてください。抽象的でも具象的でも構いません。` }]
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            })
        );
        
        const responses = await Promise.all(imagePromises);

        return responses.map(response => {
            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error('Image data not found in response');
        });
    } catch (error) {
        console.error("Error generating image candidates:", error);
        throw new Error("Failed to generate image candidates.");
    }
}

export const createFinalThumbnails = async (baseImage: string, title: string, catchphrase: string): Promise<string[]> => {
    try {
        const { base64, mimeType } = await urlContentToBase64(baseImage);

        const prompts = [
            `この画像をベースに、以下のテキストを載せた魅力的なYouTubeサムネイルを作成してください。テキストは日本語で、読みやすく、目立つようにデザインしてください。スタイル：モダンで力強いフォント、白か黄色の文字に黒い縁取り。\n\nタイトル: 「${title}」\nキャッチコピー: 「${catchphrase}」`,
            `この画像をベースに、以下のテキストを載せた魅力的なYouTubeサムネイルを作成してください。テキストは日本語で、遊び心のあるポップなデザインにしてください。スタイル：手書き風または丸ゴシック体、カラフルな配色。\n\nタイトル: 「${title}」\nキャッチコピー: 「${catchphrase}」`,
            `この画像をベースに、以下のテキストを載せた魅力的なYouTubeサムネイルを作成してください。テキストは日本語で、クールで未来的なデザインにしてください。スタイル：ネオン風、サイバーパンク調のエフェクト。\n\nタイトル: 「${title}」\nキャッチコピー: 「${catchphrase}」`
        ];

        const thumbnailPromises = prompts.map(prompt => 
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: mimeType } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            })
        );

        const responses = await Promise.all(thumbnailPromises);

        return responses.map(response => {
            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error('Final thumbnail data not found in response');
        });

    } catch (error) {
        console.error("Error creating final thumbnails:", error);
        throw new Error("Failed to create final thumbnails.");
    }
};

export const getYoutubeVideoTitle = async (url: string): Promise<string> => {
    try {
        const response = await fetch(`https://noembed.com/embed?url=${url}`);
        if (!response.ok) {
            throw new Error('Failed to fetch video data');
        }
        const data = await response.json();
        return data.title || 'No title found';
    } catch (error) {
        console.error("Error fetching YouTube video title:", error);
        throw new Error("Could not get YouTube video details. Please check the URL.");
    }
};