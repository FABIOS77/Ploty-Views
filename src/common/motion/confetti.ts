import confetti from 'canvas-confetti';

/**
 * Skill 4: Dopamine Confetti Particle Explosion
 * Fires festive tactile particles using active theme colors or Level 0 defaults.
 */
export const triggerDopamineConfetti = (customColors?: readonly string[]) => {
  const colors = customColors && customColors.length > 0
    ? [...customColors]
    : ['#7477FF', '#F66554', '#F9CD61', '#FFFFFF'];

  confetti({
    particleCount: 75,
    spread: 70,
    origin: { y: 0.65 },
    colors,
    ticks: 220,
    gravity: 1.2,
    scalar: 1.1,
  });

  // Secondary delayed dual-fan burst for maximum dopamine feedback
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 150);
};

/**
 * Epic Celebration Confetti for Level-Up & Achievement Unlocks
 */
export const triggerLevelUpCelebration = (customColors?: readonly string[]) => {
  const colors = customColors && customColors.length > 0
    ? [...customColors]
    : ['#F9CD61', '#7477FF', '#F66554', '#00F0FF', '#FFFFFF'];

  const end = Date.now() + 1500;

  const interval: any = setInterval(() => {
    if (Date.now() > end) {
      return clearInterval(interval);
    }

    confetti({
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors,
    });
  }, 200);
};
