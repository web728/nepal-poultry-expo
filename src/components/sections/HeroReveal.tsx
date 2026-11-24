/**
 * Hero entrance (transform + opacity). Pure CSS: it starts with the first paint instead
 * of waiting for hydration, and is switched off for visitors who prefer reduced motion.
 */
export function HeroReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="animate-hero-in motion-reduce:animate-none" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
