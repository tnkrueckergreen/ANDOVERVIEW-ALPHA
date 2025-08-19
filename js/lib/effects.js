/**
 * Triggers a celebratory confetti burst.
 * This function uses the 'canvas-confetti' library, which must be loaded globally.
 */
export function showConfetti() {
    // Guard clause in case the library fails to load
    if (typeof confetti !== 'function') {
        console.warn("Confetti library not loaded.");
        return;
    }

    // MODIFIED: Use the school's navy blue and gold colors.
    const colors = ['#002D62', '#FFD700'];

    // Launch a burst of confetti from the center of the screen
    confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors: colors,
        disableForReducedMotion: true // An important accessibility feature
    });
}