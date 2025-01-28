import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import CountdownTimer from '../CountdownTimer';

interface SolanaProject {
  id: number;
  name: string;
  description: string;
  goal: number;
  fixedInvestment: number;
  totalCollected: number;
  isActive: boolean;
  endTime: number;
}

const ProjectCard = ({ project }: { project: SolanaProject }) => {
  const progress = (project.totalCollected / project.goal) * 100;

  return (
    <div className="bg-black text-white rounded-lg p-6 mb-4 border border-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">
              {project.name} <span className="text-sm text-gray-400">(ID: {project.id})</span>
            </h3>
            {!project.isActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-900 text-red-200 rounded">
                Inactive
              </span>
            )}
          </div>
          <p className="text-gray-400">{project.description}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm mb-1">
            {project.isActive ? 'Time Remaining:' : 'Expired'}
          </div>
          {project.isActive ? (
            <CountdownTimer endTime={project.endTime} />
          ) : (
            <div className="text-red-500">Expired</div>
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
            className={`${project.isActive ? 'bg-white' : 'bg-red-500'} rounded-full h-2`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Goal</div>
          <div className="font-semibold text-white">{project.goal} SOL</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Fixed Investment</div>
          <div className="font-semibold text-white">{project.fixedInvestment} SOL</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Total Collected</div>
          <div className="font-semibold text-white">{project.totalCollected} SOL</div>
        </div>
      </div>
    </div>
  );
};

const SolanaProjects = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [projects, setProjects] = useState<SolanaProject[]>([
    // Sample data - replace with actual data from your Solana program
    {
      id: 1,
      name: "Test Project 1",
      description: "This is a test Solana project",
      goal: 10,
      fixedInvestment: 1,
      totalCollected: 5,
      isActive: true,
      endTime: Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
    },
    {
      id: 2,
      name: "Test Project 2",
      description: "Another test Solana project",
      goal: 20,
      fixedInvestment: 2,
      totalCollected: 15,
      isActive: false,
      endTime: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    }
  ]);

  const connectPhantom = async () => {
    try {
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      const response = await solana.connect();
      setWallet(response.publicKey.toString());
    } catch (err) {
      console.error('Error connecting to Phantom:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Solana Projects</h2>
          {wallet ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">
                {wallet.slice(0, 4)}...{wallet.slice(-4)}
              </span>
              <button
                onClick={() => setWallet(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectPhantom}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Connect Phantom
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolanaProjects; 