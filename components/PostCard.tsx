interface PostCardProps {
  title?: string;
  image: string;
  description: string;
  date: string;
}

export default function PostCard({ title, image, description, date }: PostCardProps) {
  return (
    <div className="flex flex-col gap-6 w-[392px]">
      <img 
        className="w-full h-[392px] object-cover"
        src={image}
        alt={title || "Post image"}
      />
      <p className="text-lg leading-[27px] text-black font-normal">
        {description}
      </p>
      <p className="text-base leading-6 text-black font-normal">
        {date}
      </p>
    </div>
  );
}
