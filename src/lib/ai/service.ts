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
export async function createTrainingPlan(context: CoachContext, goal: any, allGoals: any[] = []): Promise<any> {
    const { ctl, atl, tsb, recentActivities } = context;
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksToGoal = Math.ceil(diffDays / 7);
    const planDurationWeeks = Math.min(weeksToGoal, 8); // Max 8 weeks

    // Format other goals for context
    const otherGoalsContext = allGoals
        .filter(g => g.id !== goal.id && new Date(g.targetDate) > today)
        .map(g => `- ${g.name} (${g.type}) on ${g.targetDate}`)
        .join("\n");

    const prompt = `
        You are an expert endurance sports coach.
        Create a structured training plan starting from TODAY (${today.toISOString().split('T')[0]}).

        Athlete Profile:
        - Current Fitness (CTL): ${Math.round(ctl)}
        - Recent Load: ${recentActivities.length} sessions in last 45 days.

        Primary Goal:
        - Name: ${goal.name}
        - Date: ${goal.targetDate} (${weeksToGoal} weeks away)
        - Elevation: ${goal.raceDetails ? goal.raceDetails.elevationGain + 'm' : "N/A"}

        ${otherGoalsContext ? `Other Upcoming Races (Integrate these/Treat as tune-ups):\n${otherGoalsContext}` : ""}

        Constraints:
        - Plan Duration: Exactly ${planDurationWeeks} weeks.
        - Start Date: ${today.toISOString().split('T')[0]}.
        - End Date: ${planDurationWeeks === weeksToGoal ? goal.targetDate : "8 weeks from now"}.
        - Assume MONDAY is the first day of the week (Day 1).
        - Update the plan to account for specific race dates if they fall within this period.

        Output Requirements:
        - JSON format.
        - For each session, you MUST provide the specific "date" (YYYY-MM-DD).
        - Session types: 'Easy Run', 'Intervals', 'Tempo', 'Long Run', 'Rest', 'Race', 'Tune-up Race'.
        - Intensity: 'base', 'moderate', 'hard', 'race'.

        Format:
        {
          "planName": "8-Week Plan to ${goal.name}",
          "weeks": [
            {
              "weekNumber": 1,
              "focus": "Base Building",
              "sessions": [
                { "date": "2024-01-01", "day": "Monday", "type": "Rest", "description": "Recovery", "durationMinutes": 0, "intensity": "base" },
                ...
              ]
            }
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
