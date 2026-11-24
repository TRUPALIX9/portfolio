/** Each issuer's own logo (saved from its site), so a list of credentials reads at a glance. */
const ISSUER_LOGO: Record<string, string> = {
    Meta: '/issuers/meta.png',
    Google: '/issuers/google.png',
    Coursera: '/issuers/coursera.png',
    'Duke University': '/issuers/duke.png',
    'Johns Hopkins University': '/issuers/jhu.png',
    'Great Learning': '/issuers/greatlearning.png',
    'Cal Poly Digital Transformation Hub': '/issuers/calpoly.png',
};

/** Issuer logo, with the platform's logo tucked in the corner when it was delivered through one. */
export default function CertBadge({ issuer, platform }: { issuer: string; platform?: string }) {
    const via = platform && ISSUER_LOGO[platform.split(' ·')[0]];
    return (
        <span className="cx-badge" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ISSUER_LOGO[issuer]} alt="" width={28} height={28} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {via && via !== ISSUER_LOGO[issuer] && <img src={via} alt="" width={14} height={14} className="cx-badge__via" />}
        </span>
    );
}
