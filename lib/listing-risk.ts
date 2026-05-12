type ListingRiskInput = {
  listingType: string;
  price: number;
  sellerRole: string;
  kycStatus: string;
  reputationScore: number;
  trustLevel: number;
};

type ListingRiskResult = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendedStatus: "ACTIVE" | "REVIEW";
  reasons: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateListingRisk(input: ListingRiskInput): ListingRiskResult {
  let score = 0;
  const reasons: string[] = [];

  if (input.kycStatus !== "VERIFIED") {
    score += 35;
    reasons.push("Seller is not KYC verified");
  }

  if (input.sellerRole === "BASIC_USER") {
    score += 20;
    reasons.push("Seller is a Basic User");
  }

  if (input.reputationScore < 50) {
    score += 25;
    reasons.push("Low reputation score");
  } else if (input.reputationScore < 80) {
    score += 10;
    reasons.push("Medium reputation score");
  }

  if (input.price >= 1000) {
    score += 30;
    reasons.push("Very high listing value");
  } else if (input.price >= 500) {
    score += 20;
    reasons.push("High listing value");
  } else if (input.price >= 100) {
    score += 10;
    reasons.push("Medium listing value");
  }

  if (input.listingType === "BINDER") {
    score += 20;
    reasons.push("Binder sale requires additional verification");
  }

  if (input.listingType === "COLLECTION") {
    score += 25;
    reasons.push("Collection sale requires manual review");
  }

  if (input.listingType === "DECK") {
    score += 10;
    reasons.push("Deck listing contains multiple cards");
  }

  if (input.trustLevel >= 3) {
    score -= 15;
    reasons.push("Seller has strong trust level");
  }

  if (input.sellerRole === "TRUSTED_MEMBER" && input.kycStatus === "VERIFIED") {
    score -= 25;
    reasons.push("Trusted Member with verified KYC");
  }

  const riskScore = clamp(score, 0, 100);

  let riskLevel: ListingRiskResult["riskLevel"] = "LOW";

  if (riskScore >= 70) {
    riskLevel = "HIGH";
  } else if (riskScore >= 40) {
    riskLevel = "MEDIUM";
  }

  const recommendedStatus: ListingRiskResult["recommendedStatus"] =
    riskScore >= 40 ? "REVIEW" : "ACTIVE";

  return {
    riskScore,
    riskLevel,
    recommendedStatus,
    reasons,
  };
}