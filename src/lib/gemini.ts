import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Anthropol.io AI Oracle
 * 
 * High-sovereignty biometric audit layer powered by Gemini 3 Flash.
 * Performs deep-scan analysis of cardiovascular telemetry and document integrity.
 */

export const aiOracle = {
  /**
   * Performs real-time liveness analysis on a single frame + biometric metadata.
   * Detects: Screen re-broadcast, Moire interference, Deepfake articulation.
   */
  async verifyLiveness(base64Image: string, telemetry: any) {
    try {
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      };

      const textPart = {
        text: `PERFORM HIGH-SOVEREIGNTY LIVENESS AUDIT.
        
        SUBJECT ROLE: Identity Verification via Biometric Pulse.
        
        ANALYSIS PARAMETERS:
        1. RE-BROADCAST: Detect digital screens, moiré interference, or bezels.
        2. DEEPFAKE ARTICULATION: Check for chin/cheek boundary ghosting and unnatural sync of eyeball glints.
        3. BIOMETRIC CONSISTENCY: Subject has reported ${telemetry.bpm} BPM. Validate skin tone modulation in accordance with natural micro-expressions.
        
        OUTPUT JSON:
        {
          "isHuman": boolean,
          "confidence": float,
          "signals": {
            "texture": "natural|synthetic",
            "biological": "stable|unstable",
            "liveness": "verified|rejected"
          }
        }`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [imagePart, textPart] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      console.error("AI Oracle Error:", error);
      if (error?.status === 429 || error?.message?.includes('429')) {
        throw new Error('AI_ORACLE_RATE_LIMIT');
      }
      throw new Error('AI_ORACLE_TIMEOUT');
    }
  },

  async verifyDocument(docBase64: string, faceBase64: string) {
    try {
      const docPart = {
        inlineData: { mimeType: "image/jpeg", data: docBase64 }
      };
      const facePart = {
        inlineData: { mimeType: "image/jpeg", data: faceBase64 }
      };

      const prompt = {
        text: `PERFORM IDENTITY CROSS-VERIFICATION AUDIT.
        
        TASKS:
        1. EXTRACT: Full Name, ID Expiration Date, Document Type from the ID card.
        2. CROSS-MATCH: Compare the portrait on the ID card with the live face capture.
        3. INTEGRITY: Detect if the ID is a physical card or a photo-of-a-screen.
        
        OUTPUT JSON:
        {
          "matchScore": float (0-1),
          "extractedData": {
            "fullName": string,
            "expiry": string,
            "docType": string
          },
          "isAuthentic": boolean,
          "summary": string
        }`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [docPart, facePart, prompt] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      console.error("ID Verification Error:", error);
      if (error?.status === 429 || error?.message?.includes('429')) {
        throw new Error('AI_ORACLE_RATE_LIMIT');
      }
      throw new Error('AI_ORACLE_TIMEOUT');
    }
  }
};
