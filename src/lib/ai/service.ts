import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Updated model name to a likely valid one, or keep preview if sure

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
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            message: "I'm having trouble analyzing your data right now. Please try again later.",
            actionItems: ["Check back later"]
        };
    }
}

export async function generateTrainingInsight(context: CoachContext): Promise<CoachResponse> {
    const { ctl, atl, tsb, recentActivities } = context;

    const prompt = `
You are an expert endurance sports coach. Provide a periodic training insight for your athlete.
This is for a "Training Insight" widget on their dashboard.

Current Physiological Status:
- Fitness (CTL): ${Math.round(ctl)}
- Fatigue (ATL): ${Math.round(atl)}
- Form (TSB): ${Math.round(tsb)}
${recentActivities && recentActivities.length > 0 ? `- Recent Activities (Last 45 days): ${JSON.stringify(recentActivities)}` : ''}

Analyze the trends, ACWR (if applicable from context), and training load. 
Provide a high-level summary of their current status and 2-3 recommended actions.
Be technical but accessible.

Format your response as a JSON object:
{
  "message": "The training insight message.",
  "actionItems": ["Action 1", "Action 2"]
}
Only return JSON.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        console.log(jsonString);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini Insight API Error:", error);
        return {
            message: "Analyze your training patterns to see your current trend.",
            actionItems: ["Keep training consistently"]
        };
    }
}

export async function generateActivityOneLiner(context: string): Promise<string> {
    const prompt = `
        Analyze this activity in two short, punchy sentences (max 30 words each). 
        Focus on the effort, intensity, or a specific highlight. 
        Be encouraging but analytical. 
        Example: "Strong aerobic base building with consistent heart rate control."
        Context: ${context}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Activity Insight Error:", error);
        return "Great effort! Keep up the consistency.";
    }
}
