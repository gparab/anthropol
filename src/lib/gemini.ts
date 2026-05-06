
/**
 * Anthropol.io AI Oracle
 * 
 * High-sovereignty biometric audit layer.
 * Proxies calls to the secure server-side Gemini nodes.
 */

export const aiOracle = {
  /**
   * Performs real-time liveness analysis on a single frame + biometric metadata.
   */
  async verifyLiveness(base64Image: string, telemetry: any) {
    try {
      const response = await fetch('/api/ai/liveness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image, telemetry }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) throw new Error('AI_ORACLE_RATE_LIMIT');
        throw new Error(error.error || 'AI_ORACLE_TIMEOUT');
      }

      return await response.json();
    } catch (error: any) {
      console.error("AI Oracle Error:", error);
      throw error;
    }
  },

  async verifyDocument(docBase64: string, faceBase64: string) {
    try {
      const response = await fetch('/api/ai/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docBase64, faceBase64 }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) throw new Error('AI_ORACLE_RATE_LIMIT');
        throw new Error(error.error || 'AI_ORACLE_TIMEOUT');
      }

      return await response.json();
    } catch (error: any) {
      console.error("ID Verification Error:", error);
      throw error;
    }
  }
};
