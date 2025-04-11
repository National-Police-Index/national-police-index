import Link from 'next/link';
import Image from 'next/image';

// Import images
import logo1 from '@/images/logo1.png';
import logo2 from '@/images/logo2.png';
import logo3 from '@/images/logo3.png';

const navigation = {
  main: [
    { name: 'Contact', href: '/contact' },
    { name: 'Github', href: '/github' },
    { name: 'About', href: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      <div className="w-5/6 mx-auto container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col gap-8 sm:gap-12">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="text-emerald-950 text-xl sm:text-2xl font-bold font-['Inter'] leading-loose">National Police Index</div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-emerald-950 hover:text-emerald-700 text-base sm:text-lg font-normal font-['Inter'] transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap justify-start items-center gap-6 ">
          <div className="w-full sm:w-auto aspect-[4.76/1]  relative max-w-[238px] min-w-[160px]">
            <Image
              src={logo1}
              alt="Logo 1"
              className="object-contain"
              fill
              sizes="(max-width: 640px) 100vw, 238px"
            />
          </div>
          <div className="w-full sm:w-auto aspect-[3/1] relative max-w-[150px] min-w-[100px]">
            <Image
              src={logo2}
              alt="Logo 2"
              className="object-contain"
              fill
              sizes="(max-width: 640px) 100vw, 150px"
            />
          </div>
          <div className="w-full sm:w-auto aspect-[1.52/1] relative max-w-[76px] min-w-[50px]">
            <Image
              src={logo3}
              alt="Logo 3"
              className="object-contain"
              fill
              sizes="(max-width: 640px) 100vw, 76px"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
