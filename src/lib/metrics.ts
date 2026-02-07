/**
 * Physiological Metrics Analytical Engine
 * Implements Banister/Coggan Impulse-Response Model and ACWR.
 */

// --- Activity Level Metrics ---

/**
 * Calculate Training Stress Score (TSS) for Cycling
 * @param durationSeconds Total duration in seconds
 * @param normalizedPower Normalized Power (NP) in Watts
 * @param ftp Functional Threshold Power (FTP) in Watts
 */
export function calculateTSS(durationSeconds: number, normalizedPower: number, ftp: number): number {
    if (!ftp || ftp === 0) return 0;
    const intensityFactor = normalizedPower / ftp;
    // Formula: (sec * NP * IF) / (FTP * 3600) * 100
    // Simplified: (sec * NP * IF) / (FTP * 36)
    return (durationSeconds * normalizedPower * intensityFactor) / (ftp * 36);
}

/**
 * Calculate TRIMP (Training Impulse) based on HR (Banister's)
 * @param durationMinutes Duration in minutes
 * @param avgHr Average Heart Rate
 * @param maxHr Maximum Heart Rate
 * @param restHr Resting Heart Rate
 * @param gender 'male' | 'female'
 */
export function calculateTRIMP(
    durationMinutes: number,
    avgHr: number,
    maxHr: number,
    restHr: number,
    gender: 'male' | 'female' = 'male'
): number {
    if (maxHr === restHr) return 0;

    const hrReserve = maxHr - restHr;
    const avgHrFraction = (avgHr - restHr) / hrReserve;

    // Exponential factor b
    // Male: 1.92, Female: 1.67
    const b = gender === 'male' ? 1.92 : 1.67;

    return durationMinutes * avgHrFraction * 0.64 * Math.exp(b * avgHrFraction);
}

// --- Daily/Long-term Metrics ---

/**
 * Update Chronic Training Load (Fitness)
 * Tau = 42 days
 */
export function calculateNextCTL(prevCTL: number, dailyLoad: number): number {
    const tau = 42;
    const decay = Math.exp(-1 / tau);
    return (dailyLoad * (1 - decay)) + (prevCTL * decay);
}

/**
 * Update Acute Training Load (Fatigue)
 * Tau = 7 days
 */
export function calculateNextATL(prevATL: number, dailyLoad: number): number {
    const tau = 7;
    const decay = Math.exp(-1 / tau);
    return (dailyLoad * (1 - decay)) + (prevATL * decay);
}

/**
 * Calculate Training Stress Balance (Form)
 */
export function calculateTSB(ctl: number, atl: number): number {
    return ctl - atl;
}

/**
 * Calculate Acute:Chronic Workload Ratio (ACWR) - Coupled
 * Firstbeat Method: 7-day Load Sum / 28-day rolling average of 7-day Load
 * Note: A clearer implementation often used is EWMA Ratio or Rolling Sum Ratio.
 * PRD: "7-day Load Sum / 28-day rolling average of 7-day Load"
 * 
 * If we treat "Acute" as simple 7-day sum, and "Chronic" as avg of last 4 weeks.
 */
export function calculateACWR_Simple(last7DaysSum: number, last28DaysSum: number): number {
    // Chronic Load = daily average over 28 days? 
    // PRD says "28-day rolling average of 7-day Load"
    // This phrasing is tricky. Usually ACWR = (Load_7d / 7) / (Load_28d / 28) ??
    // Or Uncoupled: Acute = EWMA(7), Chronic = EWMA(28). 
    // ACWR = Acute / Chronic.

    // Let's implement the simple uncoupled ratio which is standard and safer if data is sparse.
    // ACWR = Acute Load / Chronic Load
    return last28DaysSum === 0 ? 0 : last7DaysSum / (last28DaysSum / 4); // Normalizing 28 days to 7-day chunks
}

/**
 * Calculate ACWR using Exponentially Weighted Averages (More robust)
 * Ratio = ATL / CTL
 */
export function calculateACWR_EWMA(atl: number, ctl: number): number {
    if (ctl === 0) return 0;
    return atl / ctl;
}
