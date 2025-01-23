import { useState } from 'react';
import { ethers } from 'ethers';
import { getLaunchpadContract } from '../utils/contract';

const InvestProject = () => {
    const [projectId, setProjectId] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = await getLaunchpadContract(signer);

            const tx = await contract.Invest(projectId, {
                value: ethers.utils.parseEther(amount)
            });

            await tx.wait();
            alert('Investment successful!');
        } catch (error) {
            console.error('Error:', error);
            alert('Error making investment');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="container mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold mb-8 text-white">Invest in Project</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Project ID</label>
                            <input
                                type="number"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter project ID"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Investment Amount (MATIC)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter amount to invest"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg
                                 hover:bg-gray-200 transition-colors duration-200"
                    >
                        Invest
                    </button>
                </form>

                <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-white font-semibold mb-2">Important Notes:</h3>
                    <ul className="text-gray-400 space-y-2 list-disc list-inside">
                        <li>Make sure you enter the correct Project ID</li>
                        <li>Investment amount must match the project's fixed investment amount</li>
                        <li>Ensure you have sufficient MATIC in your wallet</li>
                        <li>Investment cannot be undone once confirmed</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InvestProject; 