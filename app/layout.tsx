import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";



const GTAG = process.env.NEXT_PUBLIC_GTAG;

const poppins = Poppins({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: 'swap',
    variable: '--font-poppins',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://frighet.ro'),

    title: "frighet.ro » Servicii Liofilizare",
    description: "Servicii profesionale de liofilizare (înghețare uscată) în România. Păstrăm calitatea, nutrienții și aroma produselor, extinzând durata de viață.",

    keywords: ['liofilizare', 'înghețare uscată', 'freeze drying', 'servicii liofilizare', 'conservare alimente', 'liofilizare fructe', 'liofilizare legume', 'liofilizare romania', 'frighet', 'prelungire termen valabilitate', 'conservare nutrienți'],

    icons: {
        icon: [
            { url: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
            { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
        ],
        shortcut: '/favicon.ico',
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },

    manifest: '/site.webmanifest',

    appleWebApp: {
        title: 'frighet.ro',
        statusBarStyle: 'black-translucent',
    },

    openGraph: {
        title: "frighet.ro » Servicii Liofilizare",
        description: "Servicii profesionale de liofilizare în România pentru conservarea optimă a produselor.",
        url: 'https://frighet.ro',
        siteName: 'frighet.ro',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Servicii de Liofilizare Profesională - frighet.ro',
            },
        ],
        locale: 'ro_RO',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "frighet.ro » Servicii Liofilizare",
        description: "Servicii profesionale de liofilizare în România pentru conservarea optimă a produselor.",
        images: ['/og-image.png'],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
    colorScheme: 'dark light',
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ro"
        >
            <body
                className={`${poppins.variable} font-sans bg-gray-900`}
            >
                {children}
            </body>

            {GTAG && (
                <GoogleAnalytics gaId={GTAG} />
            )}
        </html>
    );
}
