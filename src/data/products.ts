import { APP } from '@/data/logicsprint';
import { STOREDESK } from '@/data/storedesk';
import { LOGICSPRINT_URL } from '@/data/site';

/** Software shipped to real users, each with its own page. Portfolio work stays in projects.ts. */
export type Product = {
    slug: string;
    name: string;
    /** Category and platforms, shown above the name. */
    kicker: string;
    tagline: string;
    /** Release state, shown on the card. */
    status: string;
    /** Product page on this site. */
    href: string;
    /** The product's own home on the web. */
    site: { url: string; label: string };
    image: string;
    /** Logos are shown whole on a plain surface; artwork fills the frame. */
    imageIsLogo?: boolean;
};

export const products: Product[] = [
    {
        slug: 'storedesk',
        name: STOREDESK.name,
        kicker: 'Retail operations · Windows, Android, Web',
        tagline: STOREDESK.tagline,
        status: 'v0.0.4 released',
        href: '/products/storedesk',
        site: { url: STOREDESK.siteUrl, label: STOREDESK.siteLabel },
        image: STOREDESK.logo,
        imageIsLogo: true,
    },
    {
        slug: 'logicsprint',
        name: APP.name,
        kicker: 'Brain games · Android',
        tagline: APP.tagline,
        status: 'Android test build · Google Play soon',
        href: '/logicsprint',
        site: { url: LOGICSPRINT_URL, label: 'logicsprint.trupalpatel.com' },
        image: APP.featureGraphic,
    },
];
