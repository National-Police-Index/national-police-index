import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { PoliceOfficer } from '@/types';
import { notFound } from 'next/navigation';

interface OfficerPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: OfficerPageProps): Promise<Metadata> {
  const docRef = doc(db, 'db_launch', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      title: 'Officer Not Found | National Police Index',
      description: 'The requested police officer record could not be found.',
    };
  }

  const officer = docSnap.data();
  return {
    title: `${officer.full_name} | Police Officer Record | National Police Index`,
    description: `View employment history and certification status for ${officer.full_name}, previously employed at ${officer.agency_name}.`,
  };
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

function getStatusColor(status: string) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('active')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('lapsed')) return 'bg-yellow-100 text-yellow-800';
  if (statusLower.includes('revoked')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

export default async function OfficerPage({ params }: OfficerPageProps) {
  const docRef = doc(db, 'db_launch', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const officer: PoliceOfficer = {
    agency_name: docSnap.data().agency_name || '',
    current_certificate_status: docSnap.data().current_certificate_status || '',
    document_id: docSnap.id,
    end_date: docSnap.data().end_date || '',
    first_name: docSnap.data().first_name || '',
    full_name: docSnap.data().full_name || '',
    last_name: docSnap.data().last_name || '',
    middle_name: docSnap.data().middle_name || '',
    person_nbr: docSnap.data().person_nbr || '',
    rank: docSnap.data().rank || '',
    start_date: docSnap.data().start_date || '',
    state: docSnap.data().state || ''
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Officer header */}
        <div className="bg-white shadow-sm rounded-lg px-6 py-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{officer.full_name}</h1>
              <p className="mt-2 text-lg text-gray-500">UID: {officer.person_nbr}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                officer.current_certificate_status
              )}`}
            >
              {officer.current_certificate_status}
            </span>
          </div>
        </div>

        {/* Employment details */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Employment Details</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Agency</dt>
                <dd className="mt-1 text-sm text-gray-900">{officer.agency_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rank</dt>
                <dd className="mt-1 text-sm text-gray-900">{officer.rank}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(officer.start_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(officer.end_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {officer.state.charAt(0).toUpperCase() + officer.state.slice(1)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Certificate Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{officer.current_certificate_status}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Employment Timeline</h2>
          </div>
          <div className="px-6 py-5">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="relative pl-10">
                <div className="mb-8">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Started at {officer.agency_name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(officer.start_date)}</p>
                </div>
                {officer.end_date && (
                  <div>
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Employment ended</h3>
                    <p className="mt-1 text-sm text-gray-500">{formatDate(officer.end_date)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
