'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PoliceOfficer } from '@/types';
import { useOfficerByPersonNbr } from '@/hooks/useOfficerByPersonNbr';
import { useStaticText } from '@/hooks/useStaticText';
import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';
import { US_STATES } from '@/constants/states';

// Extend the PoliceOfficer type to include eventType
type PoliceOfficerWithEventType = PoliceOfficer & {
  eventType: 'Start' | 'End' | 'Discipline';
  startDate?: Date,
  endDate?: Date,
  agency?: string,
  offense?: string,
  separation_reason?: string,
  rank?: string
};

export default function OfficerProfilePage() {
  const { personNbr } = useParams();
  const { loading, error, officerData } = useOfficerByPersonNbr(personNbr as string);
  const { getText } = useStaticText('officer');
  const stateData = US_STATES.find(s => s.reference.toLowerCase() === officerData?.latestRecord.state.toLowerCase());
  console.log('Officer data', officerData);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 ">Loading officer profile...</p>
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
        <div className="text-center py-12 ">
          Officer not found
        </div>
      </div>
    );
  }

  const { latestRecord, records } = officerData;
  const fullName = latestRecord.full_name || ((latestRecord.last_name || latestRecord.middle_name) + ', ' + latestRecord.first_name);

  // Helper functions to improve readability and reduce duplication
  /**
   * Safely formats a date to ISO string with error handling
   */
  const safeFormatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    try {
      return date.toISOString();
    } catch (exception) {
      console.error('Error converting date to ISO string:', exception);
      return '';
    }
  };

  /**
   * Creates an event object for the timeline based on record and event type
   */
  const createEventObject = (record: PoliceOfficer, eventType: 'Start' | 'End' | 'Discipline', dateString: string): PoliceOfficerWithEventType => {
    const isDiscipline = record.offense || record.sanction;
    
    return {
      agency_name: record.agency_name,
      eventType: isDiscipline ? 'Discipline' : eventType,
      // Only add the relevant date property
      ...(eventType === 'Start' && { start_date: dateString }),
      ...(eventType === 'End' && { end_date: dateString }),
      ...(eventType === 'Discipline' && { sanction_date: dateString }),
      rank: record.rank,
      offense: record.offense || record.sanction,
      separation_reason: record.separation_reason,
      violation: record.violation
    } as PoliceOfficerWithEventType;
  };

  /**
   * Ensures a year entry exists in the accumulator
   */
  const ensureYearEntry = (acc: { [year: string]: PoliceOfficerWithEventType[] }, year: number | null): void => {
    if (year && !acc[year]) {
      acc[year] = [];
    }
  };

  /**
   * Updates the offense information when there are multiple offenses on the same date
   */
  const updateOffenseInfo = (acc: { [year: string]: PoliceOfficerWithEventType[] }, dateKey: string, event: PoliceOfficerWithEventType): boolean => {
    const dateField = event.eventType === 'Start' ? 'start_date' : 'end_date';
    const index = (acc[dateKey] || []).findIndex(item => item[dateField] === event[dateField]);
    
    if (index > -1 && event.offense) {
      acc[dateKey][index] = { 
        ...acc[dateKey][index], 
        offense: `${acc[dateKey][index].offense || ''}, ${event.offense}` 
      };
      return true;
    }
    return false;
  };

  /**
   * Adds an event to the timeline accumulator
   */
  const addEventToTimeline = (
    acc: { [year: string]: PoliceOfficerWithEventType[] },
    officerRecords: { [key: string]: PoliceOfficerWithEventType },
    event: PoliceOfficerWithEventType,
    year: number | null,
    dateKey: string
  ): void => {
    ensureYearEntry(acc, year);
    
    if (!officerRecords[dateKey] || !updateOffenseInfo(acc, dateKey, event)) {
      officerRecords[dateKey] = event;
      if (year) {
        acc[year].push(event);
      }
    }
  };

  // Generate the timeline using the new helper functions
  const officerRecords = {} as { [key: string]: PoliceOfficerWithEventType };
  const timeline = records.reduce((acc = {}, record) => {
    // Extract all date information once
    const startDate = record.start_date ? new Date(record.start_date) : null;
    const endDate = record.end_date ? new Date(record.end_date) : null;
    const sanctionDate = record.sanction_date ? new Date(record.sanction_date) : null;
    
    const startYear = startDate?.getFullYear() || null;
    const endYear = endDate?.getFullYear() || null;
    const disciplineYear = sanctionDate?.getFullYear() || null;

    const startDateString = safeFormatDate(startDate);
    const endDateString = safeFormatDate(endDate);
    const sanctionDateString = safeFormatDate(sanctionDate);

    // Handle start date event
    if (startDate) {
      const startEvent = createEventObject(record, 'Start', startDateString);
      addEventToTimeline(acc, officerRecords, startEvent, startYear, startDateString);
    }

    // Handle end date event if it exists
    if (endDate) {
      const endEvent = createEventObject(record, 'End', endDateString);
      addEventToTimeline(acc, officerRecords, endEvent, endYear, endDateString);
    }

    // Handle discipline event if it exists
    if ((record.offense || record.sanction) && sanctionDate) {
      const disciplineEvent = createEventObject(record, 'Discipline', sanctionDateString);
      addEventToTimeline(acc, officerRecords, disciplineEvent, disciplineYear, sanctionDateString);
    }

    return acc;
  }, {} as { [key: string]: PoliceOfficerWithEventType[] });
  console.log('timeline', timeline);

  return (
    <div className="w-full mx-auto">
      <PageHeader
        home={false}
        title={fullName}
        //description={`Latest Agency: ${latestRecord.agency_name}`}
        statistics={[
          {
            value: Object.keys((records || []).reduce((acc, record) => {
              const start_date = record.start_date;
              if (!acc[start_date]) acc[start_date] = 0;
              acc[start_date]++;
              return acc;
            }, {} as { [key: string]: number })).length,
            label: "Departments the officer has worked at over their career",
            tooltip: records.length > 1 ? "†Officers sometimes work at multiple departments at one time" : ""
          }
        ]}
        titleCapitalize
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
                  <div className="flex-1 justify-start text-[#122823] text-base font-bold font-['Inter'] leading-normal">{getText('uid', 'UID Number')}</div>
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">{latestRecord.person_nbr}</div>
                </div>
                {stateData && (
                  <div className="self-stretch border-b-[0.50px] border-[#2F5E50] flex justify-center items-center ">
                    <div className="flex-1 justify-start text-[#122823] text-base font-bold font-['Inter'] leading-normal">{getText('state', 'State')}</div>
                    <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal capital-text">{stateData.name}</div>
                  </div>)}
                <div className="self-stretch border-b-[0.50px] border-[#2F5E50] flex justify-center items-center ">
                  <div className="flex-1 justify-start text-[#122823] text-base font-bold font-['Inter'] leading-normal">{latestRecord.end_date ? 'Latest Agency' : 'Current Agency'}</div>
                  <div className={`flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal ${styles.agencyName}`}>
                    {latestRecord.agency_name}
                  </div>
                </div>
                <div className="self-stretch border-b-[0.50px] border-[#2F5E50] inline-flex justify-center items-center ">
                  <div className="flex-1 justify-start text-[#122823] text-base font-bold font-['Inter'] leading-normal">{latestRecord.end_date && latestRecord.end_date !== '0000-00-00' ? 'Period' : 'Start Date'}</div>
                  <div className="flex-1 justify-start text-[#122823] text-base font-normal font-['Inter'] leading-normal">
                    {new Date(latestRecord.start_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })}
                    {latestRecord.end_date && latestRecord.end_date !== '0000-00-00' && (
                      <span className="text-[#122823] text-base font-normal font-['Inter'] leading-normal"> - {new Date(latestRecord.end_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC'
                      })}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`w-full rounded-3xl flex flex-col justify-start items-start relative overflow-hidden ${styles.timeline}`}>
              <div className="self-stretch flex items-center justify-between">
                <h2 className="text-[#122823] h4">Timeline</h2>
                {false && <span className="text-sm">{records.length} Records</span>}
              </div>

              {Object.entries(timeline)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([year, events]) => (
                  <div key={year} className={`flex flex-col w-full ${styles.timelineYear}`}>
                    <div className="text-[#122823] font-bold">{year}</div>
                    <div className={`w-full flex flex-col ${styles.timelineEvents}`}>
                      {events
                        .sort((a, b) => {
                          const dateA = a.eventType === 'Start' ? new Date(a.start_date) : new Date(a.end_date);
                          const dateB = b.eventType === 'Start' ? new Date(b.start_date) : new Date(b.end_date);
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map((event, index) => (
                          <div key={`${event.agency_name}-${event.eventType}-${index}`} className="flex flex-col w-full ">
                            <div className={`w-full flex flex-row justify-between items-center ${styles.timelineItem}`}>
                              <div className={`justify-start text-[#122823] text-sm font-normal font-['Inter'] ${styles.timelineDate}`}>
                                <span className={styles.timelineDateDesktop}>
                                  {new Date(
                                    event.eventType === 'Start' ? event.start_date || new Date() : event.end_date || new Date()
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'UTC',
                                  })}
                                </span>
                                <span className={styles.timelineDateMobile}>
                                  {new Date(
                                    event.eventType === 'Start' ? event.start_date || new Date() : event.end_date || new Date()
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'UTC',
                                  })}
                                </span>
                              </div>
                              <div className={`flex-1 justify-start text-sm font-normal font-['Inter'] ${styles.timelineAgency}`}>
                                <Link href={`/agencies/${encodeURIComponent(latestRecord.agency_name)}`} className="">
                                  {event.rank ? <span>{event.rank.toLowerCase()}</span> : ''}
                                  <small>{event.agency_name}</small>
                                </Link>
                                {event.offense ? <b><small>{event.offense}</small></b> : ''}
                              </div>
                              <div className={`${styles.timelineType} ${styles[event.eventType]}`}>
                                {event.eventType === 'Start' ? <>Start<span> Date</span></> : event.eventType === 'End' ? <>End<span> Date</span></> : <>Discipline</>}
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
