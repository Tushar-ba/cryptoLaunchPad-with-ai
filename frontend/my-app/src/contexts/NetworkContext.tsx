import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

type NetworkType = 'polygon' | 'solana';
type WalletType = 'metamask' | 'phantom' | null;

interface NetworkContextType {
  currentNetwork: NetworkType;
  setCurrentNetwork: (network: NetworkType) => void;
  walletType: WalletType;
  setWalletType: (wallet: WalletType) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('polygon');
  const [walletType, setWalletType] = useState<WalletType>(null);

  return (
    <NetworkContext.Provider value={{ 
      currentNetwork, 
      setCurrentNetwork,
      walletType,
      setWalletType
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
} 