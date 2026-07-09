import Image from "next/image";
import { brand } from "@/lib/brand";

export default function Logo({
  size = 22,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={brand.logo}
        alt=""
        width={Math.round(size * 0.911)}
        height={size}
        className="dark:invert"
        priority
      />
      {showWordmark && <span className="font-display text-lg tracking-tight">{brand.name}</span>}
    </span>
  );
}
