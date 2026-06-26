'use client';

import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { useState } from 'react';

export default function PostsSection() {
  const { posts, loading, error } = usePosts({ limit: 15 });
  const [currentPage, setCurrentPage] = useState(0);

  const postsPerPage = 3;
  const totalPages = Math.ceil((posts?.length || 0) / postsPerPage);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  const visiblePosts = posts.slice(
    currentPage * postsPerPage,
    (currentPage + 1) * postsPerPage
  );

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 ">Loading posts...</p>
        </div>
      )}
      {error && <div className="text-center text-red-600 py-8">Error loading posts: {error.message}</div>}
      {!loading && !error && (
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-6 relative">
            {/* Posts Container with transition */}
            <div className="w-full grid sm:grid-cols-3 gap-6 transition-all duration-300 ease-in-out">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  image={post.image}
                  description={post.description}
                  date={new Date(post.date).toLocaleDateString()}
                  url={post.url}
                />
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="w-full flex justify-end my-[-12px]">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-3 transition-all hover:scale-110 ${!canGoPrev ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
              aria-label="Previous posts"
            >
              <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.02941 1.00001L1.37256 6.65686L7.02941 12.3137" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-3 transition-all hover:scale-110 ${!canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
              aria-label="Next posts"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.34312 1.00001L6.99997 6.65686L1.34312 12.3137" stroke="#4F8C7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )
      }
    </div >
  );
}
