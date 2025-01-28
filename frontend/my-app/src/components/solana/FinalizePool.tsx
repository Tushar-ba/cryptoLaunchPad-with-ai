import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { useNetwork } from '../../contexts/NetworkContext';

const PROGRAM_ID = new PublicKey('3gmjtd6RMMcpZQh5snACGLopxmDbkFNoEUXoHtUvWhjX');
const NETWORK = 'https://api.devnet.solana.com';

const FinalizePool = () => {
    const [poolAddress, setPoolAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const { walletType } = useNetwork();

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.solana) return;

        try {
            setLoading(true);
            const connection = new Connection(NETWORK);
            const provider = new anchor.AnchorProvider(
                connection,
                window.solana,
                { commitment: 'processed' }
            );

            const program = new anchor.Program(IDL, PROGRAM_ID, provider);

            await program.methods
                .finalizePool()
                .accounts({
                    pool: new PublicKey(poolAddress),
                    authority: provider.wallet.publicKey,
                })
                .rpc();

            alert('Successfully finalized pool!');
        } catch (error) {
            console.error('Error finalizing pool:', error);
            alert('Error finalizing pool. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (walletType !== 'phantom') {
        return (
            <div className="text-red-400">Please connect Phantom wallet first</div>
        );
    }

    return (
        <form onSubmit={handleFinalize} className="max-w-lg mx-auto space-y-6">
            <div>
                <label className="block text-gray-300 mb-2">Pool Address</label>
                <input
                    type="text"
                    value={poolAddress}
                    onChange={(e) => setPoolAddress(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                               text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    placeholder="Enter pool address"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold ${
                    loading 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {loading ? 'Finalizing...' : 'Finalize Pool'}
            </button>
        </form>
    );
};

export default FinalizePool; 