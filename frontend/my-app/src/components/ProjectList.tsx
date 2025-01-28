import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getLaunchpadContract } from '../utils/contract';
import CountdownTimer from './CountdownTimer';
import { useNetwork } from '../contexts/NetworkContext';

interface Project {
  projectId: number;
  name: string;
  description: string;
  goal: ethers.BigNumber;
  fixedInvest: ethers.BigNumber;
  totalCollected: ethers.BigNumber;
  fundingPeriodEnd: number;
  isActive: boolean;
  creator: string;
  totalWithdrawable: ethers.BigNumber;
  // ... other project properties
}

const ProjectCard = ({ project }: { project: Project }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const checkCreator = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setIsCreator(address.toLowerCase() === project.creator.toLowerCase());
      }
    };
    checkCreator();
  }, [project.creator]);

  const handleExpire = () => {
    setIsAvailable(false);
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getLaunchpadContract(signer);

      // Check if funding period has ended
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime <= project.fundingPeriodEnd) {
        throw new Error("Funding period has not ended yet");
      }

      // Additional checks matching the contract requirements
      if (project.isActive) {
        throw new Error("Project is still active");
      }

      if (project.totalWithdrawable.eq(0)) {
        throw new Error("No funds available to withdraw");
      }

      const tx = await contract.withdrawFunding(project.projectId);
      await tx.wait();
      
      // Refresh the project data after successful withdrawal
      window.location.reload();
      alert('Funds withdrawn successfully!');
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      // Provide more user-friendly error messages
      if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Error withdrawing funds. Make sure funding period has ended and you are the project creator.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Add a function to check if withdrawal is possible
  const canWithdraw = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return (
      isCreator && 
      !project.isActive && 
      currentTime > project.fundingPeriodEnd &&
      !project.totalWithdrawable.eq(0)
    );
  };

  const formatEther = (value: ethers.BigNumber) => {
    return ethers.utils.formatUnits(value, 18);
  };

  const progress = (Number(formatEther(project.totalCollected)) / 
                   Number(formatEther(project.goal))) * 100;

  return (
    <div className={`bg-black text-white rounded-lg shadow-xl p-6 mb-4 border 
                    ${project.isActive ? 'border-gray-800 hover:border-gray-600' : 'border-red-900 hover:border-red-700'} 
                    transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{project.name}</h3>
            <span className="text-sm text-gray-400">(ID: {project.projectId.toString()})</span>
            {!project.isActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-900 text-red-200 rounded">Inactive</span>
            )}
          </div>
          <p className="text-gray-400 mt-1">{project.description}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm mb-1">
            {project.isActive ? 'Time Remaining:' : 'Ended'}
          </div>
          {project.isActive ? (
            <CountdownTimer 
              endTime={Number(project.fundingPeriodEnd)} 
              onExpire={handleExpire}
            />
          ) : (
            <div className="text-red-400 text-sm">Funding Period Ended</div>
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
            className={`${project.isActive ? 'bg-white' : 'bg-red-500'} rounded-full h-2 transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-gray-400 mb-1">Goal</div>
          <div className="font-semibold text-white">
            {formatEther(project.goal)} MATIC
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Fixed Investment</div>
          <div className="font-semibold text-white">
            {formatEther(project.fixedInvest)} MATIC
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">Total Collected</div>
          <div className="font-semibold text-white">
            {formatEther(project.totalCollected)} MATIC
          </div>
        </div>
      </div>

      {isCreator && !project.isActive && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-400 mb-1">Available to Withdraw</div>
              <div className="font-semibold text-white">
                {formatEther(project.totalWithdrawable)} MATIC
              </div>
              {!canWithdraw() && (
                <div className="text-red-400 text-sm mt-1">
                  {project.totalWithdrawable.eq(0) 
                    ? "No funds available" 
                    : Math.floor(Date.now() / 1000) <= project.fundingPeriodEnd 
                      ? "Funding period not ended yet"
                      : "Cannot withdraw at this time"}
                </div>
              )}
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !canWithdraw()}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors
                ${(isWithdrawing || !canWithdraw())
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw Funds'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentNetwork } = useNetwork();

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            setProjects([]); // Clear existing projects when switching networks
            
            try {
                if (currentNetwork === 'polygon') {
                    // Existing Polygon projects loading logic
                    if (typeof window.ethereum !== 'undefined') {
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        const contract = getLaunchpadContract(provider);
                        const currentProjectId = await contract.PROJECTID();
                        
                        for (let i = 1; i <= currentProjectId.toNumber(); i++) {
                            const project = await contract.getProject(i);
                            if (project.creator !== ethers.constants.AddressZero) {
                                setProjects(prev => [...prev, project]);
                            }
                        }
                    }
                } else {
                    // Sample Solana projects for testing
                    const sampleSolanaProjects = [
                        {
                            projectId: 1,
                            name: "Solana Project 1",
                            description: "This is a test Solana project",
                            goal: ethers.BigNumber.from("10000000000"),
                            fixedInvest: ethers.BigNumber.from("1000000000"),
                            totalCollected: ethers.BigNumber.from("5000000000"),
                            fundingPeriodEnd: Math.floor(Date.now() / 1000) + 86400,
                            isActive: true,
                            creator: "SolanaAddress1...",
                            totalWithdrawable: ethers.BigNumber.from("0")
                        },
                        {
                            projectId: 2,
                            name: "Solana Project 2",
                            description: "Another test Solana project",
                            goal: ethers.BigNumber.from("20000000000"),
                            fixedInvest: ethers.BigNumber.from("2000000000"),
                            totalCollected: ethers.BigNumber.from("10000000000"),
                            fundingPeriodEnd: Math.floor(Date.now() / 1000) - 3600,
                            isActive: false,
                            creator: "SolanaAddress2...",
                            totalWithdrawable: ethers.BigNumber.from("10000000000")
                        }
                    ];
                    setProjects(sampleSolanaProjects);
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [currentNetwork]); // Re-run when network changes

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 px-4 py-8">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-white">Loading Projects...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white">
                    {currentNetwork === 'polygon' ? 'Polygon' : 'Solana'} Projects
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.projectId.toString()} project={project} />
                    ))}
                </div>
                {projects.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                        No projects available on {currentNetwork === 'polygon' ? 'Polygon' : 'Solana'} network
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList; 