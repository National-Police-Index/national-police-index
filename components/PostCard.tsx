interface PostCardProps {
  title?: string;
  image: string;
  description: string;
  date: string;
  url: string;
}

import styles from './styles.module.scss';

export default function PostCard({ title, image, description, date, url }: PostCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col justify-center items-center gap-6 cursor-pointer transition-transform duration-300 rounded-3xl ${styles.postCard}`}
    >
      <div className={`relative w-full overflow-hidden rounded-3xl ${styles.imageWrapper}`}>
        <img
          className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
          src={image}
          alt={title || description}
        />
        <div className="absolute inset-0 bg-[#2F5E50] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </div>
      <div className={`w-full flex flex-col justify-start items-start gap-2 ${styles.textWrapper}`}>
        <div className="justify-start text-[#122823] font-normal font-['Inter'] leading-[1.5] tracking-[-.01em] transition-colors duration-300">
          {description}
        </div>
        <div className="justify-start text-[#4F8C7E] text-base font-normal font-['Inter'] leading-normal">
          {date}
        </div>
      </div>
    </a>

  );
}
