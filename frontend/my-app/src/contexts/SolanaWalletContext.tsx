import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { NETWORK } from '../utils/solana/constants';

interface SolanaWalletContextType {
    wallet: any | null;
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined);

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
    const [wallet, setWallet] = useState<any | null>(null);
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        const checkWallet = async () => {
            try {
                // Check if Phantom is installed
                const solana = (window as any).solana;
                
                if (solana?.isPhantom) {
                    setWallet(solana);
                    
                    // Check if already connected
                    if (solana.isConnected) {
                        const response = await solana.connect({ onlyIfTrusted: true });
                        setPublicKey(response.publicKey);
                        setConnected(true);
                    }
                }
            } catch (error) {
                console.error('Error checking wallet:', error);
            }
        };

        checkWallet();
    }, []);

    const connect = async () => {
        try {
            if (wallet) {
                setConnecting(true);
                const response = await wallet.connect();
                setPublicKey(response.publicKey);
                setConnected(true);
            } else {
                window.open('https://phantom.app/', '_blank');
            }
        } catch (error) {
            console.error('Error connecting to wallet:', error);
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = () => {
        if (wallet) {
            wallet.disconnect();
            setPublicKey(null);
            setConnected(false);
        }
    };

    return (
        <SolanaWalletContext.Provider
            value={{
                wallet,
                publicKey,
                connected,
                connecting,
                connect,
                disconnect
            }}
        >
            {children}
        </SolanaWalletContext.Provider>
    );
}

export function useSolanaWallet() {
    const context = useContext(SolanaWalletContext);
    if (!context) {
        throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
    }
    return context;
} 