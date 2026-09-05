// OOP: Encapsulation — This context encapsulates global state management, hiding data fetching and storage details from components.
// OOP: Abstraction — Provides an abstract interface for data access, allowing components to use data without knowing the source.

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { createClient } from "@/lib/supabase";

// Define the shape of our global data
export interface GlobalDataState {
  targets: any[];
  assets: any[];
  services: any[];
  ports: any[];
  topology: any[];
  findings: any[];
}

interface GlobalDataContextType {
  data: GlobalDataState;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  setTargets: (targets: any[]) => void;
  setAssets: (assets: any[]) => void;
  setServices: (services: any[]) => void;
  setPorts: (ports: any[]) => void;
  setTopology: (topology: any[]) => void;
  setFindings: (findings: any[]) => void;
}

const defaultState: GlobalDataState = {
  targets: [],
  assets: [],
  services: [],
  ports: [],
  topology: [],
  findings: [],
};

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GlobalDataState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch data globally
  const refreshData = async () => {
    try {
      const response = await fetch('/api/global-data');
      if (response.ok) {
        const result = await response.json();
        setData(prev => ({
          ...prev,
          targets: result.targets || [],
          assets: result.assets || [],
          services: result.services || [],
          ports: result.ports || [],
          topology: result.topology || [],
        }));
      }
      
      // Also fetch findings explicitly for the dashboard
      const { data: findings } = await supabase.from('findings').select('*');
      if (findings) {
        setData(prev => ({ ...prev, findings }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Set up Realtime subscriptions
    const channel = supabase
      .channel('global_data_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => ({ ...prev, targets: [payload.new, ...prev.targets] }));
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => ({
            ...prev,
            targets: prev.targets.map(t => t.id === payload.new.id ? payload.new : t)
          }));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assets' }, (payload) => {
        setData(prev => ({ ...prev, assets: [payload.new, ...prev.assets] }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'findings' }, (payload) => {
        setData(prev => ({ ...prev, findings: [payload.new, ...prev.findings] }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setTargets = (targets: any[]) => setData((prev) => ({ ...prev, targets }));
  const setAssets = (assets: any[]) => setData((prev) => ({ ...prev, assets }));
  const setServices = (services: any[]) => setData((prev) => ({ ...prev, services }));
  const setPorts = (ports: any[]) => setData((prev) => ({ ...prev, ports }));
  const setTopology = (topology: any[]) => setData((prev) => ({ ...prev, topology }));
  const setFindings = (findings: any[]) => setData((prev) => ({ ...prev, findings }));

  return (
    <GlobalDataContext.Provider
      value={{
        data,
        isLoading,
        refreshData,
        setTargets,
        setAssets,
        setServices,
        setPorts,
        setTopology,
        setFindings,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

// Hook to use the global context easily
export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }
  return context;
}
