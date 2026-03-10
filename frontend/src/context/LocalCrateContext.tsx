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

type LocalCrateContextType = {
    localLibrary: LocalTrack[];
    setLocalLibrary: (tracks: LocalTrack[]) => void;
    addToLocalLibrary: (tracks: LocalTrack[]) => void;
    clearLocalLibrary: () => void;
};

const LocalCrateContext = createContext<LocalCrateContextType | undefined>(undefined);

export const LocalCrateProvider = ({ children }: { children: ReactNode }) => {
    const [localLibrary, setLocalLibrary] = useState<LocalTrack[]>([]);

    const addToLocalLibrary = (tracks: LocalTrack[]) => {
        setLocalLibrary((prev) => [...prev, ...tracks]);
    };

    const clearLocalLibrary = () => {
        setLocalLibrary([]);
        toast.success('Local Crate cleared.');
    };

    return (
        <LocalCrateContext.Provider value={{ localLibrary, setLocalLibrary, addToLocalLibrary, clearLocalLibrary }}>
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
