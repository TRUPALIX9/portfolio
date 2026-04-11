import https from 'https';

const domains = ['https://www.allyvia.co/', 'https://aivid.ai/', 'https://infolabz.in/'];

const getHTML = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const extractIcons = (html, baseUrl) => {
    const urls = [];
    const regexes = [
        /<link[^>]+rel=["']?(?:apple-touch-icon|icon|shortcut icon|icon shortcut)["']?[^>]+href=["']([^"']+)["']/gi,
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']?(?:apple-touch-icon|icon|shortcut icon|icon shortcut)["']?/gi,
        /<img[^>]+id=["']logo["'][^>]+src=["']([^"']+)["']/gi,
        /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/gi
    ];

    for (const regex of regexes) {
        let match;
        while ((match = regex.exec(html)) !== null) {
            let iconUrl = match[1];
            if (iconUrl.startsWith('//')) {
                iconUrl = 'https:' + iconUrl;
            } else if (iconUrl.startsWith('/')) {
                const urlObj = new URL(baseUrl);
                iconUrl = urlObj.origin + iconUrl;
            } else if (!iconUrl.startsWith('http')) {
                const urlObj = new URL(baseUrl);
                iconUrl = urlObj.origin + '/' + iconUrl;
            }
            urls.push(iconUrl);
        }
    }
    return [...new Set(urls)];
};

async function run() {
    for (const domain of domains) {
        console.log(`\n\x1b[36m--- Searching images for ${domain} ---\x1b[0m`);
        try {
            const html = await getHTML(domain);
            const icons = extractIcons(html, domain);
            const urlObj = new URL(domain);

            // Add robust 3rd party fallback URLs
            icons.unshift(`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=256`);
            icons.unshift(`https://logo.clearbit.com/${urlObj.hostname}`);

            Array.from(new Set(icons)).forEach((icon, i) => {
                console.log(`[Option ${i + 1}] ${icon}`);
            });
        } catch (e) {
            console.error(`Error fetching ${domain}:`, e.message);
        }
    }
    console.log(`\n\x1b[32m✔ Done! Copy any of these URLs directly into your browser to preview them!\x1b[0m`);
}
run();
