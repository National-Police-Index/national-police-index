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

  const fullName = officer.full_name || officer.first_name + ' ' + officer.last_name;

  return (
    <Link
      href={`/officers/${officer.person_nbr}`}
      className="group flex w-full max-w-sm hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="w-[5%] min-w-[1.5rem] bg-[#2F5E50] rounded-tl-2xl rounded-bl-2xl" />
      <div className="flex-1 aspect-[4/2.75] p-4 bg-zinc-100 rounded-tr-2xl rounded-br-2xl flex flex-col justify-start items-start gap-2 group-hover:bg-zinc-50 transition-colors duration-200">
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch pb-2 border-b-[0.50px] border-[#2F5E50] inline-flex justify-center items-center gap-2">
            <div className="flex-1 justify-start text-[#122823] text-base font-semibold font-['Inter'] leading-normal">
              {fullName}
            </div>
          </div>
          <div className="self-stretch justify-start text-[#122823] text-sm font-normal font-['Inter'] leading-tight">
            UID Number: {officer.person_nbr}
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch justify-start text-[#122823] text-sm font-normal font-['Inter'] leading-tight">
              {officer.agency_name}
            </div>
            <div className="inline-flex justify-start items-start gap-4">
              <div className="justify-start text-[#122823] text-xs font-normal font-['Inter'] leading-none">
                {formatDate(officer.start_date)}
              </div>
              <div className="justify-start text-[#122823] text-xs font-normal font-['Inter'] leading-none">
                {formatDate(officer.end_date)}
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
    </Link>
  );
}
