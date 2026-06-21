/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fallback to simulation.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 1. Analyze Spoken Transcript / Live Sermon endpoint
app.post("/api/ai/analyze-speech", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: "Transcript is required and must be a string." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response for offline or simulated key
      return res.json({
        scriptures: [
          {
            reference: "Psalm 23:1",
            text: "The Lord is my shepherd; I shall not want.",
            confidence: 0.98
          }
        ],
        songThemeSuggestions: [
          {
            title: "Goodness of God",
            reason: "Mentions God's faithfulness and guidance, echoing the shepherd motif.",
            lyricsSnippet: "All my life You have been faithful, all my life You have been so so good..."
          }
        ],
        topic: "God's Guidance and Providence"
      });
    }

    const systemPrompt = `You are an expert church production assistant scanning the pastor's live spoken sermon transcript.
Identify:
1. Any specific or paraphrased Bible verses mentioned (e.g., PSALM 23, John 3:16, Matthew 6). Provide name of verse and fetch standard scripture text (ESV/NIV version).
2. Appropriate worship songs that fit the themes, keywords, or explicit lyrics mentioned (e.g. Goodness of God, Way Maker, Amazing Grace).
Provide highly focused and clear output in the specified JSON structure. Be accurate. If no scriptures are detected, leave the array empty.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Scan this live spoken transcript and pull out references: "${transcript}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scriptures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  reference: { type: Type.STRING, description: "Full scripture reference, e.g. John 3:16" },
                  text: { type: Type.STRING, description: "Full body verse text in ESV or NIV" },
                  confidence: { type: Type.NUMBER, description: "Confidence score (0.0 to 1.0)" }
                },
                required: ["reference", "text", "confidence"]
              }
            },
            songThemeSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Name of the worship song suggested" },
                  reason: { type: Type.STRING, description: "Short 1-sentence reason why this song matches the transcript" },
                  lyricsSnippet: { type: Type.STRING, description: "A famous line or chorus snippet from the song" }
                },
                required: ["title", "reason", "lyricsSnippet"]
              }
            },
            topic: { type: Type.STRING, description: "A quick 2-3 word topic summary of the text" }
          },
          required: ["scriptures", "songThemeSuggestions", "topic"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: error?.message || "Internal AI generation error" });
  }
});

// 2. Scripture Search / Semantic search endpoint
app.post("/api/ai/search-verse", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Query is required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Mock lookup fallback
      return res.json({
        reference: query.includes("3:16") ? "John 3:16" : "Romans 12:1",
        text: query.includes("3:16") 
          ? "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
          : "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God.",
        translation: "ESV"
      });
    }

    const systemPrompt = `You are a Bible search assistant. Convert the user's semantic query, search keywords, or verse reference into the exact scripture reference and full text. Ensure the text matches a readable translation like ESV or NIV.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search or find the text for: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reference: { type: Type.STRING, description: "Corrected/standardized Bible reference, e.g. John 3:16" },
            text: { type: Type.STRING, description: "Exact verses text" },
            translation: { type: Type.STRING, description: "Which translation was fetched, default 'ESV'" }
          },
          required: ["reference", "text", "translation"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Search Verse Error:", error);
    res.status(500).json({ error: error?.message || "Error searching for Bible verse semantically." });
  }
});

// Start the server and mount Vite configuration or serve static elements
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
