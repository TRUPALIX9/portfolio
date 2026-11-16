import { Building2, Earth, FerrisWheel, Landmark, MountainSnow, Sunset, TreePalm, Trees, Waves, Zap, type LucideIcon } from 'lucide-react';
import type { ExploreKind } from '@/data/explore';

const ICONS: Record<ExploreKind, LucideIcon> = {
    hike: MountainSnow,
    water: Waves,
    forest: Trees,
    desert: Sunset,
    coast: TreePalm,
    city: Building2,
    country: Earth,
    landmark: Landmark,
    adventure: Zap,
    fun: FerrisWheel,
};

export default function KindIcon({ kind, size = 18 }: { kind: ExploreKind; size?: number }) {
    const Icon = ICONS[kind];
    return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
}
