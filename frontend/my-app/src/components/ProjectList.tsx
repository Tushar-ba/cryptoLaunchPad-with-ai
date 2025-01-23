import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getLaunchpadContract } from '../utils/contract';
import CountdownTimer from './CountdownTimer';

interface Project {
  projectId: number;
  name: string;
  description: string;
  goal: ethers.BigNumber;
  fixedInvest: ethers.BigNumber;
  totalCollected: ethers.BigNumber;
  fundingPeriodEnd: number;
  isActive: boolean;
  // ... other project properties
}

const ProjectCard = ({ project }: { project: Project }) => {
  const [isAvailable, setIsAvailable] = useState(true);

  const handleExpire = () => {
    setIsAvailable(false);
  };

  const formatEther = (value: ethers.BigNumber) => {
    return ethers.utils.formatUnits(value, 18);
  };

  const progress = (Number(formatEther(project.totalCollected)) / 
                   Number(formatEther(project.goal))) * 100;

  if (!isAvailable || !project.isActive) {
    return null;
  }

  return (
    <div className="bg-black text-white rounded-lg shadow-xl p-6 mb-4 border border-gray-800 hover:border-gray-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{project.name}</h3>
          <p className="text-gray-400 mt-1">{project.description}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm mb-1">Time Remaining:</div>
          <CountdownTimer 
            endTime={Number(project.fundingPeriodEnd)} 
            onExpire={handleExpire}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-gray-300">{progress.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
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
      </div>
    </div>
  );
};

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProject = async (id: number) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getLaunchpadContract(provider);
            const project = await contract.getProject(id);
            if (project.creator !== ethers.constants.AddressZero) {
                // Check if project already exists before adding
                setProjects(prev => {
                    const exists = prev.some(p => p.projectId.toString() === project.projectId.toString());
                    if (!exists) {
                        return [...prev, project];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    useEffect(() => {
        const loadProjects = async () => {
            try {
                setProjects([]); // Reset projects before loading
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = getLaunchpadContract(provider);
                const currentProjectId = await contract.PROJECTID();
                
                for (let i = 1; i <= currentProjectId.toNumber(); i++) {
                    await fetchProject(i);
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        };

        loadProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white">Available Projects</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.projectId} project={project} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectList; 