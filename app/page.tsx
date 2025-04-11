'use client';

import USMap from '@/components/map/USMap';
import PostCard from '../components/PostCard';
import { usePosts } from '@/hooks/usePosts';
import PageHeader from '@/components/PageHeader';
import PostsSection from '@/components/PostsSection';

export default function Home() {
  const { posts, loading, error } = usePosts({ limit: 6 });

  return (
    <div className="w-full mx-auto">

      <PageHeader
        title="Is Police Employment History Data Public?"
        description="The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S."
        statistics={[
          {
            value: 27,
            label: "States have released centralized employment history data."
          },
          {
            value: 23,
            label: "Of which are currently represented on the data tool."
          }
        ]}
      />

      <div className="w-full bg-white rounded-tl-3xl rounded-tr-3xl pt-12 ">
        <div className="w-5/6 mx-auto">
          <div className="pt-4 border-t border-emerald-950 flex justify-start items-center ">
            <div className="justify-start text-emerald-950 text-4xl font-bold font-['Inter'] tracking-tight">National Police Index data map</div>
          </div>

          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 mt-12 ">

            <USMap />
          </div>
          <div className="p-14 mt-12 bg-zinc-100 rounded-3xl flex flex-col justify-start items-start gap-8">
            <div className="w-full pt-4 border-t border-emerald-950 flex justify-start items-center gap-2.5">
              <div className="justify-start text-emerald-950 text-4xl font-bold font-['Inter'] tracking-tight">Recent reporting</div>
            </div>

            <PostsSection />
          </div>
        </div>

      </div>
    </div>
  );
}
