import { useState } from 'react';
import { ethers } from 'ethers';
import { getLaunchpadContract } from '../utils/contract';

const CreateProject = () => {
    const [formData, setFormData] = useState({
        symbol: '',
        initialSupply: '',
        name: '',
        description: '',
        goal: '',
        fixedInvest: '',
        startTime: '',
        endTime: '',
        minimumPay: '',
        sendingTokensToSender: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = await getLaunchpadContract(signer);

            const tx = await contract.createProject(
                formData.symbol,
                ethers.utils.parseEther(formData.initialSupply),
                formData.name,
                formData.description,
                ethers.utils.parseEther(formData.goal),
                ethers.utils.parseEther(formData.fixedInvest),
                Math.floor(new Date(formData.startTime).getTime() / 1000),
                Math.floor(new Date(formData.endTime).getTime() / 1000),
                ethers.utils.parseEther(formData.minimumPay),
                ethers.utils.parseEther(formData.sendingTokensToSender)
            );

            await tx.wait();
            alert('Project created successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating project');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="container mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold mb-8 text-white">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Project Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter project name"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Symbol</label>
                            <input
                                type="text"
                                name="symbol"
                                value={formData.symbol}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter token symbol"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter project description"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Initial Supply</label>
                            <input
                                type="number"
                                name="initialSupply"
                                value={formData.initialSupply}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter initial supply"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Goal (in MATIC)</label>
                            <input
                                type="number"
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter funding goal"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Fixed Investment (in MATIC)</label>
                            <input
                                type="number"
                                name="fixedInvest"
                                value={formData.fixedInvest}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter fixed investment amount"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Minimum Pay (in MATIC)</label>
                            <input
                                type="number"
                                name="minimumPay"
                                value={formData.minimumPay}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter minimum payment"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Tokens to Sender</label>
                            <input
                                type="number"
                                name="sendingTokensToSender"
                                value={formData.sendingTokensToSender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                placeholder="Enter tokens to sender"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                             text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                             text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg
                                 hover:bg-gray-200 transition-colors duration-200"
                    >
                        Create Project
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;