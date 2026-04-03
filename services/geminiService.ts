import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a visualization of a product within a user-uploaded context image.
 * 
 * @param productImageUrl Base64 or URL of the product.
 * @param userContextImageBase64 Base64 string of the user's photo (room or person).
 * @param promptDescription Description of how to blend them.
 */
export const visualizeProductInContext = async (
  productImageUrl: string,
  userContextImageBase64: string,
  promptDescription: string
): Promise<string> => {
  try {
    // Helper to fetch and convert URL to base64 if needed
    const getBase64FromUrl = async (url: string): Promise<string> => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data url prefix usually (data:image/jpeg;base64,)
          resolve(base64String.split(',')[1]); 
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Prepare Product Image data
    let productBase64 = productImageUrl;
    if (productImageUrl.startsWith('http')) {
      productBase64 = await getBase64FromUrl(productImageUrl);
    } else if (productImageUrl.includes('base64,')) {
      productBase64 = productImageUrl.split(',')[1];
    }

    // Prepare User Context Image data
    let contextBase64 = userContextImageBase64;
    if (userContextImageBase64.includes('base64,')) {
      contextBase64 = userContextImageBase64.split(',')[1];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: "Act as a professional product photographer and photo editor." },
          { text: promptDescription },
          { text: "Image 1 is the Reference Context (User's photo). Image 2 is the Product to insert." },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: contextBase64
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: productBase64
            }
          }
        ]
      }
    });

    // Check for image in response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No generated image found in response");

  } catch (error) {
    console.error("Gemini Visualization Error:", error);
    throw error;
  }
};