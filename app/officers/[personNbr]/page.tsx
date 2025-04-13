'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOfficerByPersonNbr } from '@/hooks/useOfficerByPersonNbr';
import PageHeader from '@/components/PageHeader';
import { formatDate } from 'date-fns/format';
import { enGB } from 'date-fns/locale/en-GB';

export default function OfficerProfilePage() {
  const { personNbr } = useParams();
  const { loading, error, officerData } = useOfficerByPersonNbr(personNbr as string);

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

  return (

    <div className="w-full mx-auto">
      <PageHeader
        title={latestRecord.full_name}
        description={`Latest Agency: ${latestRecord.agency_name}`}
        statistics={[
          {
            value: records.length,
            label: "Departments the officer has worked at over their career"
          }
        ]}
      />

      <div className="w-full bg-white rounded-tl-3xl rounded-tr-3xl pt-12 ">
        <div className="w-5/6 mx-auto ">



          <div className="w-full flex lg:flex-row flex-col items-start gap-6 lg:justify-between lg:py-14 ">

            <div className="w-full px-4 py-8 flex flex-col justify-start items-start gap-4">

              <div className="self-stretch flex justify-center items-center gap-2">
                <div className="flex-1 justify-start text-emerald-950 text-xl font-bold font-['Inter'] leading-7">{latestRecord.full_name}</div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch py-2 border-t-[0.50px] border-b-[0.50px] border-emerald-950 flex justify-center items-center gap-2">
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">UID Number</div>
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">{latestRecord.person_nbr}</div>
                </div>
                <div className="self-stretch pb-2 border-b-[0.50px] border-emerald-950 flex justify-center items-center gap-2">
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">Last Agency Name</div>
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">{latestRecord.agency_name}</div>
                </div>
                <div className="self-stretch pb-2 border-b-[0.50px] border-emerald-950 inline-flex justify-center items-center gap-2">
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">Date</div>
                  <div className="flex-1 justify-start text-emerald-950 text-base font-normal font-['Inter'] leading-normal">{formatDate(latestRecord.start_date, 'yyyy-MM-dd', { locale: enGB })}</div>
                </div>
              </div>
            </div>


            <div className="w-full p-6 lg:p-8 bg-zinc-100 rounded-3xl flex flex-col justify-start items-start gap-6 relative overflow-hidden">
              <div className="self-stretch pb-4 border-b border-emerald-900/10 flex items-center justify-between">
                <h2 className="text-emerald-950 text-xl font-bold">Timeline</h2>
                {false && <span className="text-sm text-emerald-700">{records.length} Records</span>}
              </div>

              {Object.entries(records.reduce((acc, record) => {
                const year = new Date(record.start_date).getFullYear();
                if (!acc[year]) acc[year] = [];
                acc[year].push(record);
                return acc;
              }, {} as { [key: string]: typeof records })).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, yearRecords]) => (
                <div key={year} className="flex flex-col w-full gap-4">
                  <div className="text-emerald-950 text-lg font-bold">{year}</div>
                  <div className="w-full flex flex-col gap-2">
                    {yearRecords
                      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                      .map((record, index) => (
                        <div key={`${record.document_id}-${index}`} className="flex flex-col w-full gap-4 ">
                          <div className="w-full flex flex-row justify-between lg:gap-6 gap-2">
                            <div className="lg:w-[100px] w-[70px] justify-start text-emerald-950 text-sm font-normal font-['Inter'] ">

                              {formatDate(record.start_date, 'MMMM d', { locale: enGB })}

                            </div>
                            <div className="flex-1 justify-start text-emerald-950 text-sm font-normal font-['Inter'] ">
                              <h3 className="mt-1 text-base font-medium text-gray-900">
                                {record.agency_name}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {record.position || 'Position not specified'}
                              </p>
                            </div>
                            <div className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-500 flex items-center gap-2.5">

                              <div className={`${record.status?.toLowerCase().includes('terminated') ? 'text-V7' :
                                record.status?.toLowerCase().includes('resigned') ? 'text-slate-500' :
                                  'text-slate-500'} justify-start  text-base font-bold font-['Inter'] leading-snug`}>{record.status || 'Active'}</div>
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
