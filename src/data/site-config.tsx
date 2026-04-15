import type { ReactNode } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';

export type NavLink = {
    href: string;
    label: string;
};

export type SocialLink = {
    name: string;
    url: string;
    color: string;
    icon: ReactNode;
    handle: string;
    blurb: string;
    cta: string;
    external?: boolean;
};

export const LinkedinIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const GithubIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const BeRealIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" />
        <path d="M7.2 15.9V8.1h3.35c1.8 0 2.95.92 2.95 2.44 0 1.01-.5 1.78-1.35 2.14l1.66 3.22h-2.26l-1.34-2.75H9.35v2.75H7.2Zm2.15-4.47h1.03c.75 0 1.19-.31 1.19-.88 0-.56-.44-.87-1.19-.87H9.35v1.75Z" fill="#050505" />
        <path d="M14.3 15.9V8.1h5.24v1.66h-3.09v1.34h2.63v1.6h-2.63v1.54h3.2v1.66H14.3Z" fill="#050505" />
    </svg>
);

const DiscordIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
            d="M18.94 5.34A16.9 16.9 0 0 0 14.8 4l-.2.4a14.8 14.8 0 0 1 3.55 1.3 13.6 13.6 0 0 0-6.14-1.38A13.6 13.6 0 0 0 5.87 5.7 14.8 14.8 0 0 1 9.42 4.4l-.2-.4a16.9 16.9 0 0 0-4.15 1.34C2.45 9.25 1.74 13.06 2.1 16.82a17.1 17.1 0 0 0 5.08 2.58l.41-.67c-.96-.36-1.87-.82-2.72-1.39.23.17.47.33.72.48 2.08 1.24 4.31 1.79 6.42 1.79 2.12 0 4.34-.55 6.42-1.79.25-.15.49-.31.72-.48-.85.57-1.76 1.03-2.72 1.39l.41.67a17.1 17.1 0 0 0 5.08-2.58c.42-4.36-.72-8.14-2.97-11.48Z"
            fill="currentColor"
        />
        <ellipse cx="9.28" cy="12.04" rx="1.38" ry="1.66" fill="#050505" />
        <ellipse cx="14.72" cy="12.04" rx="1.38" ry="1.66" fill="#050505" />
    </svg>
);

const SnapchatIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
            d="M12 3.2c-2.5 0-4.3 1.82-4.3 4.32v1.22c0 .34-.17.65-.46.84l-.71.45c-.36.23-.34.76.04.95l.95.46c.14.07.2.24.13.39-.57 1.2-1.62 1.98-2.97 2.2-.38.06-.49.55-.17.77.89.62 1.87.96 2.95 1.03.22.01.41.16.48.37.52 1.54 1.95 2.56 4.06 2.9.21.03.43.03.64 0 2.11-.34 3.54-1.36 4.06-2.9.07-.21.26-.36.48-.37 1.08-.07 2.06-.41 2.95-1.03.32-.22.21-.71-.17-.77-1.35-.22-2.4-1-2.97-2.2-.07-.15-.01-.32.13-.39l.95-.46c.38-.19.4-.72.04-.95l-.71-.45a1 1 0 0 1-.46-.84V7.52C16.3 5.02 14.5 3.2 12 3.2Z"
            fill="currentColor"
            stroke="#050505"
            strokeWidth="0.9"
            strokeLinejoin="round"
        />
        <circle cx="9.7" cy="9.5" r="0.55" fill="#050505" />
        <circle cx="14.3" cy="9.5" r="0.55" fill="#050505" />
        <path d="M10 11.85c.55.3 1.13.45 2 .45s1.45-.15 2-.45" stroke="#050505" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
);

export const navLinks: NavLink[] = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Work" },
    { href: "/experience", label: "Experience" },
    { href: "/game", label: "Take a Break" },
    { href: "/contact", label: "Contact" },
    { href: "/social", label: "Socials" },
    { href: "/resume", label: "Resume" },
];

export const socialLinks: SocialLink[] = [
    {
        name: 'GitHub',
        url: 'https://github.com/TRUPALIX9',
        icon: <GithubIcon size={24} />,
        color: '#f5f5f5',
        handle: '@TRUPALIX9',
        blurb: 'Projects, source code, experiments, and technical work.',
        cta: 'Open GitHub',
    },
    {
        name: 'WhatsApp',
        url: 'https://wa.me/19432651855?text=Hi%20Trupal%2C%20I%20found%20your%20portfolio%20and%20wanted%20to%20connect.',
        icon: <MessageCircle size={24} />,
        color: '#25D366',
        handle: '+1 943 265 1855',
        blurb: 'Starts a chat instantly with a prefilled introduction message.',
        cta: 'Start WhatsApp Chat',
    },
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/trupal.life/',
        icon: <InstagramIcon size={24} />,
        color: '#E1306C',
        handle: '@trupal.life',
        blurb: 'Lifestyle, behind-the-scenes moments, and visual updates.',
        cta: 'Open Instagram',
    },
    {
        name: 'BeReal',
        url: 'https://bere.al/truepal',
        icon: <BeRealIcon size={24} />,
        color: '#f5f5f4',
        handle: '@truepal',
        blurb: 'BeReal profile for more personal, day-in-the-life updates.',
        cta: 'Open BeReal',
    },
    {
        name: 'Discord',
        url: 'https://discord.gg/qG3PUR64',
        icon: <DiscordIcon size={24} />,
        color: '#5865F2',
        handle: 'maybe.tru',
        blurb: 'Discord invite for direct conversation and community chat.',
        cta: 'Join Discord',
    },
    {
        name: 'Snapchat',
        url: 'https://www.snapchat.com/add/trupal_ix9?share_id=xQdmqszwbSk&locale=en-US',
        icon: <SnapchatIcon size={24} />,
        color: '#FFFC00',
        handle: '@trupal_ix9',
        blurb: 'Quick adds, casual moments, and story-based social updates.',
        cta: 'Add on Snapchat',
    },
    {
        name: 'Mobile',
        url: 'tel:+19432651855',
        icon: <Phone size={24} />,
        color: '#34d399',
        handle: '+1 943 265 1855',
        blurb: 'Direct phone call for quick conversations and follow-ups.',
        cta: 'Call Now',
        external: false,
    },
    {
        name: 'Email',
        url: 'mailto:trupal.work@gmail.com',
        icon: <Mail size={24} />,
        color: '#EA4335',
        handle: 'trupal.work@gmail.com',
        blurb: 'Best for project inquiries, collaboration, and formal outreach.',
        cta: 'Send Email',
        external: false,
    },
];
