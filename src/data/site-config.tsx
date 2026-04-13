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
    external?: boolean;
};

const GithubIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.49-.5-2.7-1.35-3.68.14-.33.6-1.74-.15-3.63 0 0-1.12-.36-3.7 1.38a12.8 12.8 0 0 0-6.7 0c-2.58-1.74-3.7-1.38-3.7-1.38-.75 1.89-.29 3.3-.15 3.63-.85.98-1.35 2.19-1.35 3.68 0 5.6 3.32 6.81 6.5 7.16A4.8 4.8 0 0 0 3 18.28V22" />
    </svg>
);

export const LinkedinIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const SnapchatIcon = ({ size = 24 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.186 1.834c-2.327 0-4.013.916-4.636 2.502-.38.966-.356 2.128-.313 2.97.027.525.042.827-.137.954-.188.132-1.04.14-1.895.146-.388.003-.541.229-.27.575 1.139 1.458 2.223 2.378 3.528 2.923.468.204.382.493.181.794-.21.312-.66.696-1.127 1.092-.934.792-2.008 1.703-2.35 2.164-.287.387-.168.756.233.722 1.341-.112 2.7-.225 3.328-.158.33.036.568.216.711.536.216.485.452.883.692 1.25.753 1.144 1.576 1.328 1.869 1.328.293 0 1.116-.184 1.869-1.328.24-.367.476-.765.692-1.25.143-.32.381-.5.711-.536.628-.067 1.987.046 3.328.158.401.034.52.335.233.722-.34.457-1.408 1.364-2.342 2.155-.472.399-.927.785-1.14 1.101-.202.301-.288.59.181.794 1.305.545 2.389 1.465 3.528 2.923.271.346.118.572-.27.575-.855.006-1.706-.014-1.895-.146-.179-.127-.164-.429-.137-.954.043-.842.067-2.004-.313-2.97-.623-1.586-2.309-2.502-4.636-2.502z" />
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
        color: '#ffffff',
    },
    {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/trupalix',
        icon: <LinkedinIcon size={24} />,
        color: '#0077b5',
    },
    {
        name: 'WhatsApp',
        url: 'https://wa.me/19432651855',
        icon: <MessageCircle size={24} />,
        color: '#25D366',
    },
    {
        name: 'Instagram',
        url: 'https://instagram.com/trupal',
        icon: <InstagramIcon size={24} />,
        color: '#E1306C',
    },
    {
        name: 'Snapchat',
        url: 'https://snapchat.com/add/trupal',
        icon: <SnapchatIcon size={24} />,
        color: '#FFFC00',
    },
    {
        name: 'Mobile',
        url: 'tel:+19432651855',
        icon: <Phone size={24} />,
        color: '#34d399',
        external: false,
    },
    {
        name: 'Email',
        url: 'mailto:trupal.work@gmail.com',
        icon: <Mail size={24} />,
        color: '#EA4335',
        external: false,
    },
];
