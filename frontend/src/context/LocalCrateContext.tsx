import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export type LocalTrack = {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    filename: string;
    file?: File;
};

export type AnalyzeProgressState = {
    analyzing: boolean;
    current: number;
    total: number;
};

type LocalCrateContextType = {
    localLibrary: LocalTrack[];
    setLocalLibrary: (tracks: LocalTrack[]) => void;
    addToLocalLibrary: (tracks: LocalTrack[]) => void;
    clearLocalLibrary: () => void;
    isImporting: boolean;
    setIsImporting: (v: boolean) => void;
    analyzeProgress: AnalyzeProgressState;
    setAnalyzeProgress: (v: AnalyzeProgressState) => void;
};

const LocalCrateContext = createContext<LocalCrateContextType | undefined>(undefined);

export const LocalCrateProvider = ({ children }: { children: ReactNode }) => {
    const [localLibrary, setLocalLibrary] = useState<LocalTrack[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [analyzeProgress, setAnalyzeProgress] = useState<AnalyzeProgressState>({
        analyzing: false,
        current: 0,
        total: 0,
    });

    const addToLocalLibrary = (tracks: LocalTrack[]) => {
        setLocalLibrary((prev) => [...prev, ...tracks]);
    };

    const clearLocalLibrary = () => {
        setLocalLibrary([]);
        toast.success('Local Crate cleared.');
    };

    return (
        <LocalCrateContext.Provider value={{ localLibrary, setLocalLibrary, addToLocalLibrary, clearLocalLibrary, isImporting, setIsImporting, analyzeProgress, setAnalyzeProgress }}>
            {children}
        </LocalCrateContext.Provider>
    );
};

export const useLocalCrate = () => {
    const context = useContext(LocalCrateContext);
    if (!context) {
        throw new Error('useLocalCrate must be used within a LocalCrateProvider');
    }
    return context;
};
