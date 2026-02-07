/**
 * Mock AI Coach Service
 * Simulates RAG and LLM responses based on athlete metrics.
 */

interface CoachResponse {
    message: string;
    sources?: string[];
    actionItems?: string[];
}

export async function askCoach(query: string, context: any): Promise<CoachResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { ctl, tsb, recentActivities } = context;

    // Simple rule-based logic to mock "Intelligence"

    if (query.toLowerCase().includes("ready") || query.toLowerCase().includes("train")) {
        if (tsb < -20) {
            return {
                message: "Your Training Stress Balance (TSB) is quite low (-20). You are in a 'High Risk' zone for overreaching. I recommend a light recovery ride or complete rest today to let your fatigue subside.",
                actionItems: ["Schedule a Rest Day", "Focus on Sleep (8h+)"]
            };
        } else if (tsb > 10) {
            return {
                message: "You are fresh and ready to go! Your TSB is positive. This is a great day for a high-intensity interval session or a tempo run to build fitness.",
                actionItems: ["Interval Session: 4x8min Threshold", "Tempo Run: 45min"]
            };
        } else {
            return {
                message: "Your readiness is neutral. You can train normally today, but pay attention to how you feel during the warm-up.",
                actionItems: ["Aerobic Maintenance Run"]
            };
        }
    }

    if (query.toLowerCase().includes("fitness") || query.toLowerCase().includes("progress")) {
        return {
            message: `Your Chronic Training Load (Fitness) is currently ${Math.round(ctl)}. You've been consistent lately. To push this higher, consider increasing volume by ~10% next week.`,
            actionItems: ["Increase Weekly Volume by 10%", "Add one Long Run"]
        };
    }

    // Default Fallback
    return {
        message: "I analyzed your recent training data. You are maintaining a consistent load. Remember that 'Consistency is King'. How else can I help you regarding your training plan or recovery?",
        sources: ["Dr. Stephen Seiler - Polarization", "Joe Friel - Training Bible"]
    };
}
