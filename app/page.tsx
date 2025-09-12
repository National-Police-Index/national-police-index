import { getStaticText, getText } from '@/lib/getStaticText';
import USMap from '@/components/map/USMap';
import PageHeader from '@/components/PageHeader';
import PostsSection from '@/components/PostsSection';
import styles from './styles.module.scss';

export default async function Home() {
  const texts = await getStaticText();

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={true}
        title={getText(texts, 'home', 'title', 'National Police Index')}
        description={getText(texts, 'home', 'subtitle', 'Search and explore police officer records across the United States')}
        statistics={[
          {
            value: parseInt(getText(texts, 'home', 'states-count-value', '27')),
            label: getText(texts, 'home', 'states-count', 'States with public records')
          },
          {
            value: getText(texts, 'home', 'officers-count-value', '999999'),
            label: getText(texts, 'home', 'officers-count', 'Officers in database'),
            literal: true
          }
        ]}
      />
      <div className={`w-full bg-white ${styles.mapSection}`}>
        <div className="container-a mx-auto">
          <div className="pt-4 border-t border-[#2F5E50] flex justify-start items-center ">
            <h2 className="justify-start text-[#122823] font-bold font-['Inter']">National Police Index data map</h2>
          </div>

          <div className={`w-full mx-auto text-center ${styles.mapComponentContainer}`}>

            <USMap />
          </div>
          <div className={`flex flex-col justify-start items-start ${styles.recentReporting} `}>
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
