/**
 * Calculates the Z-score of a value given a mean and standard deviation.
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return Math.abs((value - mean) / stdDev);
}

/**
 * Calculates distance in km using Haversine formula
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates incremental stats for running average/stddev.
 */
export function calculateIncrementalStats(
  currentSum: number, 
  currentSumSq: number, 
  currentCount: number, 
  newValue: number
) {
  const newCount = currentCount + 1;
  const newSum = currentSum + newValue;
  const newSumSq = currentSumSq + (newValue * newValue);
  
  const newMean = newSum / newCount;
  // Variance = (SumSq / N) - Mean^2
  const variance = (newSumSq / newCount) - (newMean * newMean);
  const newStdDev = variance > 0 ? Math.sqrt(variance) : 0;

  return { newMean, newStdDev, newSum, newSumSq, newCount };
}
