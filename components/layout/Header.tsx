import Link from 'next/link';
import { NavigationItem } from '@/types';

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'States', href: '/states', current: false },
  { name: 'About', href: '/about', current: false },
];

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="sr-only">National Police Index</span>
              <span className="text-2xl font-bold text-gray-900">National Police Index</span>
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-700 hover:text-gray-900"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <Link
              href="/search"
              className="inline-block rounded-md border border-transparent bg-blue-600 py-2 px-4 text-base font-medium text-white hover:bg-blue-700"
            >
              Search Records
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 py-4 lg:hidden">
          {navigation.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-gray-700 hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
