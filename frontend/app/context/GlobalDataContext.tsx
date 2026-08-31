// OOP: Encapsulation — This context encapsulates global state management, hiding data fetching and storage details from components.
// OOP: Abstraction — Provides an abstract interface for data access, allowing components to use data without knowing the source.

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the shape of our global data
export interface GlobalDataState {
  targets: any[];
  assets: any[];
  services: any[];
  ports: any[];
  topology: any[];
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
}

const defaultState: GlobalDataState = {
  targets: [],
  assets: [],
  services: [],
  ports: [],
  topology: [],
};

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GlobalDataState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data globally
  const refreshData = async () => {
    try {
      const response = await fetch('/api/global-data');
      if (response.ok) {
        const result = await response.json();
        setData({
          targets: result.targets || [],
          assets: result.assets || [],
          services: result.services || [],
          ports: result.ports || [],
          topology: result.topology || [],
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const setTargets = (targets: any[]) => setData((prev) => ({ ...prev, targets }));
  const setAssets = (assets: any[]) => setData((prev) => ({ ...prev, assets }));
  const setServices = (services: any[]) => setData((prev) => ({ ...prev, services }));
  const setPorts = (ports: any[]) => setData((prev) => ({ ...prev, ports }));
  const setTopology = (topology: any[]) => setData((prev) => ({ ...prev, topology }));

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
