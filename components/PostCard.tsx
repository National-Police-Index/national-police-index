interface PostCardProps {
  title?: string;
  image: string;
  description: string;
  date: string;
}

export default function PostCard({ title, image, description, date }: PostCardProps) {
  return (

    <div className="flex flex-col justify-center items-center gap-6">
      <img className="w-5/6 rounded-3xl" src={image} />
      <div className="w-5/6 flex flex-col justify-start items-start gap-2">
        <div className="justify-start text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed">
          {description}
        </div>
        <div className="justify-start text-slate-500 text-base font-normal font-['Inter'] leading-normal">

          {date}
        </div>
      </div>
    </div>

  );
}
