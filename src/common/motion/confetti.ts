import confetti from 'canvas-confetti';

/**
 * Skill 4: Dopamine Confetti Particle Explosion
 * Fires tactile festive particles using Ploty brand colors:
 * - #7477FF (Electric Periwinkle)
 * - #F66554 (Vibrant Coral)
 * - #F9CD61 (Solar Gold)
 * - #FFFFFF (Pure White)
 */
export const triggerDopamineConfetti = () => {
  const colors = ['#7477FF', '#F66554', '#F9CD61', '#FFFFFF'];

  confetti({
    particleCount: 65,
    spread: 70,
    origin: { y: 0.65 },
    colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });

  // Secondary delayed burst for maximum dopamine feedback
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 150);
};
