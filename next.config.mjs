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
    async redirects() {
        return [
            // StoreDesk and LogicSprint moved from Projects to Products. (/logicsprint itself is
            // sent to the LogicSprint subdomain by src/proxy.ts.)
            { source: '/projects/logic-sprint', destination: '/products/logicsprint', permanent: true },
            { source: '/projects/storedesk', destination: '/products/storedesk', permanent: true },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
