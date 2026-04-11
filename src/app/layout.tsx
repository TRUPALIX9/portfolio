import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
    title: 'Trupal | Software Engineer',
    description: 'Portfolio of Trupal Patel, Full-Stack Software Engineer',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
            </head>
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
