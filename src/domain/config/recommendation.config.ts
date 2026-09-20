export const RECOMMENDATION_CONFIG = {
  weights: {
    AGE_FIT: 25,
    FAMILY_FACILITY: 25,
    ROUTE_EFFICIENCY: 20,
    WEATHER_FIT: 15,
    LOCAL_IDENTITY: 10,
    PARENT_REST: 5,
  },
  facilityWeights: {
    strollerYes: 6,
    strollerUnknownPenalty: -5,
    nursingRoomYes: 6,
    diaperChangingYes: 5,
    babyChairYes: 4,
    parkingYes: 4,
  },
  durations: {
    mealDefaultMin: 60,
    cafeDefaultMin: 45,
    parkingBufferMin: 10,
    toddlerBuffer: {
      activityWindowMin: 90,
      extraBufferMin: 15,
      maxContinuousOutdoorMin: 90,
    },
  },
  stopLimits: {
    age0to2: { min: 3, max: 4 },
    age3to5: { min: 3, max: 4 },
    age6plus: { min: 4, max: 5 },
  },
  slackTime: {
    relaxedThresholdMin: 40,
    tightThresholdMin: 20,
  },
} as const;
