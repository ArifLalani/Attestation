import Avatar from "@mui/material/Avatar";
import Group from "@mui/icons-material/Group";
import Image from "next/image";
import type { Collaborator } from "@/data/types";
import { tokens } from "@/theme/theme";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** "Toute l'équipe": the same round avatar as a person, grey (or the colour given) with a group icon. */
export function TeamAvatar({ size = 32, color = tokens.gris }: { size?: number; color?: string }) {
  return (
    <Avatar aria-hidden sx={{ width: size, height: size, bgcolor: color, color: tokens.blanc, flexShrink: 0 }}>
      <Group sx={{ fontSize: size * 0.56 }} />
    </Avatar>
  );
}

export function StaffAvatar({ person, size = 32 }: { person: Pick<Collaborator, "name" | "photo">; size?: number }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        fontWeight: 600,
        bgcolor: tokens.grisClair2,
        color: tokens.bleuFonce,
        flexShrink: 0,
      }}
    >
      {person.photo ? (
        <Image src={person.photo} alt="" fill sizes={`${size * 2}px`} style={{ objectFit: "cover" }} />
      ) : (
        initials(person.name)
      )}
    </Avatar>
  );
}
