import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { MockTrack, MockRequest } from '@/lib/mockDataGenerator';

type MockDataContextType = {
    library: MockTrack[];
    smartRequests: MockRequest[];
};

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider = ({ children }: { children: ReactNode }) => {
    const [library] = useState<MockTrack[]>([]);
    const [smartRequests] = useState<MockRequest[]>([]);

    return (
        <MockDataContext.Provider value={{ library, smartRequests }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
