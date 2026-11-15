/** Official icons for studio products and client sites, with how each one should sit in its tile. */
export type AppIcon = { src: string; round?: boolean; zoom?: number; bg?: string };

export const APP_ICONS: Record<string, AppIcon> = {
    skills: { src: '/studio/skills.png' },
    logicsprint: { src: '/studio/logicsprint.png' },
    family: { src: '/studio/family.png' },
    'contact-convoy': { src: '/contactconvoy/icon.png' },
    storedesk: { src: '/storedesk_icon.svg' },
    // A round badge logo: keep the whole circle, on white.
    'dr-nandini': { src: '/drnandini/logo.png', round: true, bg: '#fff' },
    // Lots of padding around the flame, so zoom in.
    meghvin: { src: '/meghvin/icon.png', zoom: 1.7, bg: '#f4efe7' },
    nyara: { src: '/nyara/icon.svg' },
};
