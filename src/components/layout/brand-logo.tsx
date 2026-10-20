import Image from 'next/image';
import { logo } from '@/lib/config/tokens';
import { siteConfig } from '@/lib/config/site';
import { cn } from '@/lib/cn';

/**
 * The supplied PNG carries baked-in transparent padding (130px top / 118px bottom
 * of a 725px canvas), so the visible mark is only ~66% of the element height.
 * Sizing is therefore expressed as the *visual* height and scaled up, rather than
 * editing the official asset — which must stay byte-identical.
 */
export function BrandLogo({ visualHeight = 26, className }: { visualHeight?: number; className?: string }) {
  const canvasHeight = Math.round(visualHeight / logo.verticalFill);
  const canvasWidth = Math.round(canvasHeight * logo.canvasAspect);
  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.canvasWidth}
      height={logo.canvasHeight}
      style={{ height: canvasHeight, width: canvasWidth }}
      sizes="(min-width: 768px) 160px, 130px"
      fetchPriority="high"
      className={cn('object-contain object-left', className)}
    />
  );
}

export function BrandWordmark() {
  return (
    <span className="sr-only">
      {siteConfig.name} {siteConfig.descriptor}
    </span>
  );
}
