import { useNetwork } from '../contexts/NetworkContext';

const NetworkSwitcher = () => {
  const { networkType, setNetworkType, disconnectWallet } = useNetwork();

  const handleNetworkChange = (type: 'evm' | 'solana') => {
    disconnectWallet();
    setNetworkType(type);
  };

  return (
    <div className="flex items-center space-x-4 mb-6">
      <button
        onClick={() => handleNetworkChange('evm')}
        className={`px-4 py-2 rounded-lg font-semibold ${
          networkType === 'evm'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Polygon Amoy
      </button>
      <button
        onClick={() => handleNetworkChange('solana')}
        className={`px-4 py-2 rounded-lg font-semibold ${
          networkType === 'solana'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Solana
      </button>
    </div>
  );
};

export default NetworkSwitcher; 