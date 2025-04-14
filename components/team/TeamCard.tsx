import Link from 'next/link';

interface TeamMember {
  name: string;
  pronouns: string;
  description: string;
}

export default function TeamCard({ name, pronouns, description }: TeamMember) {
  // Split description by links and render them accordingly
  const renderDescription = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [_, text, url] = linkMatch;
        return (
          <Link key={index} href={url} className={`text-emerald-950 text-sm font-normal font-['Inter'] underline leading-tight hover:text-emerald-700 ${_}`}>
            {text}
          </Link>
        );
      }
      return (
        <span key={index} className="text-emerald-950 text-sm font-normal font-['Inter'] leading-tight">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="w-full min-h-[150px] p-4 bg-zinc-100 rounded-2xl inline-flex flex-col justify-start items-start gap-2">
      <div className="self-stretch pb-2 border-b-[0.50px] border-emerald-950 inline-flex justify-start items-center gap-2">
        <div className="justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">
          {name}
        </div>
        <div className="justify-start text-emerald-950 text-xs font-normal font-['Inter'] leading-none">
          {pronouns}
        </div>
      </div>
      <div className="self-stretch justify-start">
        {renderDescription(description)}
      </div>
    </div>
  );
}
