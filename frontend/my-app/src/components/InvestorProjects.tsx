import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getLaunchpadContract } from '../utils/contract';

interface Investment {
    projectId: ethers.BigNumber;
    investor: string;
    amount: ethers.BigNumber;
    tokenSupply: ethers.BigNumber;
}

const InvestorProjects = () => {
    const [investments, setInvestments] = useState<Investment | null>(null);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCreator, setIsCreator] = useState(false);

    const formatEther = (value: ethers.BigNumber) => {
        return ethers.utils.formatUnits(value, 18);
    };

    const handleWithdraw = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getLaunchpadContract(signer);

            const tx = await contract.withdrawFunding(projectDetails.projectId);
            await tx.wait();
            alert('Funds withdrawn successfully!');
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            alert('Error withdrawing funds');
        }
    };

    useEffect(() => {
        const fetchInvestorDetails = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                const contract = getLaunchpadContract(provider);

                // Get investor's investments
                const investment = await contract.getInvestors(address);
                if (investment.investor !== ethers.constants.AddressZero) {
                    setInvestments(investment);

                    // Get project details for the investment
                    const project = await contract.getProject(investment.projectId);
                    setProjectDetails(project);
                }
            } catch (error) {
                console.error('Error fetching investor details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestorDetails();
    }, []);

    useEffect(() => {
        const checkCreator = async () => {
            if (projectDetails) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setIsCreator(address.toLowerCase() === projectDetails.creator.toLowerCase());
            }
        };
        checkCreator();
    }, [projectDetails]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 px-4 py-8">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8 text-white">Your Investments</h2>
                    <div className="text-white">Loading...</div>
                </div>
            </div>
        );
    }

    if (!investments || !projectDetails) {
        return (
            <div className="min-h-screen bg-gray-900 px-4 py-8">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8 text-white">Your Investments</h2>
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <p className="text-gray-400">No investments found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl font-bold mb-8 text-white">Your Investments</h2>
                
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Investment Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-gray-400 block">Project ID</label>
                                    <span className="text-white">{investments.projectId.toString()}</span>
                                </div>
                                <div>
                                    <label className="text-gray-400 block">Amount Invested</label>
                                    <span className="text-white">{formatEther(investments.amount)} MATIC</span>
                                </div>
                                <div>
                                    <label className="text-gray-400 block">Tokens Received</label>
                                    <span className="text-white">{investments.tokenSupply.toString()} Tokens</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Project Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-gray-400 block">Project Name</label>
                                    <span className="text-white">{projectDetails.name}</span>
                                </div>
                                <div>
                                    <label className="text-gray-400 block">Project Goal</label>
                                    <span className="text-white">{formatEther(projectDetails.goal)} MATIC</span>
                                </div>
                                <div>
                                    <label className="text-gray-400 block">Total Collected</label>
                                    <span className="text-white">{formatEther(projectDetails.totalCollected)} MATIC</span>
                                </div>
                                <div>
                                    <label className="text-gray-400 block">Status</label>
                                    <span className={`font-semibold ${projectDetails.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                        {projectDetails.isActive ? 'Active' : 'Completed'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Token Contract</h3>
                        <div className="break-all">
                            <label className="text-gray-400 block">Token Address</label>
                            <span className="text-white">{projectDetails.tokenContractAddress}</span>
                        </div>
                    </div>

                    {isCreator && !projectDetails.isActive && (
                        <div className="pt-4 border-t border-gray-700">
                            <button
                                onClick={handleWithdraw}
                                className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg
                                         hover:bg-gray-200 transition-colors duration-200"
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestorProjects; 