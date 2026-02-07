import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

/**
 * AI Coach Service
 * Uses Gemini to provide training advice based on athlete metrics.
 */

interface CoachResponse {
    message: string;
    sources?: string[];
    actionItems?: string[];
}

export interface CoachContext {
    ctl: number;
    atl: number;
    tsb: number;
    recentActivities: {
        name: string;
        type: string;
        date: string;
        distance: number | null;
        tss: number | null;
    }[];
}

export async function askCoach(query: string, context: CoachContext): Promise<CoachResponse> {
    const { ctl, atl, tsb, recentActivities } = context;

    const prompt = `
You are an expert endurance sports coach (Running/Cycling).
Your athlete asks: "${query}"

Here is their current physiological status:
- Fitness (CTL): ${Math.round(ctl)}
- Fatigue (ATL): ${Math.round(atl)}
- Form (TSB): ${Math.round(tsb)}
${recentActivities && recentActivities.length > 0 ? `- Recent Activities: ${JSON.stringify(recentActivities)}` : ''}

Based on this data, provide a concise, encouraging, and scientifically sound response.
If the TSB is very negative (<-20), suggest recovery.
If the TSB is positive (>10), suggest intensity.
Otherwise, suggest maintenance or steady training.

Format your response as a JSON object with the following structure:
{
  "message": "The main response text to the athlete.",
  "actionItems": ["Short actionable bullet point 1", "Short actionable bullet point 2"]
}
Only return the JSON object. Do not wrap it in markdown code blocks.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            message: "I'm having trouble analyzing your data right now. Please try again later.",
            actionItems: ["Check back later"]
        };
    }
}
