import Box from "@mui/material/Box";
import { tokens } from "@/theme/theme";

const STAR = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/** Five square tiles with a white star, filled to the decimal (layout from option E, in the page's yellow). */
export function StarTiles({ value, size = 22, color = tokens.jaune600, label }: { value: number; size?: number; color?: string; label?: string }) {
  const gap = Math.max(2, Math.round(size * 0.12));
  return (
    <Box role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} sx={{ display: "inline-flex", gap: `${gap}px`, flexShrink: 0 }}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <Box key={index} sx={{ position: "relative", width: size, height: size, borderRadius: `${Math.max(2, size * 0.16)}px`, bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
            <Box sx={{ position: "absolute", inset: 0, width: `${fill * 100}%`, bgcolor: color }} />
            <Box component="svg" viewBox="0 0 24 24" sx={{ position: "absolute", inset: "14%", width: "72%", height: "72%", fill: tokens.blanc }}>
              <path d={STAR} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
