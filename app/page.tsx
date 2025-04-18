'use client';

import USMap from '@/components/map/USMap';
import PageHeader from '@/components/PageHeader';
import PostsSection from '@/components/PostsSection';
import styles from './styles.module.scss';

export default function Home() {

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

      <div className={`w-full bg-white rounded-tl-3xl rounded-tr-3xl pt-14 map-section ${styles.mapSection}`}>
        <div className="w-5/6 mx-auto">
          <div className="pt-4 border-t border-[#2F5E50] flex justify-start items-center ">
            <h2 className="justify-start text-[#122823] font-bold font-['Inter']">National Police Index data map</h2>
          </div>

          <div className="w-full mx-auto text-center mt-8 mb-14">

            <USMap />
          </div>
          <div className={`lg:p-14 p-6 mt-12 bg-zinc-100 rounded-3xl flex flex-col justify-start items-start gap-8 ${styles.recentReporting} `}>
            <div className="w-full pt-4 border-t border-[#2F5E50] flex justify-start items-center gap-2.5">
              <h2 className="justify-start text-[#122823] text-4xl font-bold font-['Inter'] tracking-tight">Recent reporting</h2>
            </div>

            <PostsSection />
          </div>
        </div>

      </div>
    </div>
  );
}
