import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { useSolanaWallet } from '../../contexts/SolanaWalletContext';
import { PROGRAM_ID, NETWORK } from '../../utils/solana/constants';
import { IDL } from '../../utils/solana/idl';

const ClaimTokens = () => {
    const { connected, wallet } = useSolanaWallet();
    const [poolAddress, setPoolAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClaim = async (e: React.FormEvent) => {
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
            const poolKey = new PublicKey(poolAddress);

            // Find PDAs
            const [userContribution] = await PublicKey.findProgramAddress(
                [
                    Buffer.from("contribution"),
                    poolKey.toBuffer(),
                    provider.wallet.publicKey.toBuffer()
                ],
                program.programId
            );

            await program.methods
                .claimTokens()
                .accounts({
                    pool: poolKey,
                    userContribution,
                    user: provider.wallet.publicKey,
                })
                .rpc();

            alert('Successfully claimed tokens!');
        } catch (error) {
            console.error('Error claiming tokens:', error);
            alert('Error claiming tokens. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleClaim} className="max-w-lg mx-auto space-y-6">
            <div>
                <label className="block text-gray-300 mb-2">Pool Address</label>
                <input
                    type="text"
                    value={poolAddress}
                    onChange={(e) => setPoolAddress(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    placeholder="Enter pool address"
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
                {loading ? 'Claiming...' : 'Claim Tokens'}
            </button>
        </form>
    );
};

export default ClaimTokens; 