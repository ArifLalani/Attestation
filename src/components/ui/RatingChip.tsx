import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatScore } from "@/lib/format";
import { tokens } from "@/theme/theme";
import { FigmaIcon } from "./FigmaIcon";

/** Figma "Rating Chip" (1432:129600): "4,5 ★" in a white pill. */
export function RatingChip({ value }: { value: number }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "6px",
        bgcolor: tokens.blanc,
        border: `1px solid ${tokens.grisMoyen1}`,
        borderRadius: "16px",
        flexShrink: 0,
      }}
    >
      <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
        {formatScore(value)}
      </Typography>
      <FigmaIcon name="star-small" />
    </Box>
  );
}
