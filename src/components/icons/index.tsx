/**
 * Original line icons for the exhibition segments, drawn on a 32px grid to sit
 * alongside Lucide icons (1.6 stroke, round caps). Decorative by default.
 */
type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Feed sack with a grain ear — feed, additives and nutrition. */
export function FeedIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 6.5h10l1.6 2.6c1.8 3 2.9 7.4 2.9 11.4 0 3.3-1.8 5-4.5 5h-10c-2.7 0-4.5-1.7-4.5-5 0-4 1.1-8.4 2.9-11.4z" />
      <path d="M11 6.5 12.4 9h7.2L21 6.5" />
      <path d="M16 23.5v-9" />
      <path d="M16 17.2c-1.9 0-3.1-1.2-3.1-3 1.9 0 3.1 1.2 3.1 3Zm0 0c1.9 0 3.1-1.2 3.1-3-1.9 0-3.1 1.2-3.1 3Z" />
      <path d="M16 21c-1.9 0-3.1-1.2-3.1-3 1.9 0 3.1 1.2 3.1 3Zm0 0c1.9 0 3.1-1.2 3.1-3-1.9 0-3.1 1.2-3.1 3Z" />
    </Svg>
  );
}

/** Vial and cross — animal health, pharmaceuticals, diagnostics. */
export function AnimalHealthIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8.5 5h9" />
      <path d="M10 5v18.5a3 3 0 0 0 6 0V5" />
      <path d="M10 15h6" />
      <path d="M12.2 18.5h1.6" />
      <path d="M24 9.5v8M20 13.5h8" />
      <circle cx="24" cy="13.5" r="6" strokeOpacity={0.45} />
    </Svg>
  );
}

/** Hanging pan feeder — poultry and livestock housing equipment. */
export function EquipmentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 4.5h25" />
      <path d="M16 4.5v4" />
      <path d="M12.5 8.5h7l-1.2 7h-4.6z" />
      <path d="M5.5 20.5c0-1.7 4.7-3 10.5-3s10.5 1.3 10.5 3-4.7 4.5-10.5 4.5-10.5-2.8-10.5-4.5Z" />
      <path d="M5.5 20.5c2.3 1.1 6 1.6 10.5 1.6s8.2-.5 10.5-1.6" />
      <path d="M16 15.5v2" />
    </Svg>
  );
}

/** Crate with a cold-chain mark — processing, packaging, storage. */
export function ProcessingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 10.5 16 5l11.5 5.5v11L16 27 4.5 21.5z" />
      <path d="M4.5 10.5 16 16l11.5-5.5M16 16v11" />
      <path d="M10.2 7.8 21.8 13.2v4" />
      <path d="M9 17.4v3.6M7.4 18.4l3.2 1.6M7.4 20l3.2-1.6" />
    </Svg>
  );
}

/** Circuit board with a leaf — farm automation, software and services. */
export function FarmTechIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8" y="8" width="16" height="16" rx="1.5" />
      <path d="M12 4.5V8M16 4.5V8M20 4.5V8M12 24v3.5M16 24v3.5M20 24v3.5M4.5 12H8M4.5 16H8M4.5 20H8M24 12h3.5M24 16h3.5M24 20h3.5" />
      <path d="M12.5 19.5c0-3.8 2.7-6.5 7-6.5 0 3.8-2.7 6.5-7 6.5Z" />
      <path d="M12.5 19.5 16.4 15.6" />
    </Svg>
  );
}

/** Barn with a milk can — livestock and dairy farm equipment. */
export function LivestockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 14.5 13 7l9 7.5" />
      <path d="M6 13v13h14V13" />
      <path d="M10 26v-7h6v7" />
      <path d="M10 19l6 7M16 19l-6 7" />
      <path d="M24 26v-6.5c0-1 .8-1.8 1.8-1.8h0c1 0 1.7.8 1.7 1.8V26z" />
      <path d="M24.6 17.7v-1.5h2.4v1.5" />
      <path d="M3.5 26h25" />
    </Svg>
  );
}

/** Facebook "f" mark (Lucide ships no brand icons). */
export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21z" />
    </svg>
  );
}
