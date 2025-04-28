'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOfficerByPersonNbr } from '@/hooks/useOfficerByPersonNbr';
import { useStaticText } from '@/hooks/useStaticText';
import PageHeader from '@/components/PageHeader';
import { format } from 'date-fns';
import styles from './page.module.scss';

// Extend the PoliceOfficer type to include eventType
type PoliceOfficerWithEventType = PoliceOfficer & {
  eventType: 'Start' | 'End';
};

export default function OfficerProfilePage() {
  const { personNbr } = useParams();
  const { loading, error, officerData } = useOfficerByPersonNbr(personNbr as string);
  const { getText } = useStaticText('officer');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading officer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  if (!officerData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-600">
          Officer not found
        </div>
      </div>
    );
  }

  const { latestRecord, records } = officerData;
  console.log('Officer data', officerData);
  const fullName = latestRecord.full_name || latestRecord.first_name + ' ' + latestRecord.last_name;

  const timeline = records.reduce((acc, record) => {
    const startYear = new Date(record.start_date).getFullYear();
    const endYear = record.end_date ? new Date(record.end_date).getFullYear() : null;
    const startDate = new Date(record.start_date);
    const endDate = record.end_date ? new Date(record.end_date) : null;
    const eventType: PoliceOfficerWithEventType = {
      agency: record.agency_name,
      eventType: 'Start',
      startDate
    };
    const endEventType: PoliceOfficerWithEventType = {
      agency: record.agency_name,
      eventType: 'End',
      endDate
    };
    if (!acc[startYear]) acc[startYear] = [];
    acc[startYear].push(eventType);
    if (endYear && endYear !== startYear) {
      if (!acc[endYear]) acc[endYear] = [];
      acc[endYear].push(endEventType);
    }
    return acc;
  }, {} as { [key: string]: PoliceOfficerWithEventType[] });
  console.log('Timeline', timeline);

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={fullName}
        //description={`Latest Agency: ${latestRecord.agency_name}`}
        statistics={[
          {
            value: records.length,
            label: "Departments the officer has worked at over their career"
          }
        ]}
      />

      <div className={`w-full relative bg-white rounded-tl-3xl rounded-tr-3xl ${styles.contentSection} `}>
        <div className="container-a mx-auto ">

          <div className={`w-full flex lg:flex-row flex-col items-start lg:justify-between ${styles.content}`}>

            <div className="w-full px-4 py-8 flex flex-col justify-start items-start ">

              {/* <div className="self-stretch flex justify-center items-center">
                <div className="flex-1 justify-start text-[#122823] text-xl font-bold font-['Inter'] leading-7">{fullName}</div>
                  </div>
              </div> */}
              <div className={`self-stretch flex flex-col justify-start items-start ${styles.officeData} `}>
                <div className="self-stretch border-b-[0.50px] border-[#2F5E50] flex justify-center items-center ">
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">{getText('uid', 'UID Number')}</div>
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">{latestRecord.person_nbr}</div>
                </div>
                <div className="self-stretch border-b-[0.50px] border-[#2F5E50] flex justify-center items-center ">
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">Last Agency Name</div>
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">
                    <Link href={`/agencies/${encodeURIComponent(latestRecord.agency_name)}`} className="text-emerald-600 hover:text-emerald-500">
                      {latestRecord.agency_name}
                    </Link>
                  </div>
                </div>
                <div className="self-stretch border-b-[0.50px] border-[#2F5E50] inline-flex justify-center items-center ">
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">Date</div>
                    <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">
                      {new Date(latestRecord.start_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </div>
                </div>
              </div>
            </div>

            <div className={`w-full rounded-3xl flex flex-col justify-start items-start relative overflow-hidden ${styles.timeline}`}>
              <div className="self-stretch flex items-center justify-between">
                <h2 className="text-[#122823] h4">Timeline</h2>
                {false && <span className="text-sm text-emerald-700">{records.length} Records</span>}
              </div>

                {Object.entries(timeline)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([year, events]) => (
                  <div key={year} className={`flex flex-col w-full ${styles.timelineYear}`}>
                  <div className="text-[#122823] font-bold">{year}</div>
                  <div className={`w-full flex flex-col ${styles.timelineEvents}`}>
                    {events
                    .sort((a, b) => {
                      const dateA = a.eventType === 'Start' ? a.startDate : a.endDate!;
                      const dateB = b.eventType === 'Start' ? b.startDate : b.endDate!;
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((event, index) => (
                      <div key={`${event.agency}-${event.eventType}-${index}`} className="flex flex-col w-full ">
                      <div className={`w-full flex flex-row justify-between items-center ${styles.timelineItem}`}>
                        <div className={`justify-start text-[#122823] text-sm font-normal font-['Inter'] ${styles.timelineDate}`}>
                          <span className={styles.timelineDateDesktop}>
                            {new Date(
                              event.eventType === 'Start' ? event.startDate : event.endDate!
                            ).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </span>
                          <span className={styles.timelineDateMobile}>
                            {new Date(
                              event.eventType === 'Start' ? event.startDate : event.endDate!
                            ).toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </span>
                        </div>
                        <div className="flex-1 justify-start text-[#122823] text-sm font-normal font-['Inter']">
                          {event.agency}
                        </div>
                        <div className={`${styles.timelineType}`}>
                          {event.eventType === 'Start' ? <>Start<span> Date</span></> : <>End<span> Date</span></>}
                        </div>
                      </div>
                      </div>
                    ))}
                  </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
