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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('lapsed')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('revoked')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Link
      href={`/officers/${officer.document_id}`}
      className="block bg-white shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="p-6">
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
    </Link>
  );
}
