const ITEMS = [
  "UNDER 8 INGREDIENTS",
  "NO ADDITIVES",
  "1000MG SODIUM",
  "NO SUGAR ADDED",
  "MADE IN INDONESIA",
  "BUILT FOR THE HEAT",
];

/** Infinite-scrolling black band of product claims (paused under reduced-motion). */
export function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="bg-wi-black border-t border-wi-on-dark-line overflow-hidden py-3">
      <div className="wi-marquee-track gap-11 whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={i}
            className="text-wi-paper text-xs font-bold tracking-[0.14em] inline-flex items-center gap-11"
          >
            {item}
            <span className="opacity-[0.35]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
