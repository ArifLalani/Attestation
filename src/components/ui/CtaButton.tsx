import Button, { type ButtonProps } from "@mui/material/Button";
import type { AnchorHTMLAttributes } from "react";
import { tokens } from "@/theme/theme";
import { FigmaIcon, type FigmaIconName } from "./FigmaIcon";

type Variant = "primary" | "secondary";

/** Figma "CTA" (1395:12701): yellow primary, outlined secondary, grey when disabled. */
export function CtaButton({
  variant = "primary",
  icon = variant === "primary" ? "icon-right-arrow" : "icon-right-more",
  children,
  disabled,
  sx,
  ...props
}: Omit<ButtonProps, "variant"> & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & { variant?: Variant; icon?: FigmaIconName | null }) {
  const iconName: FigmaIconName | null = disabled ? "icon-right-disabled" : icon;
  return (
    <Button
      disabled={disabled}
      {...props}
      sx={{
        width: "100%",
        minHeight: 45,
        p: 1.5,
        gap: 1,
        borderRadius: "8px",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "normal",
        color: tokens.bleuFonce,
        ...(variant === "primary"
          ? { bgcolor: tokens.jaune400, "&:hover": { bgcolor: "#f5cc00" } }
          : // 11 px padding + the 1 px border keeps it 45 px tall, like the primary button.
            { py: "11px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.blanc, "&:hover": { bgcolor: tokens.grisClair1 } }),
        "&.Mui-disabled": { bgcolor: tokens.grisClair2, color: tokens.gris, border: "none" },
        ...sx,
      }}
    >
      {children}
      {iconName && (
        // Figma "Masked Icon": a 16 × 20 slot holding a 20 × 20 icon.
        <span style={{ width: 16, height: 20, display: "inline-flex", justifyContent: "center", overflow: "visible" }}>
          <FigmaIcon name={iconName} />
        </span>
      )}
    </Button>
  );
}
