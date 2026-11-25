import Box from "@mui/material/Box";

// A laurel branch drawn along a curve: leaves on the outer side, smaller ones inside.
const curve = [
  [24, 62],
  [8, 52],
  [4, 30],
  [14, 4],
] as const;

function point(t: number) {
  const u = 1 - t;
  const [p0, p1, p2, p3] = curve;
  const at = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  const d = (i: 0 | 1) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i]);
  return { x: at(0), y: at(1), angle: (Math.atan2(d(1), d(0)) * 180) / Math.PI };
}

// Rounded, so the server and the browser write exactly the same numbers.
const r = (value: number) => Math.round(value * 100) / 100;

const leaves = Array.from({ length: 7 }, (_, i) => {
  const t = 0.08 + i * 0.135;
  const { x, y, angle } = point(t);
  const rad = ((angle - 90) * Math.PI) / 180;
  return [
    { cx: r(x + Math.cos(rad) * 4.2), cy: r(y + Math.sin(rad) * 4.2), rotate: r(angle + 55), rx: 2.6, ry: 6.2 },
    ...(i % 2 === 1 ? [{ cx: r(x - Math.cos(rad) * 3.4), cy: r(y - Math.sin(rad) * 3.4), rotate: r(angle - 50), rx: 1.9, ry: 4.6 }] : []),
  ];
}).flat();
const tip = point(1);

export function Laurel({ side, color, height = 64 }: { side: "left" | "right"; color: string; height?: number }) {
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 32 66"
      sx={{ height, width: (height * 32) / 66, flexShrink: 0, transform: side === "right" ? "scaleX(-1)" : "none", color, transition: "color 250ms ease" }}
    >
      <path d={`M${curve[0].join(" ")} C ${curve[1].join(" ")}, ${curve[2].join(" ")}, ${curve[3].join(" ")}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((leaf, index) => (
        <ellipse key={index} cx={leaf.cx} cy={leaf.cy} rx={leaf.rx} ry={leaf.ry} transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`} fill="currentColor" />
      ))}
      <ellipse cx={r(tip.x + 0.6)} cy={r(tip.y - 2)} rx={2.2} ry={5} transform={`rotate(${r(tip.angle + 90)} ${r(tip.x + 0.6)} ${r(tip.y - 2)})`} fill="currentColor" />
    </Box>
  );
}
