import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['192.168.1.175'],
    turbopack: {
        root: __dirname,
    },
    // Binge page artwork: TVMaze posters/backgrounds and Wikipedia film posters.
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'static.tvmaze.com', pathname: '/uploads/images/**' },
            { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/wikipedia/**' },
        ],
    },
    async redirects() {
        return [
            // Products moved to the True or False studio site (trueorfalse.dev). Old product pages, and the
            // project pages that became products, go straight to their new home. (/logicsprint itself is sent
            // to the LogicSprint subdomain by src/proxy.ts.)
            { source: '/products', destination: 'https://trueorfalse.dev/#products', permanent: true },
            { source: '/products/storedesk', destination: 'https://trueorfalse.dev/products/storedesk', permanent: true },
            { source: '/products/contact-convoy', destination: 'https://trueorfalse.dev/products/contact-convoy', permanent: true },
            { source: '/products/logicsprint', destination: 'https://logicsprint.trueorfalse.dev', permanent: true },
            { source: '/products/dr-nandini-physio', destination: 'https://trueorfalse.dev/websites/dr-nandini', permanent: true },
            { source: '/products/meghvin-foundation', destination: 'https://trueorfalse.dev/websites/meghvin', permanent: true },
            { source: '/products/:slug', destination: 'https://trueorfalse.dev/#products', permanent: true },
            { source: '/projects/logic-sprint', destination: 'https://logicsprint.trueorfalse.dev', permanent: true },
            { source: '/projects/storedesk', destination: 'https://trueorfalse.dev/products/storedesk', permanent: true },
            // Card Snap grew into Contact Convoy.
            { source: '/projects/card-snap', destination: 'https://trueorfalse.dev/products/contact-convoy', permanent: true },
            // The Bedrock prototype was rebuilt as Shipping Agent; its page now covers both.
            { source: '/projects/shipping-agent-aws', destination: '/projects/shipping-agent', permanent: true },
            // The web memory game was retired in favour of LogicSprint; old and shared links land there.
            { source: '/game', destination: 'https://logicsprint.trueorfalse.dev', permanent: true },
            { source: '/game-only', destination: 'https://logicsprint.trueorfalse.dev', permanent: true },
            { source: '/arcade/:token', destination: 'https://logicsprint.trueorfalse.dev', permanent: true },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; worker-src 'self' blob:;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
