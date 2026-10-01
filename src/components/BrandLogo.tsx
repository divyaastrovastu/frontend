'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useBranding } from '@/lib/branding';

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  light?: boolean;
};

const sizes = {
  sm: { box: 'h-9 w-9', text: 'text-base' },
  md: { box: 'h-11 w-11', text: 'text-lg' },
  lg: { box: 'h-14 w-14', text: 'text-xl' },
};

export function BrandLogo({
  href = '/',
  className,
  size = 'md',
  showName = true,
  light = false,
}: BrandLogoProps) {
  const { branding } = useBranding();
  const logoSrc = branding.logo || '/images/logo.png';
  const s = sizes[size];

  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative shrink-0 overflow-hidden rounded-full bg-white', s.box)}>
        <Image
          src={logoSrc}
          alt={branding.name}
          fill
          className="object-contain p-0.5"
          sizes="56px"
          priority
        />
      </span>
      {showName ? (
        <span
          className={cn(
            'font-serif tracking-wide',
            s.text,
            light ? 'text-white' : 'text-navy'
          )}
        >
          <span className={light ? 'text-gold' : 'text-gold-dark'}>DIVYA</span>
          {' '}
          ASTRO VASTU
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={branding.name}>
      {content}
    </Link>
  );
}
