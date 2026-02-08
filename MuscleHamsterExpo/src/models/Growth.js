// Growth Model - Phase 07.4
// Hamster growth stages and milestones

export const GrowthStage = {
  BABY: 'baby',
  JUVENILE: 'juvenile',
  ADULT: 'adult',
  MATURE: 'mature',
};

export const GrowthStageInfo = {
  [GrowthStage.BABY]: {
    displayName: 'Baby',
    description: 'Just starting out!',
    icon: 'leaf',
    color: '#34C759',
    celebrationHeadline: 'just hatched!',
    celebrationSpeech: "I'm so tiny but I'll grow big and strong with you!",
    requiredWorkouts: 0,
    requiredStreak: 0,
  },
  [GrowthStage.JUVENILE]: {
    displayName: 'Juvenile',
    description: 'Growing stronger every day!',
    icon: 'flash',
    color: '#5AC8FA',
    celebrationHeadline: 'is growing up!',
    celebrationSpeech: "Look at me! I'm getting bigger thanks to all our workouts!",
    requiredWorkouts: 5,
    requiredStreak: 3,
  },
  [GrowthStage.ADULT]: {
    displayName: 'Adult',
    description: 'Strong and healthy!',
    icon: 'fitness',
    color: '#AF52DE',
    celebrationHeadline: 'is all grown up!',
    celebrationSpeech: "We did it! I'm a fully grown, muscle-bound hamster now!",
    requiredWorkouts: 20,
    requiredStreak: 14,
  },
  [GrowthStage.MATURE]: {
    displayName: 'Mature',
    description: 'A fitness legend!',
    icon: 'trophy',
    color: '#FFD700',
    celebrationHeadline: 'has reached legendary status!',
    celebrationSpeech: "I've become a true fitness legend! Thank you for this incredible journey!",
    requiredWorkouts: 75,
    requiredStreak: 30,
  },
};

export const GrowthTriggerType = {
  WORKOUTS: 'workouts',
  STREAK: 'streak',
};

// Create growth milestone record
export const createGrowthMilestone = ({
  stage,
  achievedAt,
  triggerType,
  triggerValue,
}) => ({
  stage,
  achievedAt,
  triggerType,
  triggerValue,
  get triggerDescription() {
    if (triggerType === GrowthTriggerType.WORKOUTS) {
      return `${triggerValue} workouts completed`;
    }
    return `${triggerValue} day streak`;
  },
});

// Calculate current growth stage based on stats
export const calculateGrowthStage = (totalWorkouts, currentStreak, longestStreak) => {
  const maxStreak = Math.max(currentStreak, longestStreak);

  // Check mature
  if (totalWorkouts >= 75 || maxStreak >= 30) {
    return GrowthStage.MATURE;
  }

  // Check adult
  if (totalWorkouts >= 20 || maxStreak >= 14) {
    return GrowthStage.ADULT;
  }

  // Check juvenile
  if (totalWorkouts >= 5 || maxStreak >= 3) {
    return GrowthStage.JUVENILE;
  }

  return GrowthStage.BABY;
};

// Get the stage order for comparison
export const getStageOrder = (stage) => {
  const order = {
    [GrowthStage.BABY]: 0,
    [GrowthStage.JUVENILE]: 1,
    [GrowthStage.ADULT]: 2,
    [GrowthStage.MATURE]: 3,
  };
  return order[stage] ?? 0;
};

// Get previous stage
export const getPreviousStage = (stage) => {
  switch (stage) {
    case GrowthStage.JUVENILE:
      return GrowthStage.BABY;
    case GrowthStage.ADULT:
      return GrowthStage.JUVENILE;
    case GrowthStage.MATURE:
      return GrowthStage.ADULT;
    default:
      return null;
  }
};
