import confetti from 'canvas-confetti';

export function fireGoldConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#D4AF37', '#FFD700', '#B8960F', '#FFF0BF', '#FFDB66'],
  };

  confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
  confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ['circle'] });
}

export function fireBigCelebration() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#D4AF37', '#FFD700', '#B8960F'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#D4AF37', '#FFD700', '#B8960F'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

export function fireReferralConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#D4AF37', '#FFD700', '#B8960F', '#FFDB66'],
    shapes: ['star'],
    scalar: 1.2,
  });
}
