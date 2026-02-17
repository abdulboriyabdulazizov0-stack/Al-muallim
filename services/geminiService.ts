
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Siz Al-Mu'allim platformasining sun'iy intellekt o'qituvchisiz. 
Sizning asosiy vazifangiz o'quvchilarga (7 yoshdan 60 yoshgacha) Arab tili grammatikasi (Nahv va Sarf) hamda Tajvid qoidalarini o'rgatishdir.

MUHIM QOIDALAR:
1. SAVOLLARGA ASOSAN O'ZBEK TILIDA JAVOB BERING.
2. Har bir qoidani sodda, tushunarli tilda va misollar bilan tushuntiring.
3. Arabcha matnlarni yozganda doimo harakatlari bilan yozing.
4. Tajvid bo'yicha savollarda harflarning maxraji va sifatlariga alohida e'tibor bering.
5. Grammatika bo'yicha savollarda gaplarni tahlil (i'rob) qilib bering.
`;

// Fix: Use the correct parameter structure for generateContent and ensure a fresh AI instance is used.
export const askAiTutor = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return "Uzr, hozirda ulanishda muammo bo'ldi.";
  }
};

// Fix: Corrected contents structure to { parts: [...] } for multimodal input.
export const analyzeRecitation = async (base64Audio: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: base64Audio,
            },
          },
          {
            text: "Ushbu audio yozuvni eshitib ko'ring va arab tili tajvid qoidalari bo'yicha fikr bering. Talaffuz aniqligi, madda qoidalari va harflarning maxrajiga e'tibor qarating. Javobni o'zbek tilida bering.",
          },
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Audio Analysis Error:", error);
    return "Audio tahlilida xatolik yuz berdi.";
  }
};
