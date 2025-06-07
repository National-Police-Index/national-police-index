import Link from 'next/link';
import styles from './TeamCard.module.scss';

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
          <Link key={index} href={url} className={`text-[#122823] text-sm font-normal font-['Inter'] underline leading-tight hover:text-emerald-700 ${_}`}>
            {text}
          </Link>
        );
      }
      return (
        <span key={index} className="text-[#122823] text-sm font-normal font-['Inter'] leading-tight">
          {part}
        </span>
      );
    });
  };

  return (
    <div className={`w-full p-4 bg-zinc-100 rounded-2xl inline-flex flex-col justify-start items-start gap-2 ${styles.card}`}>
      <div className="self-stretch pb-2 border-b-[0.50px] border-[#2F5E50] inline-flex justify-start items-center gap-2">
        <div className="justify-start text-[#122823] text-base font-[500] font-['Inter'] leading-normal">
          {name}
        </div>
        <i className="justify-start text-[#122823] text-xs font-normal font-['Inter'] leading-none">
          {pronouns}
        </i>
      </div>
      <div className={`self-stretch justify-start ${styles.description}`}>
        {renderDescription(description)}
      </div>
    </div>
  );
}
