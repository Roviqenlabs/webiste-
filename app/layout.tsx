import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Roviqen Labs | AI, IT & Robotics',
  description: 'Roviqen Labs builds practical AI, IoT, software and robotics prototypes for businesses.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{margin:0,background:'#020b1c'}}>{children}</body></html>;
}
