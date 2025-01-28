import { useState } from 'react';
import { useSolanaWallet } from '../contexts/SolanaWalletContext';
import SolanaProjectList from '../components/solana/SolanaProjectList';
import CreateSolanaProject from '../components/solana/CreateSolanaProject';
import SolanaInvest from '../components/solana/SolanaInvest';
import ClaimTokens from '../components/solana/ClaimTokens';
import FinalizePool from '../components/solana/FinalizePool';
import SolanaWalletButton from '../components/solana/SolanaWalletButton';

type TabType = 'projects' | 'create' | 'invest' | 'claim' | 'finalize';

const SolanaLaunchpad = () => {
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const { connected } = useSolanaWallet();

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Solana Launchpad</h1>
                    <SolanaWalletButton />
                </div>

                {!connected && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg mb-6">
                        Please connect your Phantom wallet to interact with Solana projects
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'projects' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                    >
                        View Projects
                    </button>
                    {connected && (
                        <>
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'create' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                            >
                                Create Project
                            </button>
                            <button
                                onClick={() => setActiveTab('invest')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'invest' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                            >
                                Invest
                            </button>
                            <button
                                onClick={() => setActiveTab('claim')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'claim' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                            >
                                Claim Tokens
                            </button>
                            <button
                                onClick={() => setActiveTab('finalize')}
                                className={`px-4 py-2 rounded-lg ${activeTab === 'finalize' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                            >
                                Finalize Pool
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    {activeTab === 'projects' && <SolanaProjectList />}
                    {connected && (
                        <>
                            {activeTab === 'create' && <CreateSolanaProject />}
                            {activeTab === 'invest' && <SolanaInvest />}
                            {activeTab === 'claim' && <ClaimTokens />}
                            {activeTab === 'finalize' && <FinalizePool />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolanaLaunchpad; 