'use client';
import Link from 'next/link';
import { useStaticText } from '@/hooks/useStaticText';
import Image from 'next/image';

// Import images
import logo1 from '@/images/logo1.png';
import logo2 from '@/images/logo2.png';
import logo3 from '@/images/logo3.png';

import styles from './styles.module.scss';

const navigation = {
  main: [
    { name: 'Contact', href: 'https://invisible.institute/contact', target: '_blank' },
    { name: 'Github', href: 'https://github.com/ayyubibrahimi/us-post-data', target: '_blank' },
    { name: 'About', href: '/about', target: '_self' },
  ],
};

export default function Footer() {
  const { getText } = useStaticText('footer');
  return (
    <footer className={`w-full bg-white ${styles.footer}`}>
      <div className="container-a mx-auto flex flex-col">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Link href="/" className={`justify-start text-[#122823] font-bold font-['Inter'] ${styles.siteTitle}`}>
            {getText('site-title', 'National Police Index')}
          </Link>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                className="text-[#122823] hover:text-emerald-700 text-base sm:text-lg font-normal font-['Inter'] transition-colors duration-200"
              >
                {getText(item.name.toLowerCase(), item.name)}
              </Link>
            ))}
          </nav>
        </div>

        <div className={`flex flex-wrap justify-start items-center ${styles.logosContainer}`}>
          <div className="relative">
            <Image
              src={logo1}
              alt="Logo 1"
              />
          </div>
          <div className="relative">
            <Image
              src={logo2}
              alt="Logo 2"
            />
          </div>
          <div className="relative">
            <Image
              src={logo3}
              alt="Logo 3"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
