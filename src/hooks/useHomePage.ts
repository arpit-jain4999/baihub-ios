// Hook for fetching home page data

import { useState, useEffect, useCallback } from 'react';
import { homeService } from '../services/home.service';
import { HomePageData } from '../types/home.types';
import { logger } from '../utils/logger';

interface UseHomePageParams {
  city?: string;
  limit?: number;
  testimonialLimit?: number;
}

interface UseHomePageReturn {
  data: HomePageData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useHomePage = (params?: UseHomePageParams): UseHomePageReturn => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomePage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const homeData = await homeService.getHomePage(params);
      setData(homeData);
    } catch (err: any) {
      logger.error('Fetch home page error:', err);
      setError(err.message || 'Failed to load home page');
    } finally {
      setLoading(false);
    }
  }, [params?.city, params?.limit, params?.testimonialLimit]);

  useEffect(() => {
    fetchHomePage();
  }, [fetchHomePage]);

  const refresh = useCallback(async () => {
    await fetchHomePage();
  }, [fetchHomePage]);

  return { data, loading, error, refresh };
};



