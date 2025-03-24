import USMap from '@/components/map/USMap';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          National Police Index
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Search and explore police officer employment records, certification status, and disciplinary actions across the United States.
        </p>
      </div>

      <USMap />

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          Transparency in Law Enforcement
        </h2>
        <p className="text-lg text-gray-500 mb-8">
          Our mission is to promote accountability and transparency in law enforcement by providing public access to comprehensive police officer employment records.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Data</h3>
            <p className="text-gray-500">Access detailed employment histories, certifications, and status updates.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">State Coverage</h3>
            <p className="text-gray-500">Growing database covering multiple states with regular updates.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Access</h3>
            <p className="text-gray-500">Simple search interface to find and explore officer records.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
