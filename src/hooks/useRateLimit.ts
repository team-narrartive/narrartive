
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

export const useRateLimit = (options: RateLimitOptions) => {
  const [requestHistory, setRequestHistory] = useState<Record<string, RequestRecord>>({});
  const { toast } = useToast();

  const checkRateLimit = useCallback((key: string = 'default'): boolean => {
    const now = Date.now();
    const record = requestHistory[key];

    // Clean up old records
    if (record && now - record.timestamp > options.windowMs) {
      const newHistory = { ...requestHistory };
      delete newHistory[key];
      setRequestHistory(newHistory);
    }

    // Check current rate limit
    const currentRecord = requestHistory[key];
    if (currentRecord && currentRecord.count >= options.maxRequests) {
      toast({
        title: "Rate limit exceeded",
        description: options.message || `Please wait before making another request.`,
        variant: "destructive"
      });
      return false;
    }

    // Update request count
    setRequestHistory(prev => ({
      ...prev,
      [key]: {
        timestamp: currentRecord?.timestamp ?? now,
        count: (currentRecord?.count ?? 0) + 1
      }
    }));

    return true;
  }, [requestHistory, options, toast]);

  const resetRateLimit = useCallback((key: string = 'default') => {
    setRequestHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[key];
      return newHistory;
    });
  }, []);

  return { checkRateLimit, resetRateLimit };
};
