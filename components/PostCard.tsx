interface PostCardProps {
  title?: string;
  image: string;
  description: string;
  date: string;
  url: string;
}

export default function PostCard({ title, image, description, date, url }: PostCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-center items-center gap-6 cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg rounded-3xl lg:p-4 p-2 "
    >
      <div className="relative w-full overflow-hidden rounded-3xl">
        <img
          className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
          src={image}
          alt={title || description}
        />
        <div className="absolute inset-0 bg-emerald-950 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </div>
      <div className="w-full flex flex-col justify-start items-start gap-2">
        <div className="justify-start text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed group-hover:text-emerald-800 transition-colors duration-300">
          {description}
        </div>
        <div className="justify-start text-slate-500 text-base font-normal font-['Inter'] leading-normal">
          {date}
        </div>
      </div>
    </a>

  );
}
