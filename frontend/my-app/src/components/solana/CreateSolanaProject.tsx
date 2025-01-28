import { useState } from 'react';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useSolanaWallet } from '../../contexts/SolanaWalletContext';
import { PROGRAM_ID, NETWORK } from '../../utils/solana/constants';
import { IDL } from '../../utils/solana/idl';

const CreateSolanaProject = () => {
    const { connected, wallet } = useSolanaWallet();
    const [tokenMint, setTokenMint] = useState('');
    const [tokenPrice, setTokenPrice] = useState('');
    const [tokenRatio, setTokenRatio] = useState('');
    const [poolSize, setPoolSize] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const initializePool = async (e: React.FormEvent) => {
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

            // Convert token mint string to PublicKey
            const tokenMintPubkey = new PublicKey(tokenMint);

            // Generate PDA for token vault
            const [tokenVault] = await PublicKey.findProgramAddress(
                [
                    Buffer.from("token_vault"),
                    tokenMintPubkey.toBuffer()
                ],
                program.programId
            );

            // Generate a new pool account
            const pool = anchor.web3.Keypair.generate();

            await program.methods
                .initializePool(
                    new anchor.BN(parseFloat(tokenPrice) * LAMPORTS_PER_SOL), // Convert to lamports
                    new anchor.BN(tokenRatio),
                    new anchor.BN(parseFloat(poolSize) * LAMPORTS_PER_SOL),
                    new anchor.BN(new Date(startTime).getTime() / 1000),
                    new anchor.BN(new Date(endTime).getTime() / 1000)
                )
                .accounts({
                    pool: pool.publicKey,
                    tokenMint: tokenMintPubkey,
                    tokenVault: tokenVault,
                    authority: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                .signers([pool])
                .rpc();

            alert('Pool created successfully!');
        } catch (error) {
            console.error('Error creating pool:', error);
            alert('Error creating pool. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={initializePool} className="max-w-lg mx-auto space-y-6">
            <div>
                <label className="block text-gray-300 mb-2">Token Mint Address</label>
                <input
                    type="text"
                    value={tokenMint}
                    onChange={(e) => setTokenMint(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    placeholder="Enter SPL token mint address"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">Token Price (SOL)</label>
                <input
                    type="number"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    required
                    step="0.000000001"
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">Token Ratio (tokens per SOL)</label>
                <input
                    type="number"
                    value={tokenRatio}
                    onChange={(e) => setTokenRatio(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">Pool Size (SOL)</label>
                <input
                    type="number"
                    value={poolSize}
                    onChange={(e) => setPoolSize(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    required
                    step="0.000000001"
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">Start Time</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2">End Time</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
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
                {loading ? 'Creating Pool...' : 'Create Pool'}
            </button>
        </form>
    );
};

export default CreateSolanaProject;