import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { fetchAuditContent, type AuditResponse, type AuditItem } from "../lib/auditApi";

type ContentQualityContextType = {
  loading: boolean;
  error: string | null;
  documentById: Record<string, AuditItem>;
  canonicalById: Record<string, AuditItem>;
  documentByKey: Record<string, AuditItem>;
  canonicalByKey: Record<string, AuditItem>;
  refresh: () => Promise<void>;
};

const ContentQualityContext = createContext<ContentQualityContextType | undefined>(undefined);

type ContentQualityProviderProps = {
  children: React.ReactNode;
  API_BASE: string;
};

export function ContentQualityProvider({ children, API_BASE }: ContentQualityProviderProps) {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastApiBase, setLastApiBase] = useState<string>(API_BASE);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAuditContent(API_BASE);
      setData(result);
      setLastApiBase(API_BASE);
    } catch (err: any) {
      console.error("Error loading content quality data", err);
      setError(err?.message ?? "Failed to load content quality data");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    // Only fetch if API_BASE changed or this is the first mount
    if (API_BASE !== lastApiBase || data === null) {
      fetchData();
    }
  }, [API_BASE, lastApiBase, data, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Build lookup maps
  const documentById = useMemo(() => {
    const map: Record<string, AuditItem> = {};
    if (data) {
      data.items
        .filter((item) => item.entityType === "DOCUMENT" && item.id)
        .forEach((item) => {
          map[item.id] = item;
        });
    }
    return map;
  }, [data]);

  const canonicalById = useMemo(() => {
    const map: Record<string, AuditItem> = {};
    if (data) {
      data.items
        .filter((item) => item.entityType === "CANONICAL_DOCUMENT" && item.id)
        .forEach((item) => {
          map[item.id] = item;
        });
    }
    return map;
  }, [data]);

  const documentByKey = useMemo(() => {
    const map: Record<string, AuditItem> = {};
    if (data) {
      data.items
        .filter((item) => item.entityType === "DOCUMENT" && item.key)
        .forEach((item) => {
          // Use lowercase key for case-insensitive lookup
          const normalizedKey = item.key!.toLowerCase();
          // If multiple items have the same key, keep the first one
          if (!map[normalizedKey]) {
            map[normalizedKey] = item;
          }
        });
    }
    return map;
  }, [data]);

  const canonicalByKey = useMemo(() => {
    const map: Record<string, AuditItem> = {};
    if (data) {
      data.items
        .filter((item) => item.entityType === "CANONICAL_DOCUMENT" && item.key)
        .forEach((item) => {
          // Use lowercase key for case-insensitive lookup
          const normalizedKey = item.key!.toLowerCase();
          // If multiple items have the same key, keep the first one
          if (!map[normalizedKey]) {
            map[normalizedKey] = item;
          }
        });
    }
    return map;
  }, [data]);

  const value: ContentQualityContextType = {
    loading,
    error,
    documentById,
    canonicalById,
    documentByKey,
    canonicalByKey,
    refresh,
  };

  return <ContentQualityContext.Provider value={value}>{children}</ContentQualityContext.Provider>;
}

export function useContentQuality() {
  const context = useContext(ContentQualityContext);
  if (context === undefined) {
    throw new Error("useContentQuality must be used within a ContentQualityProvider");
  }
  return context;
}

