'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOfficerByPersonNbr } from '@/hooks/useOfficerByPersonNbr';

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {latestRecord.full_name}
        </h1>
        <p className="text-gray-600">
          Latest Agency: {latestRecord.agency_name}
        </p>
      </div>

      {/* Latest Record Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Position</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Position</p>
            <p className="font-medium">{latestRecord.position || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="font-medium">{latestRecord.status || 'Active'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="font-medium">{new Date(latestRecord.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="font-medium">
              {latestRecord.end_date ? new Date(latestRecord.end_date).toLocaleDateString() : 'Present'}
            </p>
          </div>
        </div>
      </div>

      {/* Employment History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment History</h2>
        <div className="space-y-6">
          {records.map((record, index) => (
            <div
              key={`${record.document_id}-${index}`}
              className={`${index !== 0 ? 'border-t pt-6' : ''}`}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900">{record.agency_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{record.position || 'Position not specified'}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    {new Date(record.start_date).toLocaleDateString()} - {' '}
                    {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'Present'}
                  </p>
                  <p className="mt-1">Status: {record.status || 'Active'}</p>
                </div>
                {record.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
