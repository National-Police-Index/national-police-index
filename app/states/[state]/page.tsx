import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, startAfter, orderBy, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OfficerCard from '@/components/officers/OfficerCard';
import SearchFilters from '@/components/search/SearchFilters';
import { PoliceOfficer } from '@/types';
import Pagination from '@/components/common/Pagination';
import { US_STATES } from '@/constants/states';

interface StatePageProps {
  params: {
    state: string;
  };
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const stateData = US_STATES.find(
    state => state.abbreviation.toLowerCase() === params.state.toLowerCase()
  );

  if (!stateData) {
    return {
      title: 'State Not Found | National Police Index',
      description: 'The requested state page could not be found.',
    };
  }

  return {
    title: `${stateData.name} Police Officers | National Police Index`,
    description: `Search and explore police officer employment records and certification status in ${stateData.name}.`,
  };
}

const OFFICERS_PER_PAGE = 12;

async function getOfficersCount(state: string): Promise<number> {
  const officersRef = collection(db, 'db_launch');
  const q = query(officersRef, where('state', '==', state.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

interface SearchParams {
  page?: string;
  query?: string;
  agency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

async function getOfficers(
  state: string,
  page: number,
  searchParams: SearchParams
): Promise<{ officers: PoliceOfficer[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  const officersRef = collection(db, 'db_launch');
  const constraints: any[] = [
    where('state', '==', state.toLowerCase())
  ];

  // Add search constraints
  if (searchParams.query) {
    constraints.push(where('full_name', '>=', searchParams.query));
    constraints.push(where('full_name', '<=', searchParams.query + '\uf8ff'));
  }

  if (searchParams.agency) {
    constraints.push(where('agency_name', '==', searchParams.agency));
  }

  if (searchParams.startDate) {
    constraints.push(where('start_date', '>=', searchParams.startDate));
  }

  if (searchParams.endDate) {
    constraints.push(where('end_date', '<=', searchParams.endDate));
  }

  // Add sorting
  const sortField = searchParams.sortBy === 'date' ? 'start_date' :
                   searchParams.sortBy === 'agency' ? 'agency_name' :
                   'last_name';
  
  const sortDirection = searchParams.sortOrder === 'desc' ? 'desc' : 'asc';

  let q = query(
    officersRef,
    ...constraints,
    orderBy(sortField, sortDirection),
    limit(OFFICERS_PER_PAGE)
  );

  // If it's not the first page, we need to use startAfter
  if (page > 1) {
    // Get the last document from the previous page
    const prevPageQuery = query(
      officersRef,
      where('state', '==', state.toLowerCase()),
      orderBy('last_name'),
      limit((page - 1) * OFFICERS_PER_PAGE)
    );
    const prevPageDocs = await getDocs(prevPageQuery);
    const lastVisible = prevPageDocs.docs[prevPageDocs.docs.length - 1];
    q = query(
      officersRef,
      where('state', '==', state.toLowerCase()),
      orderBy('last_name'),
      startAfter(lastVisible),
      limit(OFFICERS_PER_PAGE)
    );
  }

  const querySnapshot = await getDocs(q);
  
  const officers: PoliceOfficer[] = querySnapshot.docs.map(doc => ({
    agency_name: doc.data().agency_name || '',
    current_certificate_status: doc.data().current_certificate_status || '',
    document_id: doc.id,
    end_date: doc.data().end_date || '',
    first_name: doc.data().first_name || '',
    full_name: doc.data().full_name || '',
    last_name: doc.data().last_name || '',
    middle_name: doc.data().middle_name || '',
    person_nbr: doc.data().person_nbr || '',
    rank: doc.data().rank || '',
    start_date: doc.data().start_date || '',
    state: doc.data().state || ''
  }));

  const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
  return { officers, lastDoc };
}

export default async function StatePage({ params, searchParams }: StatePageProps & { searchParams: SearchParams }) {
  const stateData = US_STATES.find(
    state => state.abbreviation.toLowerCase() === params.state.toLowerCase()
  );

  if (!stateData || !stateData.hasData) {
    notFound();
  }

  const currentPage = Number(searchParams.page) || 1;

  // Get total count and current page data
  const [totalCount, { officers }] = await Promise.all([
    getOfficersCount(params.state),
    getOfficers(params.state, currentPage, searchParams)
  ]);

  const totalPages = Math.ceil(totalCount / OFFICERS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {stateData.name}
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Search and explore police officer records in {stateData.name}
        </p>
      </div>

      <SearchFilters />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {officers.map((officer) => (
          <OfficerCard key={officer.document_id} officer={officer} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/states/${params.state.toLowerCase()}`}
        />
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {Math.min(currentPage * OFFICERS_PER_PAGE, totalCount)} of {totalCount} officers
      </div>
    </div>
  );
}
