import { SkeletonGrid } from '@/components/ui/states';

export default function Loading() {
  return (
    <div className="shell py-10">
      <div className="mb-5 h-8 w-56 animate-pulse rounded-lg bg-cream" aria-hidden />
      <SkeletonGrid count={10} />
    </div>
  );
}
