import Link from 'next/link';

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Github', href: '/github' },
    { name: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white">

      <div className="w-full px-6 mx-auto overflow-hidden py-12 sm:py-16 lg:px-8 flex-col justify-center gap-6">

        <div className="flex justify-between items-start">
          <div className="justify-start text-black text-3xl font-medium font-['Inter'] leading-10 tracking-tight">National Police Index</div>
          <div className="flex justify-start items-center gap-6">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link href={item.href} className="hover:text-gray-600 justify-start text-black text-lg font-normal font-['Inter'] leading-relaxed">
                {item.name}
              </Link>
            </div>
          ))}
 
        </div>
        </div>

        <div className="flex pt-6 justify-start items-center gap-6">
          <img className="w-60 h-12" src="https://placehold.co/238x50" />
          <img className="w-36 h-12" src="https://placehold.co/150x50" />
          <img className="w-20 h-12" src="https://placehold.co/76x50" />
        </div>
      </div>

    </footer>
  );
}
