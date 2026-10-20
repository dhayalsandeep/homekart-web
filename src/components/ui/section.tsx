import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('py-8 sm:py-10', className)}>
      <div className="shell">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  actionLabel,
  actionHref,
  as = 'h2',
  className,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  as?: 'h2' | 'h3';
  className?: string;
}) {
  const Heading = as;
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <Heading className="font-display text-2xl font-bold sm:text-[28px]">{title}</Heading>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {actionLabel}
          <ArrowRight size={15} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
