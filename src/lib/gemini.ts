import { GoogleGenAI, Type } from "@google/genai";

/**
 * Anthropol.io AI Oracle
 * 
 * High-sovereignty biometric audit layer using direct Gemini SDK integration.
 */

const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });

export const aiOracle = {
  /**
   * Performs real-time liveness analysis on a single frame + biometric metadata.
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
        text: `OBJECTIVE FORENSIC AUDIT: Analyze the provided biometric frame for authenticity.

SUBJECT DATA:
- Reported Heart Rate: ${telemetry.bpm} BPM

EXAMINATION CRITERIA:
1. SPATIAL FREQUENCY ANALYSIS: Inspect for screen pixels, moiré patterns, or display borders indicating a rebroadcast attack.
2. ADVERSARIAL ARTIFACTS: Identify ghosting, blending inconsistencies, or unnatural texture transitions typical of high-fidelity deepfakes.
3. BIOMETRIC FIDELITY: Evaluate if skin tone modulations and micro-expressions align with the reported heart rate and natural human physiology.

Provide an impartial forensic assessment.`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isHuman: { type: Type.BOOLEAN, description: "Whether the subject appears to be a live human being." },
              confidence: { type: Type.NUMBER, description: "Statistical confidence in the evaluation (0.0 - 1.0)." },
              signals: {
                type: Type.OBJECT,
                properties: {
                  texture: { type: Type.STRING, description: "Assessment of surface texture (e.g., natural, synthetic, digital)." },
                  biological: { type: Type.STRING, description: "Assessment of biological consistency (e.g., rhythmic, static, chaotic)." },
                  liveness: { type: Type.STRING, description: "Final forensic classification (e.g., verified, high_risk, confirmed_spoof)." }
                },
                required: ["texture", "biological", "liveness"]
              }
            },
            required: ["isHuman", "confidence", "signals"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error: any) {
      console.error("AI Oracle Error:", error);
      throw error;
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
        contents: { parts: [docPart, facePart, prompt] },
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error: any) {
      console.error("ID Verification Error:", error);
      throw error;
    }
  },

  async runStressTest(threatId: string, imageBase64?: string, mimeType?: string) {
    try {
      // Rule-based check for known critical threat vectors
      const CRITICAL_VECTORS = ['camera_injection', 'master_face_bypass', 'telemetry_spoof'];
      const isCriticalVector = CRITICAL_VECTORS.includes(threatId);

      const prompt = `NEUTRAL ADVERSARIAL EVALUATION: You are a forensic computer vision system. 
Analyze the provided biometric presentation or threat ID to determine if it aligns with patterns identified in adversarial attacks (e.g., high-fidelity deepfakes, presentation masks, or screen rebroadcasts). 

THREAT CONTEXT: ${threatId}
CRITICALITY_FLAG: ${isCriticalVector ? 'HIGH' : 'NORMAL'}

Provide a balanced forensic analysis of the integrity of the presented asset.`;

      let contentsParts: any[] = [];
      
      if (imageBase64 && mimeType) {
        contentsParts = [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType
            }
          }
        ];
      } else {
        contentsParts = [
          { text: prompt },
          { text: `Analyze the theoretical properties of the attack vector: ${threatId}. Evaluate its plausibility and typical forensic indicators.` }
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              outcome: { type: Type.STRING, enum: ["PASSED", "REJECTED"], description: "The result of the forensic evaluation." },
              confidence: { type: Type.NUMBER, description: "Confidence score (0.0 - 1.0)." },
              signal: { type: Type.STRING, description: "Description of identified forensic signal." },
              vector: { type: Type.STRING, description: "Categorized attack vector." }
            },
            required: ["outcome", "confidence", "signal", "vector"]
          }
        }
      });

      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      console.error('Stress test failed:', error);
      throw error;
    }
  }
};
