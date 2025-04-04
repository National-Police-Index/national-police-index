'use client';

import USMap from '@/components/map/USMap';

import PostCard from '../components/PostCard';
import { usePosts } from '@/hooks/usePosts';
import PostsSection from '@/components/PostsSection';

export default function Home() {
  const { posts, loading, error } = usePosts({ limit: 6 });

  return (
    <div className="w-full mx-auto">

      <div className="mx-auto lg:py-28 py-12 flex gap-8 lg:flex-row flex-col justify-between lg:items-end sm:items-start">
        <div className="w-full flex flex-col justify-start items-start gap-8">
          <div className="w-5/6 justify-start text-emerald-950 text-5xl font-bold font-['Inter'] tracking-wide">Is Police Employment History Data Public?</div>
          <div className="self-stretch justify-start text-emerald-950 text-lg font-normal font-['Inter'] tracking-wide">The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S.</div>
        </div>

        <div className="flex flex-col justify-center items-start gap-8">
          <div className="w-5/6 flex flex-col justify-start items-start gap-2">
            <div className="justify-start text-V7 text-7xl font-bold font-['Inter'] tracking-wide">27</div>
            <div className="self-stretch justify-start text-slate-500 text-lg font-semibold font-['Inter'] tracking-wide">States have released centralized employment history data.</div>
          </div>
          <div className="w-5/6 flex flex-col justify-start items-start gap-2">
            <div className="justify-start text-V7 text-7xl font-bold font-['Inter'] tracking-wide">23</div>
            <div className="self-stretch h-14 justify-start text-slate-500 text-lg font-semibold font-['Inter'] tracking-wide">Of which are currently represented on the data tool.</div>
          </div>
        </div>
      </div>


      <div className="w-full mx-auto pt-4 border-t border-emerald-950 flex justify-start items-center ">
        <div className="justify-start text-emerald-950 text-4xl font-bold font-['Inter'] tracking-tight">National Police Index data map</div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 mt-12 ">
        <USMap />
      </div>

      <div className="p-14 mt-12 bg-zinc-100 rounded-3xl flex flex-col justify-start items-start gap-8">
        <div className="w-full pt-4 border-t border-emerald-950 flex justify-start items-center gap-2.5">
          <div className="justify-start text-emerald-950 text-4xl font-bold font-['Inter'] tracking-tight">Recent reporting</div>
        </div>

        <PostsSection />
      </div>

    </div>
  );
}
