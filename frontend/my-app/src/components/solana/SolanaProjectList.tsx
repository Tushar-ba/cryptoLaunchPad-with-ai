import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { useNetwork } from '../../contexts/NetworkContext';
import { useSolanaWallet } from '../../contexts/SolanaWalletContext';
import CountdownTimer from '../CountdownTimer';
import { IDL } from '../../utils/solana/idl';
import { PROGRAM_ID, NETWORK } from '../../utils/solana/constants';

interface SolanaPool {
  authority: PublicKey;
  tokenMint: PublicKey;
  tokenVault: PublicKey;
  tokenPrice: number;
  tokenRatio: number;
  poolSize: number;
  totalRaised: number;
  startTime: number;
  endTime: number;
  finalized: boolean;
}

const SolanaProjectCard = ({ pool, pubkey }: { pool: SolanaPool; pubkey: PublicKey }) => {
  const progress = (pool.totalRaised / pool.poolSize) * 100;
  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= pool.startTime && now <= pool.endTime && !pool.finalized;

  return (
    <div className={`bg-black text-white rounded-lg shadow-xl p-6 mb-4 border 
                    ${isActive ? 'border-gray-800 hover:border-gray-600' : 'border-red-900 hover:border-red-700'} 
                    transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">Pool {pubkey.toString().slice(0, 8)}...</h3>
            {!isActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-900 text-red-200 rounded">
                {pool.finalized ? 'Finalized' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm mb-1">
            {isActive ? 'Time Remaining:' : 'Ended'}
          </div>
          {isActive ? (
            <CountdownTimer endTime={pool.endTime} />
          ) : (
            <div className="text-red-400 text-sm">Pool Ended</div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-gray-300">{progress.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`${isActive ? 'bg-white' : 'bg-red-500'} rounded-full h-2 transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Goal</div>
          <div className="font-semibold text-white">
            {pool.poolSize / anchor.web3.LAMPORTS_PER_SOL} SOL
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Token Price</div>
          <div className="font-semibold text-white">
            {pool.tokenPrice} lamports
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Total Raised</div>
          <div className="font-semibold text-white">
            {pool.totalRaised / anchor.web3.LAMPORTS_PER_SOL} SOL
          </div>
        </div>
      </div>
    </div>
  );
};

const SolanaProjectList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet } = useSolanaWallet();

  useEffect(() => {
    fetchProjects();
  }, [wallet]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log("Fetching projects...");
      console.log("Program ID:", PROGRAM_ID.toString());
      console.log("Network:", NETWORK);

      const connection = new Connection(NETWORK, 'confirmed');
      
      // Create a dummy wallet if none is connected
      const dummyKeypair = Keypair.generate();
      const dummyWallet = {
        publicKey: dummyKeypair.publicKey,
        signTransaction: () => Promise.reject(),
        signAllTransactions: () => Promise.reject(),
        payer: dummyKeypair
      };

      const provider = new anchor.AnchorProvider(
        connection,
        wallet || dummyWallet,
        { commitment: 'confirmed' }
      );

      const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
      
      // Get all program accounts with a more specific filter
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
          {
            dataSize: 145, // Size of your Pool struct (adjust if needed)
          },
        ],
      });

      console.log("Found accounts:", accounts);

      const pools = await Promise.all(accounts.map(async ({ pubkey, account }) => {
        try {
          console.log(`Attempting to decode account ${pubkey.toString()}`);
          console.log("Account data:", account.data);
          
          const poolData = program.coder.accounts.decode(
            'Pool',
            account.data
          );
          
          console.log("Successfully decoded pool data:", poolData);
          
          return {
            publicKey: pubkey,
            account: poolData
          };
        } catch (e) {
          console.error(`Error decoding account ${pubkey.toString()}:`, e);
          return null;
        }
      }));

      const validPools = pools.filter(Boolean);
      console.log('Valid pools:', validPools);
      setProjects(validPools);

    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSol = (lamports: anchor.BN) => {
    return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(2);
  };

  if (loading) {
    return <div className="text-white">Loading projects...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-white">Available Pools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <div 
              key={project.publicKey.toString()} 
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Pool #{project.publicKey.toString().slice(0, 8)}
                  </h3>
                  <p className="text-gray-400">
                    Created by: {project.account.authority.toString().slice(0, 8)}...
                  </p>
                </div>
                <span className={`px-2 py-1 text-sm rounded ${
                  project.account.finalized ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                }`}>
                  {project.account.finalized ? 'Finalized' : 'Active'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Price:</span>
                  <span className="text-white">{formatSol(project.account.tokenPrice)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Ratio:</span>
                  <span className="text-white">{project.account.tokenRatio.toString()} tokens/SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool Size:</span>
                  <span className="text-white">{formatSol(project.account.poolSize)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Raised:</span>
                  <span className="text-white">{formatSol(project.account.totalRaised)} SOL</span>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center text-gray-400 col-span-full">
              No active projects available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolanaProjectList; 