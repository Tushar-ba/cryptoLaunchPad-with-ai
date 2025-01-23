import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Add type declaration for ethereum
declare global {
    interface Window {
        ethereum?: {
            selectedAddress?: string;
        };
    }
}

const Navbar = () => {
    const router = useRouter();
    const [address, setAddress] = useState<string>('');

    useEffect(() => {
        // Check for ethereum address after component mounts
        if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
            setAddress(window.ethereum.selectedAddress);
        }
    }, []);

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
                    <div className="flex space-x-1">
                        <Link 
                            href="/" 
                            className={`px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors ${isActive('/')}`}
                        >
                            Projects
                        </Link>
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
                    <div className="ml-auto text-gray-400 text-sm">
                        {address && `Connected: ${formatAddress(address)}`}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 