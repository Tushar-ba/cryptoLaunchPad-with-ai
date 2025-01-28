import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';

// Add type declaration for ethereum
declare global {
    interface Window {
        ethereum?: {
            selectedAddress?: string;
            request: (args: any) => Promise<any>;
        };
        solana?: {
            isPhantom?: boolean;
            connect: () => Promise<any>;
        };
    }
}

const Navbar = () => {
    const router = useRouter();
    const [address, setAddress] = useState<string>('');
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { currentNetwork, setCurrentNetwork, walletType, setWalletType } = useNetwork();

    const handleNetworkSwitch = async (network: 'polygon' | 'solana') => {
        setCurrentNetwork(network);
        setAddress(''); // Clear current connection
        setWalletType(null);
        setIsWalletModalOpen(true);
    };

    const connectMetaMask = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x13881' }],
                });
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAddress(accounts[0]);
                setWalletType('metamask');
            } else {
                window.open('https://metamask.io/', '_blank');
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
        setIsWalletModalOpen(false);
    };

    const connectPhantom = async () => {
        try {
            const { solana } = window as any;
            if (solana?.isPhantom) {
                const response = await solana.connect();
                setAddress(response.publicKey.toString());
                setWalletType('phantom');
            } else {
                window.open('https://phantom.app/', '_blank');
            }
        } catch (error) {
            console.error('Error connecting to Phantom:', error);
        }
        setIsWalletModalOpen(false);
    };

    const disconnectWallet = () => {
        setAddress('');
        setWalletType(null);
    };

    const formatAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const isActive = (path: string) => {
        return router.pathname === path ? 'bg-blue-600' : '';
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-16">
                    <Link href="/" className="text-white text-xl font-bold mr-8">
                        Launchpad Platform
                    </Link>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => handleNetworkSwitch('polygon')}
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors 
                                ${currentNetwork === 'polygon' ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                            Polygon
                        </button>
                        <button 
                            onClick={() => handleNetworkSwitch('solana')}
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors 
                                ${currentNetwork === 'solana' ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                            Solana
                        </button>
                        <Link 
                            href="/create-project" 
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors ${isActive('/create-project')}`}
                        >
                            Create Project
                        </Link>
                        <Link 
                            href="/invest" 
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors ${isActive('/invest')}`}
                        >
                            Invest
                        </Link>
                        <Link 
                            href="/my-investments" 
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors ${isActive('/my-investments')}`}
                        >
                            My Investments
                        </Link>
                    </div>
                    <div className="ml-auto">
                        {address ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-400">
                                    Connected to {walletType === 'metamask' ? 'MetaMask' : 'Phantom'}: 
                                    {formatAddress(address)}
                                </span>
                                <button
                                    onClick={disconnectWallet}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsWalletModalOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Wallet Selection Modal */}
            {isWalletModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Connect to {currentNetwork === 'polygon' ? 'Polygon' : 'Solana'}
                        </h3>
                        <div className="space-y-4">
                            {currentNetwork === 'polygon' ? (
                                <button
                                    onClick={connectMetaMask}
                                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                                >
                                    Connect MetaMask
                                </button>
                            ) : (
                                <button
                                    onClick={connectPhantom}
                                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                                >
                                    Connect Phantom
                                </button>
                            )}
                            <button
                                onClick={() => setIsWalletModalOpen(false)}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg mt-4"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 