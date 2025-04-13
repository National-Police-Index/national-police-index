import Link from 'next/link';
import { format } from 'date-fns';
import { PoliceOfficer } from '@/types';

interface OfficerCardProps {
  officer: PoliceOfficer;
}

export default function OfficerCard({ officer }: OfficerCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string = 'none') => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('lapsed')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('revoked')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Link
      href={`/officers/${officer.person_nbr}`}
      className="group flex w-full max-w-sm hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="w-[5%] min-w-[1.5rem] bg-[#2F5E50] rounded-tl-2xl rounded-bl-2xl" />
      <div className="flex-1 aspect-[4/2.75] p-4 bg-zinc-100 rounded-tr-2xl rounded-br-2xl flex flex-col justify-start items-start gap-2 group-hover:bg-zinc-50 transition-colors duration-200">
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch pb-2 border-b-[0.50px] border-emerald-950 inline-flex justify-center items-center gap-2">
            <div className="flex-1 justify-start text-emerald-950 text-base font-semibold font-['Inter'] leading-normal">
              {officer.full_name}
            </div>
          </div>
          <div className="self-stretch justify-start text-emerald-950 text-sm font-normal font-['Inter'] leading-tight">
            UID Number: {officer.person_nbr}
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch justify-start text-emerald-950 text-sm font-normal font-['Inter'] leading-tight">
              DC, Region 3
            </div>
            <div className="inline-flex justify-start items-start gap-4">
              <div className="justify-start text-emerald-950 text-xs font-normal font-['Inter'] leading-none">
                11/14/1999
              </div>
              <div className="justify-start text-emerald-950 text-xs font-normal font-['Inter'] leading-none">
                09/09/2004
              </div>
            </div>
          </div>
          <div className="self-stretch inline-flex justify-end items-center gap-6">
            <div className="text-right justify-start text-slate-500 text-xs font-normal font-['Inter'] leading-none">More</div>
            <div data-svg-wrapper>
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 0.759521L6.88384 4.87568C6.39773 5.36179 5.60227 5.36179 5.11616 4.87568L1 0.759521" stroke="#4F8C7E" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {
/*

      <div className="bg-zinc-100 rounded-tr-2xl rounded-br-2xl inline-flex flex-col justify-start items-start gap-2 ">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {officer.full_name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                UID: {officer.person_nbr}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                officer.current_certificate_status
              )}`}
            >
              {officer.current_certificate_status}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Agency:</span> {officer.agency_name}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium">Rank:</span> {officer.rank}
            </p>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{formatDate(officer.start_date)}</span>
              <span>→</span>
              <span>{formatDate(officer.end_date)}</span>
            </div>
          </div>
        </div>
      </div>
      */}
    </Link>
  );
}
