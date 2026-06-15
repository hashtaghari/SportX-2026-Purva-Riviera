import Image from "next/image";

import {
  SPORTX_LOGO_DARK,
  SPORTX_LOGO_LIGHT,
} from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

export function SportXLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative block aspect-[640/407]", className)}>
      <Image
        src={SPORTX_LOGO_LIGHT}
        alt="SportX 2026, Riviera's Pride"
        fill
        priority={priority}
        className="sportx-logo-light object-contain"
      />
      <Image
        src={SPORTX_LOGO_DARK}
        alt=""
        fill
        priority={priority}
        aria-hidden="true"
        className="sportx-logo-dark object-contain"
      />
    </span>
  );
}
