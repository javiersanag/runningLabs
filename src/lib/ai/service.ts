import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";

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
        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Gemini API Error", error);
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
        logger.info("Gemini Insight Response", jsonString);
        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Gemini Insight API Error", error);
        return {
            message: "Analyze your training patterns to see your current trend.",
            actionItems: ["Keep training consistently"]
        };
    }
}

export async function generateActivityOneLiner(context: string): Promise<string> {
    const prompt = `
        You are an expert endurance sports coach. 
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
        logger.error("Gemini Activity Insight Error", error);
        return "Great effort! Keep up the consistency.";
    }
}

/**
 * Parses race details from raw HTML content scraped from a race website.
 */
export async function analyzeRaceContent(html: string): Promise<any> {
    const prompt = `
        You are an endurance sports data analyst. I will provide you with a raw HTML/Text dump of a race website.
        Your goal is to extract the following information in a structured JSON format:
        - name: The name of the race
        - date: The date of the race (ISO format if possible)
        - distances: An array of available distances at this event. Each item: { "distance": number in km, "label": string e.g. "Marathon", "5K" }
        - elevationGain: Total elevation gain in meters for the main/longest distance (number, if found)
        - profile: A short description of the course profile (e.g. "Flat and fast", "Hilly trail", "High altitude road")
        - location: City and country (if found)

        If any field is missing, use null.
        HTML Content:
        ${html.substring(0, 50000)} // Truncate to avoid context window issues

        Only return the JSON object. No markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Analyze Race Error", error);
        return null;
    }
}

/**
 * Predicts race and benchmark times based on current fitness and course profile.
 */
export async function predictPerformance(context: CoachContext, raceDetails?: any): Promise<any> {
    const { ctl, atl, tsb } = context;
    const prompt = `
        You are an expert running performance analyst. 
        Based on the athlete's current fitness metrics:
        - CTL (Fitness): ${Math.round(ctl)}
        - ATL (Fatigue): ${Math.round(atl)}
        - TSB (Form): ${Math.round(tsb)}

        Predict their current target times for the following benchmark distances:
        - 5K
        - 10K
        - Half Marathon
        
        ${raceDetails ? `Also, predict their time for this specific race:
        - Race Name: ${raceDetails.name}
        - Distance: ${raceDetails.distance} km
        - Elevation Gain: ${raceDetails.elevationGain} m
        - Profile: ${raceDetails.profile}` : ""}

        Use standard power-law or Riegel's formula adjusted for the athlete's aerobic base (CTL).
        Note: Higher CTL generally allows for better endurance and closer adherence to predicted times on longer distances.
        Negative TSB (Fatigue) should slightly penalize predictions unless it's a "tapered" prediction.

        Format your response as a JSON object:
        {
          "benchmarks": {
            "5k": "MM:SS",
            "10k": "MM:SS",
            "half": "HH:MM:SS"
          },
          "racePrediction": "HH:MM:SS" // or null if no raceDetails
        }
        Only return the JSON object.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Predict Performance Error", error);
        return null;
    }
}

/**
 * Generates a structured training plan based on goal and current fitness.
 */
export async function createTrainingPlan(context: CoachContext, goal: any): Promise<any> {
    const { ctl, atl, tsb, recentActivities } = context;
    const prompt = `
        You are an expert endurance sports coach. 
        Create a structured 8-week training plan for an athlete with the following profile:
        - Current Fitness (CTL): ${Math.round(ctl)}
        - Current Fatigue (ATL): ${Math.round(atl)}
        - Current Form (TSB): ${Math.round(tsb)}
        - Recent Load Trend: ${recentActivities.length} sessions in last 45 days.

        Athlete Goal:
        - Name: ${goal.name}
        - Type: ${goal.type}
        - Target Metric: ${goal.targetMetric}
        - Target Date: ${goal.targetDate}
        ${goal.raceDetails ? `- Race Elevation: ${goal.raceDetails.elevationGain}m` : ""}

        The plan must include:
        - 8 weeks of training.
        - Each week should have 3-6 sessions.
        - Session types: 'Easy Run', 'Intervals', 'Tempo', 'Long Run', 'Rest'.
        - For each session, specify: 'day' (1-7), 'type', 'description', 'durationMinutes', 'intensity' (base/moderate/hard).
        - Ensure a logical progression (increasing volume/intensity) followed by a 1-2 week taper if it's a Race goal.

        Format the response as a JSON object:
        {
          "planName": "Name for the plan",
          "weeks": [
            {
              "weekNumber": 1,
              "focus": "Aerobic Base",
              "sessions": [
                { "day": 1, "type": "Rest", "description": "Full recovery", "durationMinutes": 0, "intensity": "base" },
                { "day": 2, "type": "Easy Run", "description": "30 mins at aerobic pace", "durationMinutes": 30, "intensity": "base" }
                ...
              ]
            }
            ...
          ]
        }
        Only return the JSON object.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        return JSON.parse(jsonString);
    } catch (error) {
        logger.error("Create Training Plan Error", error);
        return null;
    }
}
