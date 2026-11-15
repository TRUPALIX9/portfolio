import Image from 'next/image';
import { APP_ICONS } from '@/data/app-icons';

/** An app's official icon in a rounded tile; round logos stay circles, padded ones are zoomed in. */
export default function AppIcon({ id, name, size = 44 }: { id: string; name: string; size?: number }) {
    const icon = APP_ICONS[id];
    if (!icon) return <span className="sp-appicon sp-appicon--letter" style={{ width: size, height: size }} aria-hidden="true">{name.slice(0, 1)}</span>;
    return (
        <span className="sp-appicon" data-round={String(!!icon.round)} style={{ width: size, height: size, background: icon.bg }} aria-hidden="true">
            <Image src={icon.src} alt="" width={size * 2} height={size * 2} style={{ transform: icon.zoom ? `scale(${icon.zoom})` : undefined, objectFit: icon.round ? 'contain' : 'cover' }} />
        </span>
    );
}
