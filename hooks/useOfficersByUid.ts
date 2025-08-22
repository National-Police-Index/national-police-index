'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, doc, getDoc, collection, DocumentData } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface SearchParams {
  page: string;
  pageSize: string;
  query?: string;
  agency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  direction?: 'next' | 'prev';
}

interface UseOfficersByUidProps {
  state: string;
  searchParams?: SearchParams;
}

export function useOfficersByUid({ state, searchParams = { pageSize: '16', page: '1' } }: UseOfficersByUidProps) {
  // Memoize search parameters to prevent unnecessary re-renders
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    agency: searchParams.agency || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    sortBy: searchParams.sortBy || 'full_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: parseInt(searchParams.pageSize || '16', 10),
    // Eliminamos la dependencia en el parámetro page de la URL
    direction: searchParams.direction
  }), [searchParams.query, searchParams.agency, searchParams.startDate,
  searchParams.endDate, searchParams.sortBy, searchParams.sortOrder,
  searchParams.pageSize, searchParams.direction]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Siempre comenzamos en página 1 para paginación basada en cursores
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const cancelTokenRef = useRef<AbortController | null>(null);

  // Track fetch state to prevent duplicate fetches
  const fetchStateRef = useRef({
    isFetching: false,
    fetchCount: 0,
    lastParams: ''
  });
  
  // References para almacenar el historial de documentos para navegación
  const cursorHistoryRef = useRef<{
    cursors: QueryDocumentSnapshot[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });

  // Caché para el conteo total de oficiales basado en los filtros
  // La estructura será: { [filtersKey: string]: number }
  const [countCache, setCountCache] = useState<Record<string, number>>({});

  // Genera una clave única para los filtros actuales (excluyendo página y cursor)
  const filtersCacheKey = useMemo(() => {
    return JSON.stringify({
      state,
      query: searchParameters.query,
      agency: searchParameters.agency,
      startDate: searchParameters.startDate,
      endDate: searchParameters.endDate,
      sortBy: searchParameters.sortBy,
      sortOrder: searchParameters.sortOrder,
      pageSize: searchParameters.pageSize
    });
  }, [state, searchParameters.query, searchParameters.agency,
    searchParameters.startDate, searchParameters.endDate,
    searchParameters.sortBy, searchParameters.sortOrder,
    searchParameters.pageSize]);

  // Separate function to get total count
  const getTotalCount = useCallback(async () => {
    try {
      // Primero verificamos si tenemos el conteo en caché para estos filtros
      if (countCache[filtersCacheKey]) {
        console.log('Using cached count:', countCache[filtersCacheKey]);
        return countCache[filtersCacheKey];
      }

      // Si no hay filtros especiales, intentamos obtener el recuento de las estadísticas
      // Esto es más rápido que hacer una consulta completa
      if (!searchParameters.query && !searchParameters.agency &&
        !searchParameters.startDate && !searchParameters.endDate) {

        // Try to get count from statistics first
        const statsRef = doc(db, 'statistics_per_state', state);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const data = statsDoc.data();
          // Try to get total_officers first
          if (data.total_officers) {
            const count = parseInt(data.total_officers, 10);
            // Guardamos en caché
            setCountCache(prev => ({ ...prev, [filtersCacheKey]: count }));
            return count;
          }
          // Fallback to stats array
          else if (data.stats) {
            const officerStats = data.stats.find((stat: any) => stat.label === 'Total Officers');
            if (officerStats) {
              const count = parseInt(officerStats.value, 10);
              // Guardamos en caché
              setCountCache(prev => ({ ...prev, [filtersCacheKey]: count }));
              return count;
            }
          }
        }
      }

      // Si llegamos aquí, necesitamos hacer una consulta para contar
      // Este código se ejecutará cuando tenemos filtros especiales aplicados
      console.log('Calculating count with query, no cached value available');

      try {
        // Construimos una consulta con los mismos filtros para contar
        let countQuery = query(collection(db, 'db_launch'));
        countQuery = query(countQuery, where('state', '==', state.toLowerCase()));
        countQuery = query(countQuery, limit(10000)); // Increased multiplier to handle more duplicates

        // Aplicamos los filtros a la consulta
        if (searchParameters.query) {

          countQuery = query(countQuery, where(
            'searchQueries',
            'array-contains-any',
            searchParameters.query.toLowerCase().split(' ').slice(0, 20), // firestore limit is 30, 20 to be safe
          ));
        }

        if (searchParameters.agency) {
          countQuery = query(countQuery, where('agency_name', '==', searchParameters.agency));
        }

        if (searchParameters.startDate) {
          const startDate = new Date(searchParameters.startDate);
          countQuery = query(countQuery, where('start_date', '>=', startDate.toISOString()));
        }

        if (searchParameters.endDate) {
          const endDate = new Date(searchParameters.endDate);
          countQuery = query(countQuery, where('end_date', '<=', endDate.toISOString()));
        }

        // Ejecutamos la consulta
        const countSnapshot = await getDocs(countQuery);

        // Contamos los números de persona únicos
        const uniqueOfficers = new Set();
        countSnapshot.docs.forEach(doc => {
          const officer = doc.data() as PoliceOfficer;
          uniqueOfficers.add(officer.person_nbr);
        });

        const uniqueCount = uniqueOfficers.size;

        // Guardamos el resultado en caché
        setCountCache(prev => ({ ...prev, [filtersCacheKey]: uniqueCount }));

        return uniqueCount;
      } catch (countErr) {
        // Valor por defecto en caso de error
        const defaultCount = 11713; // Known count for California
        return defaultCount;
      }
    } catch (err) {
      console.error('Error fetching total count:', err);
      const defaultCount = 11713; // Default to known count for California
      setCountCache(prev => ({ ...prev, [filtersCacheKey]: defaultCount }));
      return defaultCount;
    }
  }, [state, filtersCacheKey, countCache, searchParameters]);

  // Función para calcular el recuento total de oficiales únicos a partir de un snapshot
  const calculateUniqueOfficersCount = useCallback((docs: QueryDocumentSnapshot<DocumentData>[]) => {
    const uniqueOfficers = new Set();
    docs.forEach(doc => {
      const officer = doc.data() as PoliceOfficer;
      uniqueOfficers.add(officer.person_nbr);
    });
    return uniqueOfficers.size;
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
      console.log('Aborted previous fetch request');
    }

    cancelTokenRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchOfficers();
    }, 500);

    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        // Verificamos si tenemos un conteo en caché para estos filtros
        const cachedCount = countCache[filtersCacheKey];
        if (cachedCount) {
          setTotalCount(cachedCount);
        } else {
          // Si no hay valor en caché, obtenemos el conteo
          const totalCount = await getTotalCount();
          setTotalCount(totalCount);
        }

        const officersRef = collectionGroup(db, 'db_launch');
        const pageSize = searchParameters.pageSize;

        // Build the optimized query
        let q = query(officersRef, where('state', '==', state.toLowerCase()));
        // if (false && ['georgia', 'florida'].includes(state.toLowerCase())) {
        if (false && ['georgia', 'florida'].includes(state.toLowerCase())) {
          q = query(officersRef, where('state', '==', `${state.toLowerCase()}-discipline`));
        }

        // Add filters efficiently
        if (searchParameters.query) {
          const capitalizeQuery = String(searchParameters.query[0]).toUpperCase() + String(searchParameters.query).slice(1).toLowerCase;

          q = query(q,
            // where('full_name', '>=', searchParameters.query.toUpperCase()),
            //  where('full_name', '<=', searchParameters.query.toUpperCase() + '\uf8ff'),
            where(
              'searchQueries',
              'array-contains-any',
              searchParameters.query.toLowerCase().split(' ').slice(0, 20), // firestore limit is 30, 20 to be safe
            )
            /*
            where('agency_name', '>=', searchParameters.query.toUpperCase()),
            where('agency_name', '<', searchParameters.query.toUpperCase() + '\uf8ff'),
            where('last_name', '>=', capitalizeQuery.toUpperCase()),
            where('last_name', '<=', capitalizeQuery.toUpperCase() + '\uf8ff')
            */
          );
          // console.log('Query', q);
        }

        if (searchParameters.agency) {
          q = query(q, where('agency_name', '==', searchParameters.agency));
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        // Add sorting
        const sortField = searchParameters.sortBy === 'date' ? 'start_date' :
          searchParameters.sortBy === 'agency' ? 'agency_name' : 'last_name';
        q = query(q, orderBy(sortField, searchParameters.sortOrder === 'desc' ? 'desc' : 'asc'));
        if (false && sortField === 'last_name') {
          q = query(q, orderBy('first_name', searchParameters.sortOrder === 'desc' ? 'desc' : 'asc'));
        }

        // Get total count efficiently
        /*
        const total = await getTotalCount();
        if (isMounted) {
          setTotalCount(total);
        }
        */

        // Fetch more records to ensure we get enough unique officers
        q = query(q, limit(pageSize * 10)); // Increased multiplier to handle more duplicates

        // Manejar navegación por cursor
      const direction = searchParameters.direction;
      // En paginación por cursor, mantenemos el control de página actual internamente
      const currentPageNum = currentPage;
      
      // Manejar navegación por cursor
      if (direction === 'next' && lastDoc) {
        // Avanzar hacia adelante - usamos el último documento visible de la página actual como punto de partida
        // Esto evita que el último registro de la página anterior se duplique como primer registro de la siguiente
        q = query(q, startAfter(lastDoc));
        console.log('Avanzando a la siguiente página con cursor:', lastDoc.id);
      } else if (direction === 'prev' && currentPageNum > 1) {
        console.log('Retrocediendo a la página anterior');
        
        // Para retroceder, necesitamos obtener el cursor del inicio de la página anterior
        const history = cursorHistoryRef.current;
        const prevIndex = history.currentIndex - 1;
        
        if (prevIndex >= 0 && prevIndex < history.cursors.length) {
          // Usamos el cursor de la página anterior como punto de partida
          const prevCursor = history.cursors[prevIndex];
          q = query(q, startAfter(prevCursor));
          
          // Actualizamos el índice actual en el historial
          cursorHistoryRef.current.currentIndex = prevIndex;
          console.log(`Usando cursor del historial en índice ${prevIndex} para retroceder (ID: ${prevCursor.id})`);
        } else if (prevIndex === -1) {
          // Estamos volviendo a la primera página
          console.log('Retrocediendo a la primera página');
          // No necesitamos añadir ningún cursor para la primera página
          // Al no modificar la consulta, se cargará la primera página
          cursorHistoryRef.current.currentIndex = -1;
        } else {
          console.log('No hay suficiente historial para retroceder, recargando desde el principio');
          // Si no tenemos suficiente historial, volvemos a la primera página
          // Al no modificar la consulta, se cargará la primera página
          cursorHistoryRef.current.currentIndex = -1;
        }
      } else if (currentPageNum === 1 || !direction) {
        // Primera página o carga inicial sin dirección especificada
        console.log('Cargando primera página');
        // Reiniciamos el historial de cursores
        cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
      }

        let snapshot = await getDocs(q);
        if (!isMounted) return;

        // Process results efficiently
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;
        let attempts = 0;
        const maxAttempts = 10; // Increased to ensure we get enough unique officers

        // Keep fetching until we get pageSize unique officers or hit the last record
        while (uniqueCount < pageSize && attempts < maxAttempts && snapshot.docs.length > 0) {
          for (let i = 0; i < snapshot.docs.length && uniqueCount < pageSize; i++) {
            const doc = snapshot.docs[i];
            const officer = doc.data() as PoliceOfficer;
            if (!groupedOfficers.has(officer.person_nbr)) {
              groupedOfficers.set(officer.person_nbr, [officer]);
              uniqueCount++;
              lastDocIndex = i;
            } else {
              groupedOfficers.get(officer.person_nbr)?.push(officer);
            }
          }

          // If we still need more officers and there are more records
          if (uniqueCount < pageSize && snapshot.docs.length === pageSize * 10) {
            const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
            q = query(q, startAfter(lastVisibleDoc));
            snapshot = await getDocs(q);
            attempts++;
          } else {
            break;
          }
        }

        // Guardamos los documentos para navegación
        if (snapshot.docs.length > 0) {
          // Documento inicial (para navegación prev)
          setFirstDoc(snapshot.docs[0]);
          
          // Último documento visible (para navegación next)
          if (lastDocIndex >= 0) {
            const newFirstDoc = snapshot.docs[0]; // Primer documento de esta página
            const newLastDoc = snapshot.docs[lastDocIndex]; // Último documento visible
            setLastDoc(newLastDoc);
            
            // Sistema mejorado para el historial de cursores
            // Almacenamos el primer documento de cada página para permitir navegación fluida
            
            // Para la primera página, simplemente reiniciamos el historial
            if (currentPageNum === 1) {
              cursorHistoryRef.current = {
                cursors: [],
                currentIndex: -1
              };
              console.log('Reiniciando historial de cursores para la primera página');
            }
            // Para navegación hacia adelante
            else if (direction === 'next') {
              const newCursors = [...cursorHistoryRef.current.cursors];
              const newIndex = cursorHistoryRef.current.currentIndex + 1;
              
              // Truncar el historial si estamos reescribiendo una navegación previa
              if (newIndex < newCursors.length) {
                newCursors.splice(newIndex);
              }
              
              // Guardamos el primer documento de esta página para permitir navegación hacia atrás
              newCursors.push(snapshot.docs[0]);
              
              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: newIndex
              };
              
              console.log(`Actualizando historial (avance): ${newCursors.length} cursores, índice ${newIndex}`);
            }
            // Para carga inicial sin dirección (ej. refresh de página o acceso directo a URL)
            else if (!direction && currentPageNum > 1) {
              // No tenemos historial pero queremos estar en una página específica
              // Lo mejor que podemos hacer es prepararnos para navegación futura
              const newCursors = [];
              // Guardamos el primer documento de esta página
              newCursors.push(snapshot.docs[0]);
              
              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: 0
              };
              
              console.log(`Inicializando historial para página ${currentPageNum}`);
            }
            // No modificamos el historial cuando navegamos hacia atrás, ya que eso lo maneja
            // la sección de construcción de query
          }
        }

        // Actualizamos estados de navegación
        // Si es la primera carga o refresh, respetamos la página del URL
        // De lo contrario, calculamos basado en la dirección
        let newPage;
        if (!direction) {
          newPage = currentPageNum; // Mantenemos la página del URL en carga inicial
        } else {
          newPage = direction === 'next' ? currentPageNum + 1 : 
                  direction === 'prev' ? Math.max(1, currentPageNum - 1) : currentPageNum;
        }
        
        setCurrentPage(newPage);
        setHasPreviousPage(newPage > 1);
        setHasNextPage(uniqueCount >= searchParameters.pageSize); // Si tenemos una página completa, asumimos que hay más
        
        console.log(`Found ${uniqueCount} unique officers after ${attempts + 1} attempts`);

        // Sort and set results efficiently
        const groups = Array.from(groupedOfficers.entries()).map(([person_nbr, records]) => ({
          person_nbr,
          records: records.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        }));

        if (isMounted) {
          setOfficerGroups(groups);
        }

      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOfficers();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [state, searchParameters]);

  // Reset pagination and total count when filters change
  useEffect(() => {
    // Reiniciar cursores y página actual cuando cambian los filtros
    setLastDoc(null);
    setFirstDoc(null);
    setCurrentPage(1);
    cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
    
    // Reiniciar estado de navegación
    setHasPreviousPage(false);
    
    // Reset total count to stats value when filters are cleared
    if (!searchParameters.query && !searchParameters.agency && !searchParameters.startDate && !searchParameters.endDate) {
      getTotalCount().then(count => {
        setTotalCount(count);
      });
    }
  }, [searchParameters.query, searchParameters.agency, searchParameters.startDate,
  searchParameters.endDate, searchParameters.sortBy, searchParameters.sortOrder, searchParameters.pageSize, getTotalCount]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    pageSize: searchParameters.pageSize
  };
}
