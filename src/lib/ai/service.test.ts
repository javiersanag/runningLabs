import { askCoach } from './service';

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockImplementation(async (prompt: string) => {
                        let result = { message: "neutral", actionItems: ["Aerobic Maintenance Run"] };

                        if (prompt.includes("Form (TSB): -25")) {
                            result = { message: "High Risk", actionItems: ["Schedule a Rest Day"] };
                        } else if (prompt.includes("Form (TSB): 15")) {
                            result = { message: "You are fresh and ready", actionItems: ["Interval Session", "Tempo Run"] };
                        } else if (prompt.includes("Fitness (CTL): 65")) {
                            result = { message: "Fitness: 65", actionItems: ["Increase Weekly Volume by 10%"] };
                        } else if (prompt.includes("meaning of life")) {
                            result = { message: "Consistency is King", actionItems: [], sources: [] } as any;
                        }

                        return {
                            response: {
                                text: () => JSON.stringify(result)
                            }
                        };
                    })
                })
            };
        })
    };
});

describe('AI Coach Service', () => {
    // Determine TSB thresholds from code:
    // < -20: High Risk
    // > 10: Fresh
    // else: Neutral

    it('should recommend rest when TSB is very low (High Risk)', async () => {
        const context = {
            ctl: 50,
            atl: 75,
            tsb: -25, // < -20
            recentActivities: []
        };
        const response = await askCoach("Am I ready to train?", context);

        expect(response.message).toContain("High Risk");
        expect(response.actionItems).toContain("Schedule a Rest Day");
    });

    it('should recommend high intensity when TSB is high (Fresh)', async () => {
        const context = {
            ctl: 50,
            atl: 35,
            tsb: 15, // > 10
            recentActivities: []
        };
        const response = await askCoach("Am I ready to train?", context);

        expect(response.message).toContain("fresh and ready");
        expect(response.actionItems).toEqual(expect.arrayContaining([
            expect.stringMatching(/Interval Session/),
            expect.stringMatching(/Tempo Run/)
        ]));
    });

    it('should give neutral advice when TSB is moderate', async () => {
        const context = {
            ctl: 50,
            atl: 50,
            tsb: 0, // Between -20 and 10
            recentActivities: []
        };
        const response = await askCoach("Am I ready to train?", context);

        expect(response.message).toContain("neutral");
        expect(response.actionItems).toContain("Aerobic Maintenance Run");
    });

    it('should report fitness metrics when asked about progress', async () => {
        const context = {
            ctl: 65.4,
            atl: 65.4,
            tsb: 0,
            recentActivities: []
        };
        const response = await askCoach("How is my fitness progress?", context);

        // Math.round(65.4) -> 65
        expect(response.message).toContain("Fitness");
        expect(response.message).toContain("65");
        expect(response.actionItems).toContain("Increase Weekly Volume by 10%");
    });

    it('should provide default response for unknown queries', async () => {
        const context = { ctl: 0, atl: 0, tsb: 0, recentActivities: [] };
        const response = await askCoach("What is the meaning of life?", context);

        expect(response.message).toContain("Consistency is King");
        expect(response.sources).toBeDefined();
    });
});
