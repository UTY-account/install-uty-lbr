'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Company {
  id: string;
  code: string;
  nameTh: string;
  nameEn?: string | null;
  taxId: string;
  phone?: string | null;
  email?: string | null;
  address: string;
  logoUrl?: string | null;
  bankInfo?: string | null;
}

interface CompanyContextType {
  selectedCompanyCode: string; // 'all' or 'CP1', 'CP2'...
  setSelectedCompanyCode: (code: string) => void;
  selectedCompany: Company | null;
  companies: Company[];
  loadingCompanies: boolean;
  refreshCompanies: () => Promise<void>;
  isConsolidated: boolean;
}

const CompanyContext = createContext<CompanyContextType>({
  selectedCompanyCode: 'all',
  setSelectedCompanyCode: () => {},
  selectedCompany: null,
  companies: [],
  loadingCompanies: true,
  refreshCompanies: async () => {},
  isConsolidated: true,
});

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompanyCode, setSelectedCompanyCodeState] = useState<string>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    const saved = localStorage.getItem('install_selected_company');
    if (saved) {
      setSelectedCompanyCodeState(saved);
    }
  }, []);

  const setSelectedCompanyCode = (code: string) => {
    setSelectedCompanyCodeState(code);
    localStorage.setItem('install_selected_company', code);
  };

  const selectedCompany = companies.find((c) => c.code === selectedCompanyCode) || null;
  const isConsolidated = selectedCompanyCode === 'all';

  return (
    <CompanyContext.Provider
      value={{
        selectedCompanyCode,
        setSelectedCompanyCode,
        selectedCompany,
        companies,
        loadingCompanies,
        refreshCompanies: fetchCompanies,
        isConsolidated,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
