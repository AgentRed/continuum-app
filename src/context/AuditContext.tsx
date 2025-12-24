import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchAuditContent, type AuditResponse, type AuditItem, type AuditEntityType } from "../lib/auditApi";

type AuditContextType = {
  items: AuditItem[];
  summary: AuditResponse["summary"] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (entityType: AuditEntityType, id: string) => AuditItem | undefined;
  getByKey: (entityType: AuditEntityType, key: string) => AuditItem | undefined;
  getBestMatch: (params: { entityType: AuditEntityType; id?: string; key?: string }) => AuditItem | undefined;
};

const AuditContext = createContext<AuditContextType | undefined>(undefined);

type AuditProviderProps = {
  children: React.ReactNode;
  API_BASE: string;
};

export function AuditProvider({ children, API_BASE }: AuditProviderProps) {
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
      console.error("Error loading audit content", err);
      setError(err?.message ?? "Failed to load audit content");
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

  const getById = useCallback((entityType: AuditEntityType, id: string): AuditItem | undefined => {
    if (!data) return undefined;
    return data.items.find(
      (item) => item.entityType === entityType && item.id === id
    );
  }, [data]);

  const getByKey = useCallback((entityType: AuditEntityType, key: string): AuditItem | undefined => {
    if (!data) return undefined;
    
    // First try exact case-insensitive match
    const exactMatch = data.items.find(
      (item) =>
        item.entityType === entityType &&
        item.key?.toLowerCase() === key.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Then try partial contains match
    return data.items.find(
      (item) =>
        item.entityType === entityType &&
        item.key?.toLowerCase().includes(key.toLowerCase())
    );
  }, [data]);

  const getBestMatch = useCallback(
    (params: { entityType: AuditEntityType; id?: string; key?: string }): AuditItem | undefined => {
      if (!data) return undefined;
      
      // Prefer id match
      if (params.id) {
        const idMatch = getById(params.entityType, params.id);
        if (idMatch) return idMatch;
      }
      
      // Fallback to key match
      if (params.key) {
        return getByKey(params.entityType, params.key);
      }
      
      return undefined;
    },
    [data, getById, getByKey]
  );

  const value: AuditContextType = {
    items: data?.items ?? [],
    summary: data?.summary ?? null,
    loading,
    error,
    refresh,
    getById,
    getByKey,
    getBestMatch,
  };

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}

