'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collectionGroup, query, where, getDocs, orderBy, limit, doc, getDoc, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

interface OfficerGroup {
  person_nbr: string;
  records: PoliceOfficer[];
}

interface UseOfficersByAgencyProps {
  agencyName: string;
  agencyId?: string;
  searchParams?: {
    query?: string;
    startDate?: string;
    endDate?: string;
    activeOnly?: string;
    sortBy?: string;
    sortOrder?: string;
    pageSize?: string;
    page?: string;
    direction?: 'next' | 'prev';
  };
}

export function useOfficersByAgency({ agencyName, agencyId, searchParams = { pageSize: '16' } }: UseOfficersByAgencyProps) {
  const searchParameters = useMemo(() => ({
    query: searchParams.query?.toLowerCase() || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    activeOnly: searchParams.activeOnly || 'false',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize, 10) : (searchParams.pageSize || 16),
    page: parseInt(searchParams.page || '1', 10),
    direction: searchParams.direction
  }), [searchParams.query, searchParams.startDate, searchParams.endDate,
  searchParams.sortOrder, searchParams.pageSize, searchParams.page, searchParams.activeOnly,
  searchParams.direction]);
// Memoizar los parámetros de búsqueda para comparación
  const searchParamsString = useMemo(() => JSON.stringify({
    agencyName, 
    query: searchParameters.query,
    startDate: searchParameters.startDate,
    endDate: searchParameters.endDate,
    activeOnly: searchParameters.activeOnly,
    sortOrder: searchParameters.sortOrder,
    pageSize: searchParameters.pageSize,
    direction: searchParameters.direction,
    page: searchParameters.page
  }), [agencyName, searchParameters]);


  // Get the actual agency ID from the name if not provided
  const normalizedAgencyId = useMemo(() => {
    return agencyId?.replace(/\//g, '%2F') || agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/\//g, '-slash-');
  }, [agencyId, agencyName]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [sortedGroups, setSortedGroups] = useState<OfficerGroup[]>([]);
  const [totalOfficers, setTotalOfficers] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados para la paginación por cursor
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.page || '1', 10));
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  
  // Caché para el conteo total de oficiales basado en los filtros
  const [countCache, setCountCache] = useState<Record<string, number>>({});
  
  // Referencias para el historial de cursores
  const cursorHistoryRef = useRef<{
    cursors: any[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });
  
  // Control para prevenir refetching innecesarios
  const fetchStateRef = useRef({
    isFetching: false,
    fetchCount: 0,
    lastParams: '',
    debounceTimer: null as ReturnType<typeof setTimeout> | null
  });
  
  // Genera una clave única para los filtros actuales (excluyendo página y cursor)
  const filtersCacheKey = useMemo(() => {
    return JSON.stringify({
      agencyName,
      query: searchParameters.query,
      startDate: searchParameters.startDate,
      endDate: searchParameters.endDate,
      activeOnly: searchParameters.activeOnly,
      sortBy: searchParameters.sortBy,
      sortOrder: searchParameters.sortOrder,
      pageSize: searchParameters.pageSize
    });
  }, [agencyName, searchParameters.query, searchParameters.startDate, searchParameters.endDate,
      searchParameters.activeOnly, searchParameters.sortBy, searchParameters.sortOrder,
      searchParameters.pageSize]);
      
  // Función para obtener el conteo total de oficiales
  const getTotalCount = useCallback(async () => {
    try {
      // Primero verificamos si tenemos el conteo en caché para estos filtros
      if (countCache[filtersCacheKey]) {
        console.log('Usando conteo en caché (agency):', countCache[filtersCacheKey]);
        return countCache[filtersCacheKey];
      }
      
      // Si no hay filtros especiales, intentamos obtener el recuento de las estadísticas
      if (!searchParameters.query && !searchParameters.startDate && 
          !searchParameters.endDate && !searchParameters.activeOnly) {
        
        // Intentamos obtener de las estadísticas
        const statsRef = doc(db, 'statistics_per_agency', normalizedAgencyId);
        const statsDoc = await getDoc(statsRef);
        
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          // Primero intentamos total_officers
          if (data.total_officers) {
            const count = parseInt(data.total_officers, 10);
            // Guardamos en caché
            setCountCache(prev => ({ ...prev, [filtersCacheKey]: count }));
            return count;
          }
          // Fallback a stats array
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
        
        // Si no hay stats en la nueva colección, intentamos la antigua
        const oldStatsRef = doc(db, 'agency_statistics', normalizedAgencyId);
        const oldStatsDoc = await getDoc(oldStatsRef);
        
        if (oldStatsDoc.exists()) {
          const statsData = oldStatsDoc.data();
          const totalOfficersStat = statsData.stats?.find((stat: any) => stat.label === 'Total Officers');
          if (totalOfficersStat) {
            const count = parseInt(totalOfficersStat.value, 10);
            // Guardamos en caché
            setCountCache(prev => ({ ...prev, [filtersCacheKey]: count }));
            return count;
          }
        }
      }
      
      // Si llegamos aquí, necesitamos hacer una consulta para contar
      console.log('Calculando conteo con consulta, no hay valor en caché (agency)');
      
      try {
        // Construimos una consulta con los mismos filtros para contar
        let countQuery = query(collectionGroup(db, 'officers'));
        countQuery = query(countQuery, where('agency_name', '==', agencyName));
        countQuery = query(countQuery, limit(10000)); // Límite alto para conteo
        
        // Aplicamos los filtros a la consulta
        if (searchParameters.query) {
          countQuery = query(countQuery, where(
            'searchQueries',
            'array-contains-any',
            searchParameters.query.toLowerCase().split(' ').slice(0, 20), // firestore limit is 30, 20 to be safe
          ));
        }
        
        if (searchParameters.startDate) {
          const startDate = new Date(searchParameters.startDate);
          countQuery = query(countQuery, where('start_date', '>=', startDate.toISOString()));
        }
        
        if (searchParameters.endDate) {
          const endDate = new Date(searchParameters.endDate);
          countQuery = query(countQuery, where('end_date', '<=', endDate.toISOString()));
        }
        
        if (searchParameters.activeOnly === 'true') {
          countQuery = query(countQuery, where('end_date', '==', ''));
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
        console.error('Error calculando conteo (agency):', countErr);
        return 500; // Valor por defecto
      }
    } catch (err) {
      console.error('Error en getTotalCount (agency):', err);
      return 500; // Valor por defecto
    }
  }, [agencyName, normalizedAgencyId, filtersCacheKey, countCache, searchParameters]);

  // Obtener el conteo total
  useEffect(() => {
    console.log('AITO 5');
    let isMounted = true;
    
    // Comprobamos si los parámetros son los mismos que en la última consulta
    if (fetchStateRef.current.lastParams === searchParamsString) {
      console.log('Saltando la búsqueda - mismos parámetros que la solicitud anterior (agency)');
      return;
    }
    
    // Cancelamos cualquier temporizador de debounce anterior
    if (fetchStateRef.current.debounceTimer) {
      clearTimeout(fetchStateRef.current.debounceTimer);
    }
    
    // Aplicamos debounce para evitar múltiples solicitudes en sucesión rápida
    fetchStateRef.current.debounceTimer = setTimeout(() => {
      // Marcamos que estamos comenzando una nueva búsqueda
      fetchStateRef.current.isFetching = true;
      fetchStateRef.current.lastParams = searchParamsString;
      fetchStateRef.current.fetchCount++;
      fetchOfficers();
    }, 300);
    
    async function fetchOfficers() {
      try {
        setLoading(true);
        setError(null);

        // First, try to get the total_officers count from stats
        let officerCount = null;

        try {
          const statsRef = doc(db, 'statistics_per_agency', normalizedAgencyId);
          const statsDoc = await getDoc(statsRef);

          if (statsDoc.exists()) {
            const statsData = statsDoc.data();
            if (statsData.total_officers !== undefined) {
              officerCount = statsData.total_officers;
              setTotalOfficers(officerCount);
            }
          }

          // If not found in new collection, try the old one
          if (officerCount === null) {
            const oldStatsRef = doc(db, 'agency_statistics', normalizedAgencyId);
            const oldStatsDoc = await getDoc(oldStatsRef);

            if (oldStatsDoc.exists()) {
              const statsData = oldStatsDoc.data();
              const totalOfficersStat = statsData.stats?.find((stat: any) => stat.label === 'Total Officers');

              if (totalOfficersStat) {
                officerCount = parseInt(totalOfficersStat.value, 10);
                setTotalOfficers(officerCount);
              }
            }
          }
        } catch (statsError) {
          console.error('Error fetching agency stats:', statsError);
          // Continue fetching officers even if stats retrieval fails
        }

        const officersRef = collectionGroup(db, 'db_launch');

        // Build query with mandatory agency filter and sorting
        const sortField = searchParameters.sortBy === 'date' ? 'start_date' : 'last_name';
        const sortDirection = searchParameters.sortOrder === 'desc' ? 'desc' : 'asc';

        let q = query(
          officersRef,
          where('agency_name', '==', agencyName),
          orderBy(sortField, sortDirection)
        );

        // Add optional filters
        if (searchParameters.query) {
          q = query(q,
            // where('full_name_lower', '>=', searchParameters.query),
            // where('full_name_lower', '<=', searchParameters.query + '\uf8ff')

            where(
              'searchQueries',
              'array-contains-any',
              searchParameters.query.toLowerCase().split(' ').slice(0, 20), // firestore limit is 30, 20 to be safe
            )
          );
        }

        if (searchParameters.startDate) {
          q = query(q, where('start_date', '>=', searchParameters.startDate));
        }

        if (searchParameters.endDate) {
          q = query(q, where('end_date', '<=', searchParameters.endDate));
        }

        if (searchParameters.activeOnly === 'true') {
          q = query(q, where('end_date', '==', ''));
        }

        // Determine how many officers to fetch
        const pageSize = searchParameters.pageSize || 16;
        const page = currentPage;
        const direction = searchParameters.direction;
        
        // Log para depuración
        console.log('Estado de navegación (agency):', { 
          direction, 
          currentPage, 
          historyIndex: cursorHistoryRef.current.currentIndex,
          historyCursors: cursorHistoryRef.current.cursors.length,
          hasLastDoc: !!lastDoc
        });
        
        // Aplicamos limit a la consulta
        q = query(q, limit(pageSize * 10)); // Multiplicador para manejar posibles duplicados
        
        // NAVEGACIÓN POR CURSOR
        if (direction === 'next' && lastDoc) {
          // Navegación hacia adelante usando el último documento visible
          q = query(q, startAfter(lastDoc));
          console.log('Avanzando a la siguiente página con cursor (agency):', lastDoc.id);
        } else if (direction === 'prev' && currentPage > 1) {
          // Navegación hacia atrás
          console.log('Retrocediendo a la página anterior (agency)');
          
          const history = cursorHistoryRef.current;
          const prevIndex = history.currentIndex - 1;
          
          if (prevIndex >= 0 && prevIndex < history.cursors.length) {
            const prevCursor = history.cursors[prevIndex];
            q = query(q, startAfter(prevCursor));
            
            cursorHistoryRef.current.currentIndex = prevIndex;
            console.log(`Usando cursor del historial en índice ${prevIndex} para retroceder (agency) (ID: ${prevCursor.id})`);
          } else if (prevIndex === -1) {
            console.log('Retrocediendo a la primera página (agency)');
            cursorHistoryRef.current.currentIndex = -1;
          } else {
            console.log('No hay suficiente historial para retroceder, recargando desde el principio (agency)');
            cursorHistoryRef.current.currentIndex = -1;
          }
        } else if (currentPage === 1 || !direction) {
          // Primera página o carga inicial
          console.log('Cargando primera página (agency)');
          cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
        }
        
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs;

        // Process results efficiently
        const groupedOfficers = new Map<string, PoliceOfficer[]>();
        let uniqueCount = 0;
        let lastDocIndex = -1;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Actualizar conteo de página para CursorPagination
        getTotalCount().then(count => {
          setTotalCount(count);
        });
        
        // Keep fetching until we get pageSize unique officers or hit the last record
        while (uniqueCount < pageSize && attempts < maxAttempts && snapshot.docs.length > 0) {
          for (let i = 0; i < snapshot.docs.length && uniqueCount < pageSize; i++) {
            const doc = snapshot.docs[i];
            const officer = doc.data() as PoliceOfficer;
            const person_nbr = officer.person_nbr;
            
            if (!groupedOfficers.has(person_nbr)) {
              groupedOfficers.set(person_nbr, []);
              uniqueCount++;
              lastDocIndex = i; // Actualizar el índice del último documento único
            }
            
            groupedOfficers.get(person_nbr)?.push(officer);
          }
          
          attempts++;
          // Si no tenemos suficientes oficiales únicos y hay más registros, continuar buscando
          // Por simplicidad, no implementamos la lógica de búsqueda adicional aquí
        }
        
        // Si encontramos al menos un documento, actualizar los cursores para navegación
        if (snapshot.docs.length > 0) {
          // Documento inicial (para navegación prev)
          const firstDoc = snapshot.docs[0];
          
          // Último documento visible (para navegación next)
          console.log('lastDocIndex (agency)', lastDocIndex);
          if (lastDocIndex >= 0) {
            const lastVisibleDoc = snapshot.docs[lastDocIndex];
            setLastDoc(lastVisibleDoc);
            
            // Sistema para el historial de cursores
            // Almacenamos el primer documento de cada página para permitir navegación fluida
            if (currentPage === 1) {
              cursorHistoryRef.current = {
                cursors: [],
                currentIndex: -1
              };
              console.log('Reiniciando historial de cursores para la primera página (agency)');
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
              newCursors.push(firstDoc);
              
              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: newIndex
              };
              
              console.log(`Actualizando historial (avance agency): ${newCursors.length} cursores, índice ${newIndex}`);
            }
            // Para carga inicial sin dirección 
            else if (!direction && currentPage > 1) {
              // Inicializamos el historial para navegación futura
              const newCursors = [];
              newCursors.push(firstDoc);
              
              cursorHistoryRef.current = {
                cursors: newCursors,
                currentIndex: 0
              };
              
              console.log(`Inicializando historial para página ${currentPage} (agency)`);
            }
          }
        }
        
        // Sort records within each group by date
        const officerGroups = Array.from(groupedOfficers.entries()).map(([person_nbr, records]) => ({
          person_nbr,
          records: records.sort((a, b) => {
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA; // Sort by most recent first
          })
        }));
        
        // Actualizamos estados de navegación
        // Si es la primera carga o refresh, respetamos la página del URL
        // De lo contrario, calculamos basado en la dirección
        let newPage;
        if (!direction) {
          newPage = currentPage; // Mantenemos la página del URL en carga inicial
        } else {
          newPage = direction === 'next' ? currentPage + 1 :
            direction === 'prev' ? Math.max(1, currentPage - 1) : currentPage;
        }
        
        setCurrentPage(newPage);
        setHasPreviousPage(newPage > 1);
        setHasNextPage(uniqueCount >= pageSize); // Si tenemos una página completa, asumimos que hay más
        
        console.log(`Found ${uniqueCount} unique officers after ${attempts} attempts (agency)`);
        
        setSortedGroups(officerGroups);
        setOfficerGroups(officerGroups.slice(0, pageSize));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch officers'));
      } finally {
        if (isMounted) {
          setLoading(false);
          // Marcamos que hemos terminado de buscar
          fetchStateRef.current.isFetching = false;
        }
      }
    }
    
    // No llamamos directamente a fetchOfficers() aquí, ya se llama en el setTimeout
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Limpiamos el temporizador si el componente se desmonta
      if (fetchStateRef.current.debounceTimer) {
        clearTimeout(fetchStateRef.current.debounceTimer);
      }
    };
  }, [searchParamsString]);
  
  // Reiniciar paginación cuando cambian los filtros pero no la dirección
  useEffect(() => {

    if (searchParameters.page && searchParameters.page !== '1') {
      return;
    }

    console.log('AITO 6');
    if (!searchParameters.direction && !searchParameters.page) {
      console.log('Reiniciando paginación por cambio de filtros (agency)');
      setCurrentPage(1);
      setLastDoc(null);
      cursorHistoryRef.current = { cursors: [], currentIndex: -1 };
      setHasPreviousPage(false);
    }
    if (!searchParameters.query && !searchParameters.startDate && !searchParameters.endDate) {
      getTotalCount().then(count => {
        setTotalCount(count);
      });
    }

  }, [agencyName, searchParameters.query, searchParameters.startDate, searchParameters.endDate, 
      searchParameters.activeOnly, searchParameters.sortOrder, 
      searchParameters.pageSize]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalOfficers !== null ? totalOfficers : totalCount,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage
  };
}
