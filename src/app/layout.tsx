import type { Metadata, Viewport } from 'next';
import './globals.css';
import './island.css';
import './portfolio-panels.css';
import './sunset.css';
import './ui.css';
import './explore-navigation.css';

export const metadata: Metadata = {
  title: 'Gaurav’s World',
  description: 'Explore Gaurav Bhaturkar’s interactive coastal island. Walk through the house, discover Echo Music and Badminton, and get to know Gaurav.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#768a70',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser theme extensions may add attributes to this root before hydration.
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
