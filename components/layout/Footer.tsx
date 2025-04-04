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
    <footer className="bg-white">
      <div className="w-full px-6 mx-auto py-12 sm:py-16 lg:px-8 flex-col justify-center gap-6">

        <div className="flex w-full lg:flex-row sm:flex-col justify-between items-start">
          <div className="justify-start text-emerald-950 text-2xl font-bold font-['Inter'] leading-loose">National Police Index</div>
          <div className="flex justify-start items-center gap-6 pb-6">
            {navigation.main.map((item) => (
              <div key={item.name} >
                <Link href={item.href} className="hover:text-gray-600 text-emerald-950 text-lg font-normal font-['Inter'] lg:leading-relaxed sm:leading-tight justify-start">
                  {item.name}
                </Link>
              </div>
            ))}

          </div>
        </div>

        <div className="logos-container flex pt-6 justify-start items-center gap-6">
          <Image
            src={logo1}
            alt="Logo 1"
            className="w-60 h-12 logo1 object-contain"
            width={238}
            height={50}
          />
          <Image
            src={logo2}
            alt="Logo 2"
            className="w-36 h-12 logo2 object-contain"
            width={150}
            height={50}
          />
          <Image
            src={logo3}
            alt="Logo 3"
            className="w-20 h-12 logo3 object-contain"
            width={76}
            height={50}
          />
        </div>
      </div>

    </footer>
  );
}
