import { Injectable } from '@nestjs/common';

type Sex = 'male' | 'female';
type Activity = 'sedentary' | 'moderate' | 'active';
type Climate = 'cool' | 'temperate' | 'hot';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

@Injectable()
export class CalculatorService {
  /**
   * Calculate BMI (Body Mass Index)
   */
  calculateBMI(weightKg: number, heightCm: number): {
    bmi: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  } {
    const heightM = heightCm / 100;
    const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

    let category: 'underweight' | 'normal' | 'overweight' | 'obese';
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else category = 'obese';

    return { bmi, category };
  }

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  calculateBMR(
    weightKg: number,
    heightCm: number,
    ageYears: number,
    sex: Sex,
  ): number {
    if (sex === 'female') {
      return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    } as const;

    return Math.round(bmr * multipliers[activityLevel]);
  }

  /**
   * Calculate daily water need (30-35 ml/kg baseline with modifiers)
   */
  calculateDailyWaterNeed(
    weightKg: number,
    activity: Activity,
    climate: Climate,
  ): number {
    const base = weightKg * 33; // 33 ml per kg baseline (average of 30-35)
    const activityMultiplier = {
      sedentary: 1.0,
      moderate: 1.15,
      active: 1.3,
    }[activity];
    const climateBonus = { cool: 0, temperate: 250, hot: 500 }[climate];

    return Math.round(base * activityMultiplier + climateBonus); // ml/day
  }

  /**
   * Calculate pregnancy due date (Naegele's rule: LMP + 280 days)
   */
  calculateDueDate(lmpDate: Date): Date {
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
    return dueDate;
  }

  /**
   * Calculate pregnancy week from LMP
   */
  calculatePregnancyWeek(lmpDate: Date): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }
}
