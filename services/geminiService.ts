import { GoogleGenAI, Type } from "@google/genai";
import { ContentArchitectInput, PresentationArchitectInput, ContentStrategyResult } from "../types";

// Safely access process.env to prevent crashes in environments where process is undefined
const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Models
const TEXT_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const cleanAndParseJSON = (text: string) => {
  try {
    // Remove markdown code blocks if present (e.g. ```json ... ```)
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    // Attempt to salvage if it's just a simple string
    throw new Error("Failed to parse AI response.");
  }
};

export const generateContentStrategy = async (input: ContentArchitectInput): Promise<ContentStrategyResult> => {
  const platformsList = input.platforms.join(', ');
  
  const prompt = `
    Content Idea: "${input.idea}"
    Target Audience Profile: ${input.audience.description}
    Demographics: ${input.audience.age}, ${input.audience.gender}, ${input.audience.location}
    Selected Platforms: ${platformsList}
  `;

  const systemInstruction = `
    You are an elite Social Media Strategist. Analyze the idea and generate content assets.
    You MUST return the response in strict JSON format matching the schema provided.
    Do not include markdown formatting or explanations outside the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                ideaScore: { type: Type.STRING, description: "Viral potential and value proposition analysis (2-3 sentences)" },
                seoAnalysis: { type: Type.STRING, description: "Keywords, search intent, and trending topics" },
                nicheFit: { type: Type.STRING, description: "How this fits the specific niche" },
                audienceBehavior: { type: Type.STRING, description: "How this specific demographic consumes this content" }
              },
              required: ["ideaScore", "seoAnalysis", "nicheFit", "audienceBehavior"]
            },
            platforms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platformName: { type: Type.STRING },
                  title: { type: Type.STRING, description: "High CTR Hook/Headline" },
                  content: { type: Type.STRING, description: "The caption, script outline, or tweet body" },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  thumbnailDescription: { type: Type.STRING, description: "Detailed visual description for an AI image generator" }
                },
                required: ["platformName", "title", "content", "hashtags", "thumbnailDescription"]
              }
            }
          },
          required: ["analysis", "platforms"]
        }
      }
    });

    if (!response.text) throw new Error("No response text");
    return cleanAndParseJSON(response.text) as ContentStrategyResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content strategy.");
  }
};

export const generateThumbnail = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: `High quality, highly detailed, 4k, youtube thumbnail style: ${prompt}` }],
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if no inline data is found (sometimes models return text refusal)
    console.warn("No image data found in response");
    return "";
  } catch (error) {
    console.error("Image Gen Error:", error);
    return ""; // Return empty string to prevent app crash
  }
};

export const removeImageBackground = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Generate a new image of the main subject from this picture isolated on a transparent background.',
          },
        ],
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      // 1. Look for image data
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      // 2. Look for text (refusal/explanation)
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
             console.warn("Model Refusal/Text Response:", part.text);
             throw new Error(part.text);
        }
      }
    }
    throw new Error("No processed image returned from API");
  } catch (error) {
    console.error("Background Removal Error:", error);
    throw error;
  }
};

export const generateAvatar = async (base64Image: string, mimeType: string, style: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            // Simplified prompt to reduce rejection rate
            text: `Create a creative artistic illustration based on this image. Apply the following art style: ${style}. The output should be a high-quality artistic recreation.`,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    
    if (!candidate) {
        throw new Error("No response from AI model.");
    }

    // Check specifically for Safety or other blocking reasons
    if (candidate.finishReason === 'SAFETY') {
        throw new Error("Safety filters blocked the generation. Please try a different photo.");
    }

    if (candidate.finishReason === 'OTHER') {
        throw new Error("The model declined to process this image. It may contain elements that trigger safety filters. Please try a different photo.");
    }

    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      for (const part of candidate.content.parts) {
        if (part.text) {
             throw new Error(part.text);
        }
      }
    }
    
    if (candidate.finishReason) {
       throw new Error(`Generation failed with reason: ${candidate.finishReason}`);
    }

    throw new Error("No avatar generated.");
  } catch (error) {
    console.error("Avatar Gen Error:", error);
    throw error;
  }
};

export const generatePresentationDeck = async (input: PresentationArchitectInput): Promise<string> => {
  const prompt = `
    Input Parameters:
    Topic: ${input.topic}
    Description: ${input.description}
    Color Theme: ${input.colorTheme}
  `;

  const systemInstruction = `
    You are a Professional Presentation Designer and Storyteller. You translate topics and themes into structured, visually cohesive slide decks.

    Your Output Requirements (Markdown Format):
    
    Slide 1: Title Slide (Catchy title, subtitle, and layout suggestion based on theme).
    Slide 2: Agenda/Overview.
    Slides 3-8: Content Slides (For each slide, provide: Slide Title, 3-4 Bullet points, and a 'Visual Suggestion' that matches the color theme).
    Slide 9: Conclusion & Call to Action.
    Design Notes: Advice on typography and image styles to keep the deck consistent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate presentation deck.");
  }
};

export const processCommunityAction = async (userActionText: string, currentTokens: number): Promise<string> => {
  const prompt = `
    User Claim: "${userActionText}"
    Current Token Balance: ${currentTokens}
  `;

  const systemInstruction = `
    You are a Community Growth Manager. Your job is to facilitate a "Support-for-Support" ecosystem.
    
    The Logic:
    1. **Verification**: Analyze the user's claim for sincerity. If it feels spammy or too vague (e.g., just "done"), express skepticism but be polite. If it seems legitimate, approve it.
    2. **Token Management**: 
       - If approved, simulate adding 10-50 tokens based on effort.
       - If rejected, 0 tokens.
       - Tell the user their new total and what they can "buy" (e.g., 50 likes on a YouTube video costs 100 tokens).
    3. **Engagement Advice**: Give the user 2 tips on how to keep those new followers engaged so they don't unfollow.
    
    Tone: Encouraging, community-focused, and strict about "fair play."
    Output Format: Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process community action.");
  }
};

export const generateAvatarVideo = async (
  avatarBase64: string, 
  avatarMimeType: string
): Promise<string> => {
  try {
    // Veo requires the user to select their own API key.
    // We MUST create a new instance to ensure we use the latest key if it was just selected.
    // Try to get key from various sources
    let currentApiKey = '';
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      currentApiKey = process.env.API_KEY;
    } else if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      currentApiKey = (window as any).process.env.API_KEY;
    }
    
    // Fallback to build-time env if runtime not found
    if (!currentApiKey && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        currentApiKey = process.env.GEMINI_API_KEY;
    }

    const localAi = new GoogleGenAI({ apiKey: currentApiKey || '' });
    
    // Construct the prompt
    const prompt = `Animate this character to look natural and alive.`;

    console.log("Starting Veo generation...");

    // Initial generation request
    // Switching to fast model for better responsiveness and compatibility
    let operation = await localAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: avatarBase64,
        mimeType: avatarMimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });

    console.log("Veo operation started:", operation);

    // Poll for completion
    // The operation object has a 'done' property and a 'name' (id).
    // We need to poll getVideosOperation.
    
    while (!operation.done) {
      console.log("Polling Veo status...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await localAi.operations.getVideosOperation({ operation: operation });
    }

    console.log("Veo operation complete:", operation);

    // Extract video URI
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("Video generation completed but no video URI was returned.");
    }

    // The URI is a Google Cloud Storage URI that requires the API key to fetch.
    const response = await fetch(videoUri, {
      method: 'GET',
      headers: {
        'x-goog-api-key': currentApiKey || '', // Use the fresh API key
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Avatar Video Gen Error:", error);
    // Improve error message if it's about the key
    if (error.message?.includes("key") || error.toString().includes("key") || error.message?.includes("403") || error.message?.includes("401")) {
       throw new Error("Video generation requires a paid API key. Please ensure you have selected a valid key.");
    }
    throw error;
  }
};