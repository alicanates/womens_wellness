import { Injectable } from '@nestjs/common';

export interface PeriodCycle {
  startDate: string;
  endDate?: string;
}

export interface PredictionResult {
  nextStart: Date;
  fertile: {
    start: Date;
    end: Date;
  };
  averageCycleLength: number;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Period Prediction Service
 * Implements moving average algorithm from CLAUDE.md §40.1
 */
@Injectable()
export class PredictionService {
  /**
   * Predict next period based on historical cycles
   * Algorithm: Moving average of last 6 cycles
   */
  predict(cycles: PeriodCycle[]): PredictionResult | null {
    if (cycles.length === 0) {
      return null;
    }

    // Sort cycles by date (newest first)
    const sortedCycles = [...cycles].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // Take last 6 cycles for moving average
    const recentCycles = sortedCycles.slice(0, 6);

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    for (let i = 0; i < recentCycles.length - 1; i++) {
      const current = new Date(recentCycles[i].startDate);
      const previous = new Date(recentCycles[i + 1].startDate);
      const length = Math.round(
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(length);
    }

    // Default to 28 days if no cycle lengths available
    const avgLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          )
        : 28;

    // Calculate confidence based on data quality
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (cycleLengths.length >= 5) {
      const variance = this.calculateVariance(cycleLengths);
      if (variance < 2) confidence = 'high';
      else if (variance < 5) confidence = 'medium';
    } else if (cycleLengths.length >= 3) {
      confidence = 'medium';
    }

    // Next period start = last period start + average cycle length
    const lastCycle = new Date(sortedCycles[0].startDate);
    const nextStart = new Date(lastCycle);
    nextStart.setDate(nextStart.getDate() + avgLength);

    // Fertile window: 18-11 days before next period (ovulation ±5 days)
    const fertileStart = new Date(nextStart);
    fertileStart.setDate(fertileStart.getDate() - 18);

    const fertileEnd = new Date(nextStart);
    fertileEnd.setDate(fertileEnd.getDate() - 11);

    return {
      nextStart,
      fertile: {
        start: fertileStart,
        end: fertileEnd,
      },
      averageCycleLength: avgLength,
      confidence,
    };
  }

  /**
   * Calculate variance of cycle lengths
   */
  private calculateVariance(lengths: number[]): number {
    if (lengths.length === 0) return 0;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const squaredDiffs = lengths.map((length) => Math.pow(length - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / lengths.length;

    return Math.sqrt(variance); // Return standard deviation
  }

  /**
   * Check if a date falls within fertile window
   */
  isFertileDay(date: Date, prediction: PredictionResult): boolean {
    const time = date.getTime();
    return (
      time >= prediction.fertile.start.getTime() &&
      time <= prediction.fertile.end.getTime()
    );
  }

  /**
   * Get cycle day number (1-based)
   */
  getCycleDay(date: Date, lastPeriodStart: Date): number {
    const diff = date.getTime() - lastPeriodStart.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}
