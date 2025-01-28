import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface WalletContextType {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  address: string | null;
  isConnected: boolean;
  isMetaMask: boolean;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const router = useRouter();
  const isMetaMask = router.pathname !== '/solana-launchpad';

  const switchNetwork = async () => {
    if (isMetaMask) {
      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Mumbai testnet
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13881',
              chainName: 'Mumbai Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com']
            }]
          });
        }
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (isMetaMask) {
        if (typeof window.ethereum !== 'undefined') {
          await switchNetwork();
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAddress(accounts[0]);
        } else {
          window.open('https://metamask.io/', '_blank');
        }
      } else {
        const { solana } = window as any;
        if (solana?.isPhantom) {
          const response = await solana.connect();
          setAddress(response.publicKey.toString());
        } else {
          window.open('https://phantom.app/', '_blank');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
  };

  useEffect(() => {
    if (isMetaMask && window.ethereum?.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }
  }, [isMetaMask]);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        address,
        isConnected: !!address,
        isMetaMask,
        switchNetwork
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 