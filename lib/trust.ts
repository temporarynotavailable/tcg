export function calculateTrustLevel(reputationScore: number) {
  if (reputationScore >= 90) return 4;
  if (reputationScore >= 75) return 3;
  if (reputationScore >= 50) return 2;
  if (reputationScore >= 25) return 1;

  return 0;
}

export function clampReputationScore(value: number) {
  return Math.min(100, Math.max(0, value));
}