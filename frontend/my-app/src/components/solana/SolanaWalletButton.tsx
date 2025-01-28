import { useSolanaWallet } from '../../contexts/SolanaWalletContext';

const SolanaWalletButton = () => {
    const { connected, connecting, publicKey, connect, disconnect } = useSolanaWallet();

    if (connecting) {
        return (
            <button 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed"
                disabled
            >
                Connecting...
            </button>
        );
    }

    if (connected && publicKey) {
        return (
            <div className="flex items-center space-x-2">
                <span className="text-gray-400">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </span>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
            Connect Phantom
        </button>
    );
};

export default SolanaWalletButton; 