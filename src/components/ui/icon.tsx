import {
  Blocks,
  Bolt,
  Cpu,
  Drill,
  Droplets,
  Fan,
  Home,
  Layers,
  Lightbulb,
  Package,
  Paintbrush,
  ShieldCheck,
  Shirt,
  Sofa,
  Sparkles,
  Truck,
  RotateCcw,
  Headphones,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import type { IconName } from '@/lib/config/site';

const REGISTRY: Record<IconName, LucideIcon> = {
  home: Home,
  layers: Layers,
  package: Package,
  lightbulb: Lightbulb,
  zap: Zap,
  droplets: Droplets,
  paintbrush: Paintbrush,
  'utensils-crossed': UtensilsCrossed,
  sofa: Sofa,
  fan: Fan,
  drill: Drill,
  wrench: Wrench,
  cpu: Cpu,
  shirt: Shirt,
  sparkles: Sparkles,
  blocks: Blocks,
  'shield-check': ShieldCheck,
  truck: Truck,
  'rotate-ccw': RotateCcw,
  headphones: Headphones,
  bolt: Bolt,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = REGISTRY[name];
  return <Component aria-hidden {...props} />;
}
