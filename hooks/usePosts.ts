'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/types/post';

interface UsePostsOptions {
  state?: string;
  limit?: number;
}

export function usePosts({ state, limit = 15 }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const constraints: QueryConstraint[] = [
          orderBy('date', 'desc')
        ];

        if (state) {
          constraints.push(where('state', '==', state));
        }

        const q = query(
          collection(db, 'posts'),
          ...constraints
        );

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }))
          .slice(0, limit) as Post[];

        setPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [state, limit]);

  return { posts, loading, error };
}
