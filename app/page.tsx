'use client';

import USMap from '@/components/map/USMap';

import PostCard from '../components/PostCard';
import { usePosts } from '@/hooks/usePosts';

export default function Home() {
  const { posts, loading, error } = usePosts({ limit: 6 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="max-w-3xl mx-auto flex flex-col justify-center items-center gap-14">
        <div className="text-center justify-start text-black text-5xl font-bold font-['Inter'] leading-[57.60px] tracking-wide">
          Is Police Employment History Data Public?

        </div>
        <div className="text-center justify-start text-black text-lg font-normal font-['Inter'] leading-relaxed">
          The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S. In total, 27 states have released centralized employment history data, 23 of which are currently represented on the data tool.

        </div>
      </div>

      <div className="text-center mb-12">
        <USMap />
      </div>

      <div className="bg-white py-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-start items-start gap-8 overflow-hidden">

          <div className="justify-start text-black text-4xl font-bold font-['Inter'] leading-[48px] tracking-tight">Recent Reporting</div>
          <div className="flex flex-col gap-6">
            {loading && <div className="text-center">Loading posts...</div>}
            {error && <div className="text-center text-red-600">Error loading posts: {error.message}</div>}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    image={post.image}
                    description={post.description}
                    date={new Date(post.date).toLocaleDateString()}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
