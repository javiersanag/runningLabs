import {
  calculateTSS,
  calculateTRIMP,
  calculateNextCTL,
  calculateNextATL,
  calculateTSB,
  calculateACWR_Simple,
  calculateACWR_EWMA,
} from './metrics';

describe('Metrics Library', () => {
  describe('calculateTSS', () => {
    it('should calculate TSS correctly for standard inputs', () => {
      // Example: 1 hour (3600s), NP=200, FTP=250
      // IF = 200/250 = 0.8
      // TSS = (3600 * 200 * 0.8) / (250 * 36) = 576000 / 9000 = 64
      const tss = calculateTSS(3600, 200, 250);
      expect(tss).toBeCloseTo(64, 1);
    });

    it('should return 0 if FTP is 0', () => {
      expect(calculateTSS(3600, 200, 0)).toBe(0);
    });

    it('should handle 0 duration', () => {
      expect(calculateTSS(0, 200, 250)).toBe(0);
    });
  });

  describe('calculateTRIMP', () => {
    it('should calculate TRIMP for males correctly', () => {
      // Male: b = 1.92
      // 60 mins, AvgHR=150, MaxHR=190, RestHR=60
      // HR Reserve = 130
      // Fraction = (150-60)/130 = 90/130 ≈ 0.6923
      // TRIMP = 60 * 0.6923 * 0.64 * exp(1.92 * 0.6923)
      //       = 26.58 * exp(1.329)
      //       = 26.58 * 3.778
      //       ≈ 100.4
      const trimp = calculateTRIMP(60, 150, 190, 60, 'male');
      expect(trimp).toBeGreaterThan(95);
      expect(trimp).toBeLessThan(105);
    });

    it('should calculate TRIMP for females correctly', () => {
      // Female: b = 1.67
      const trimp = calculateTRIMP(60, 150, 190, 60, 'female');
      // Should be slightly lower than male for same HR due to lower 'b' factor in exponent
      expect(trimp).toBeGreaterThan(0);
    });

    it('should return 0 if MaxHR equals RestHR', () => {
      expect(calculateTRIMP(60, 150, 60, 60, 'male')).toBe(0);
    });
  });

  describe('calculateNextCTL', () => {
    it('should calculate next CTL correctly (fitness increases)', () => {
        // prevCTL = 50, dailyLoad = 100
        // tau = 42, decay = exp(-1/42) ≈ 0.9765
        // (100 * (1-0.9765)) + (50 * 0.9765)
        // (100 * 0.0235) + (48.825)
        // 2.35 + 48.825 ≈ 51.175
        const ctl = calculateNextCTL(50, 100);
        expect(ctl).toBeGreaterThan(50);
        expect(ctl).toBeLessThan(52);
    });

    it('should decrease CTL if daily load is 0', () => {
        const ctl = calculateNextCTL(50, 0);
        expect(ctl).toBeLessThan(50);
    });
  });

  describe('calculateNextATL', () => {
    it('should calculate next ATL correctly (fatigue changes faster)', () => {
        // prevATL = 50, dailyLoad = 100
        // tau = 7, decay = exp(-1/7) ≈ 0.8669
        // (100 * (1-0.8669)) + (50 * 0.8669)
        // (100 * 0.1331) + (43.345)
        // 13.31 + 43.345 ≈ 56.655
        const atl = calculateNextATL(50, 100);
        expect(atl).toBeGreaterThan(55); // Rises faster than CTL
        expect(atl).toBeLessThan(58);
    });
  });

  describe('calculateTSB', () => {
    it('should be negative when fatigued (ATL > CTL)', () => {
      expect(calculateTSB(50, 70)).toBe(-20);
    });
    
    it('should be positive when fresh (CTL > ATL)', () => {
      expect(calculateTSB(70, 50)).toBe(20);
    });
  });

  describe('calculateACWR_Simple', () => {
      it('should calculate simple ratio correctly', () => {
          // Last 7 days sum = 700 (avg 100/day)
          // Last 28 days sum = 2800 (avg 100/day)
          // 700 / (2800 / 4) = 700 / 700 = 1.0
          expect(calculateACWR_Simple(700, 2800)).toBeCloseTo(1.0);
      });

      it('should detect spike', () => {
          // Last 7 days = 1400 (avg 200/day - doubled)
          // Last 28 days = 2800 (avg 100/day)
          // 1400 / 700 = 2.0
          expect(calculateACWR_Simple(1400, 2800)).toBeCloseTo(2.0);
      });

      it('should return 0 if last28DaysSum is 0', () => {
          expect(calculateACWR_Simple(100, 0)).toBe(0);
      });
  });

  describe('calculateACWR_EWMA', () => {
      it('should calculate ratio of ATL/CTL', () => {
          expect(calculateACWR_EWMA(100, 50)).toBe(2.0);
      });

      it('should return 0 if CTL is 0', () => {
          expect(calculateACWR_EWMA(100, 0)).toBe(0);
      });
  });
});
