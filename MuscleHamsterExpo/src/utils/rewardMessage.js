// Friendly, honest message for a training reward (ActivityService.recordTraining result).
// Always shows the real number earned. No guilt when the daily limit is reached.
export const describeReward = (result, hamsterName = 'your hamster') => {
  if (!result) return '';
  if (result.alreadyRecorded) {
    return `Already counted today. ${hamsterName} remembers!`;
  }

  const parts = [];
  if (result.sessionPoints > 0) {
    parts.push(`+${result.sessionPoints} points for ${hamsterName}!`);
  } else {
    parts.push(`${hamsterName} is full for today. You've earned today's max points, and this still counts toward your week.`);
  }
  if (result.weeklyBonus > 0) {
    parts.push(`Weekly goal reached: +${result.weeklyBonus} bonus points!`);
  }
  return parts.join(' ');
};

export default describeReward;
