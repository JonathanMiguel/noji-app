// Simplified SM-2 algorithm
// quality: 0 (again), 3 (hard), 4 (good), 5 (easy)
export function sm2(card, quality) {
  let { sr_interval = 0, sr_easeFactor = 2.5, sr_repetitions = 0 } = card;

  if (quality < 3) {
    sr_repetitions = 0;
    sr_interval = 1; // review tomorrow
  } else {
    if (sr_repetitions === 0) sr_interval = 1;
    else if (sr_repetitions === 1) sr_interval = 3;
    else sr_interval = Math.round(sr_interval * sr_easeFactor);

    sr_repetitions += 1;
  }

  sr_easeFactor = Math.max(
    1.3,
    sr_easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const sr_nextReview = now + sr_interval * 24 * 60 * 60 * 1000;

  return {
    sr_interval,
    sr_easeFactor,
    sr_repetitions,
    sr_nextReview,
  };
}
