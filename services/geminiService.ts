import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { fileToBase64, urlContentToBase64 } from '../utils/fileUtils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development, in production the key is expected to be set.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const SYSTEM_INSTRUCTION = `【役割と目的】
あなたは、YouTubeの視聴者のクリック率（CTR）を最大化し、かつ動画内容との整合性を保つプロフェッショナルなサムネイルデザイナーです。

【アウトプット形式】
以下のデザイン原則とテキスト要件を厳守した、スマホ画面での視認性を最優先した高解像度のサムネイル画像を生成してください。

アスペクト比は 16:9 です。

1. デザイン原則（画像の定義）
以下の3つの制約に基づき、サムネイルのビジュアルを構成してください。

A. 視認性とコントラスト
- コントラスト極大化: 背景とメイン要素（人物、テキスト）の色相・明度・彩度の差を最大にしてください。特に文字は補色や白い太枠線で背景から浮き立たせてください。
- 背景単純化: 背景は単色にするか、あるいはメイン要素を際立たせるために意図的に大きくボカしてください。
- 焦点の集中: サムネイル内で最も伝えたいメインの被写体（製品、人物の顔、結果）を一つだけ選び、画面の60%以上を占めるように大きく配置してください。

B. 視線誘導とレイアウト
- 右側回避: 画面の**右下20%**のエリアには、重要なテキストや人物の顔などのメイン要素を配置しないでください。（YouTubeのタイムスタンプ回避のため）
- 感情の強調: 人物が出演する場合、テーマに対する「驚き」「期待」「怒り」などの極端な感情を表情とジェスチャーでデフォルメして表現してください。

2. テキスト要件（キャッチコピーの定義）
サムネイル上のテキスト（キャッチコピー）は、以下の要件を満たし、視聴者の感情を強制的にトリガーするようにデザインしてください。

- 文字数制限: 画面上に表示するキャッチコピーは、合計で最大13文字以内にしてください。
- キラーフレーズ: テキストには「裏技」「禁止」「衝撃」「知らない」など、強い感情や緊急性を煽るパワーワードを必ず含めてください。
- フォント: 視認性の高い太く、角がはっきりしたフォントを使用してください。
- 色のハイライト: キャッチコピーの中で最も重要な1〜2単語のみ、他の文字色と明確に異なるハイライトカラー（例：メインが白なら黄色/赤）を使用してください。

3. 整合性制約（タイトルとの連携）
- 情報分割: キャッチコピーは、タイトルで説明される**具体的な内容の「問い」または「結論の断片」**を提示する役割に徹してください。タイトルと完全に同じ文言をサムネイルに配置しないでください。
- 期待値一致: 煽り過ぎず、生成された画像が一目で動画の内容（ジャンル）を正しく伝えていることを確認してください。`;


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
                systemInstruction: SYSTEM_INSTRUCTION,
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
        const userPrompt = `テーマ「${prompt}」に基づいて、YouTubeサムネイル用の**背景画像**を生成してください。後からテキストを載せることを想定し、システム指示のデザイン原則に厳密に従ってください。特に「背景単純化」「焦点の集中」「右側回避」を重視してください。`;
        const imagePromises = Array(3).fill(null).map(() => 
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: userPrompt }]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
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
            `この画像をベースに、システム指示に厳密に従ったサムネイルを作成してください。テキストは日本語で、特に視認性とコントラストを最大化してください。\n\n動画タイトル（文脈用）: 「${title}」\nサムネイル用キャッチコピー: 「${catchphrase}」`,
            `この画像をベースに、システム指示に厳密に従ったサムネイルを作成してください。特に「感情の強調」の原則を最大限に活用し、視聴者の感情を強く揺さぶるデザインにしてください。\n\n動画タイトル（文脈用）: 「${title}」\nサムネイル用キャッチコピー: 「${catchphrase}」`,
            `この画像をベースに、システム指示に厳密に従ったサムネイルを作成してください。特に「色のハイライト」の原則を使い、キャッチコピー内のパワーワードが最も際立つデザインにしてください。\n\n動画タイトル（文脈用）: 「${title}」\nサムネイル用キャッチコピー: 「${catchphrase}」`
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
                    systemInstruction: SYSTEM_INSTRUCTION,
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