'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
    sortBy: searchParams.sortBy || 'last_name',
    sortOrder: searchParams.sortOrder || 'asc',
    pageSize: typeof searchParams.pageSize === 'string' ? parseInt(searchParams.pageSize, 10) : (searchParams.pageSize || 16),
    page: parseInt(searchParams.page || '1', 10),
    direction: searchParams.direction
  }), [searchParams.query, searchParams.startDate, searchParams.endDate,
  searchParams.sortBy, searchParams.sortOrder, searchParams.pageSize, searchParams.page, searchParams.activeOnly,
  searchParams.direction]);

  // Get the actual agency ID from the name if not provided
  const normalizedAgencyId = useMemo(() => {
    return agencyId?.replace(/\//g, '%2F') || agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/\//g, '-slash-');
  }, [agencyId, agencyName]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerGroups, setOfficerGroups] = useState<OfficerGroup[]>([]);
  const [sortedGroups, setSortedGroups] = useState<OfficerGroup[]>([]);
  const [totalOfficers, setTotalOfficers] = useState<number | null>(null);
  
  // Estados para la paginación por cursor
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.page || '1', 10));
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  
  // Referencias para el historial de cursores
  const cursorHistoryRef = useRef<{
    cursors: any[];
    currentIndex: number;
  }>({ cursors: [], currentIndex: -1 });

  useEffect(() => {
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
        setLoading(false);
      }
    }

    fetchOfficers();
  }, [agencyName, searchParameters.direction, searchParameters.pageSize, searchParameters.page]);

  return {
    loading,
    error,
    officerGroups,
    totalGroups: totalOfficers !== null ? totalOfficers : (sortedGroups?.length || 0),
    currentPage,
    hasNextPage,
    hasPreviousPage
  };
}
