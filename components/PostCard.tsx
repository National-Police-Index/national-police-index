interface PostCardProps {
  title?: string;
  image: string;
  description: string;
  date: string;
  url: string;
}

import styles from './styles.module.scss';
import Image from 'next/image';

export default function PostCard({ title, image, description, date, url }: PostCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col justify-center items-center gap-6 cursor-pointer transition-transform duration-300 ${styles.postCard}`}
    >
      <div className={`relative w-full overflow-hidden ${styles.imageWrapper}`}>
        <Image
          className="w-full h-96 object-cover"
          src={image}
          alt={title || description}
          width={800}
          height={600}
        />
        <div className="absolute inset-0 bg-[#2F5E50] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </div>
      <div className={`w-full flex flex-col justify-start items-start gap-2 ${styles.textWrapper}`}>
        <div className="justify-start text-[#122823] font-normal font-['Inter'] leading-[1.5] tracking-[-.005em] transition-colors duration-300">
          {description}
        </div>
        <div className="justify-start text-[#4F8C7E] text-base font-normal font-['Inter'] leading-normal">
          {date}
        </div>
      </div>
    </a>

  );
}
