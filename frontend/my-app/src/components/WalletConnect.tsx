import { useEffect, useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { ethers } from 'ethers';

const WalletConnect = () => {
  const { networkType, connectWallet, disconnectWallet, isConnected, solanaWallet, evmWallet, setWalletType, walletType } = useNetwork();
  const [address, setAddress] = useState<string | null>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        console.log('Connected to MetaMask:', address);
        setAddress(address);
        setWalletType('metamask');
      } else {
        window.open('https://metamask.io/download.html', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const disconnect = () => {
    setWalletType(null);
    setAddress(null);
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletType(null);
          setAddress(null);
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setWalletType('metamask');
          }
        });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [setWalletType]);

  return (
    <div className="flex items-center space-x-2">
      {walletType === 'metamask' && address ? (
        <>
          <span className="text-sm text-gray-400">
            {formatAddress(address)}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connectMetaMask}
          className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
};

export default WalletConnect; 