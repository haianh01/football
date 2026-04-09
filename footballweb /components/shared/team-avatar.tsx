type TeamAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<TeamAvatarProps["size"]>, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl"
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "VP";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function TeamAvatar({ name, logoUrl, size = "md" }: TeamAvatarProps) {
  const classes = sizeMap[size];

  if (logoUrl) {
    return (
      <div className={`${classes} overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={`${name} logo`} src={logoUrl} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${classes} flex items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#0b6b3a_0%,#1ea35a_100%)] font-[var(--font-headline)] font-black tracking-tight text-white shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}

