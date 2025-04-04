'use client';

import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';

export default function PostsSection() {
  const { posts, loading, error } = usePosts({ limit: 6 });

  return (
    <div className="w-full">
      {loading && <div className="text-center">Loading posts...</div>}
      {error && <div className="text-center text-red-600">Error loading posts: {error.message}</div>}
      {!loading && !error && (
        <div className="flex flex-col justify-start items-start gap-3">
          <div className="flex lg:flex-row flex-col justify-start items-start gap-6">
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

          <div data-svg-wrapper className="w-full flex mt-4 justify-end">
            <svg width="41" height="14" viewBox="0 0 41 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.02941 1.00001L1.37256 6.65686L7.02941 12.3137" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M34.3431 1.00001L40 6.65686L34.3431 12.3137" stroke="#122823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
