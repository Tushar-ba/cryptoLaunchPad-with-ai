import { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { useSolanaWallet } from '../../contexts/SolanaWalletContext';
import { PROGRAM_ID, NETWORK } from '../../utils/solana/constants';
import { IDL } from '../../utils/solana/idl';

const SolanaInvest = () => {
    const { connected, wallet } = useSolanaWallet();
    const [poolAddress, setPoolAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContribute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet) return;

        try {
            setLoading(true);
            const connection = new Connection(NETWORK);
            const provider = new anchor.AnchorProvider(
                connection,
                wallet,
                { commitment: 'processed' }
            );

            const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

            // Create the contribution account
            const userContribution = anchor.web3.Keypair.generate();

            await program.methods
                .contribute(new anchor.BN(parseFloat(amount) * LAMPORTS_PER_SOL))
                .accounts({
                    pool: new PublicKey(poolAddress),
                    userContribution: userContribution.publicKey,
                    contributor: provider.wallet.publicKey,
                })
                .signers([userContribution])
                .rpc();

            alert('Successfully contributed!');
        } catch (error) {
            console.error('Error contributing:', error);
            alert('Error contributing. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleContribute} className="max-w-lg mx-auto space-y-6">
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
            <div>
                <label className="block text-gray-300 mb-2">Amount (SOL)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                               text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    step="0.000000001"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading || !connected}
                className={`w-full py-3 rounded-lg font-semibold ${
                    loading || !connected
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {loading ? 'Contributing...' : 'Contribute'}
            </button>
        </form>
    );
};

export default SolanaInvest; 