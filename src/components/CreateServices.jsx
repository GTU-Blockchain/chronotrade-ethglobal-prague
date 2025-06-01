import React, { useState, useEffect } from "react";
import {
    writeContract,
    waitForTransactionReceipt,
    readContract,
} from "wagmi/actions";
import { useAccount } from "wagmi";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import { useNavigate } from "react-router-dom";
import { openInBlockscout } from "../utils/helpers";

const CreateServices = () => {
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        hours: "",
    });
    const [txHash, setTxHash] = useState(null);

    const categories = [
        "Programming",
        "Design",
        "Mentorship",
        "Illustration",
        "Music",
        "Video Production",
        "Photography",
        "Other",
    ];

    // Check registration status and profile data when address changes
    useEffect(() => {
        const checkUserStatus = async () => {
            if (address) {
                try {
                    setIsCheckingStatus(true);
                    setError(null);

                    // Get full profile data
                    const profile = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProfile",
                        args: [address],
                    });

                    // Check if user has time slots set
                    const hasTimeSlots = profile[8].length > 0; // timeSlotStartHours

                    // Check registration status separately
                    const registered = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "isUserRegistered",
                        args: [address],
                    });

                    if (registered && !hasTimeSlots) {
                        setError("Please set your available time slots first");
                        navigate("/profile");
                    }

                    setIsRegistered(registered);
                } catch (err) {
                    console.error("Error checking user status:", err);
                    setIsRegistered(false);
                    setError("Error checking user status. Please try again.");
                } finally {
                    setIsCheckingStatus(false);
                }
            } else {
                setIsCheckingStatus(false);
            }
        };
        checkUserStatus();
    }, [address]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected || !address) {
            setError("Please connect your wallet to create a service");
            return;
        }

        // Double check profile data before creating service
        try {
            const profile = await readContract(config, {
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "getProfile",
                args: [address],
            });
            console.log("Profile data before service creation:", profile);

            if (!profile[5]) {
                console.log(
                    "Profile shows not registered, redirecting to register page"
                );
                setError("Please register your profile first");
                navigate("/register");
                return;
            }

            if (profile[8].length === 0) {
                // timeSlotStartHours
                console.log("No time slots set, redirecting to profile page");
                setError("Please set your available time slots first");
                navigate("/profile");
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                setTxHash(null);

                const hours = parseInt(formData.hours);
                if (isNaN(hours) || hours <= 0 || hours > 24) {
                    setError("Duration must be between 1 and 24 hours");
                    return;
                }

                if (!formData.category) {
                    setError("Please select a category");
                    return;
                }

                console.log("Creating service with data:", {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    hours: hours,
                    address: address,
                    isRegistered: isRegistered,
                });

                const result = await writeContract(config, {
                    address: chronoTradeAddress,
                    abi: chronoTradeAbi,
                    functionName: "createService",
                    args: [
                        formData.title,
                        formData.description,
                        formData.category,
                        hours,
                    ],
                });

                setTxHash(result);
                await waitForTransactionReceipt(config, {
                    hash: result,
                });

                // Reset form and redirect
                setFormData({
                    title: "",
                    description: "",
                    category: "",
                    hours: "",
                });
                navigate("/profile");
            } catch (err) {
                console.error("Error creating service:", err);
                if (err.message.includes("No time slots set")) {
                    setError("Please set your available time slots first");
                    navigate("/profile");
                } else {
                    setError(
                        err.message ||
                            "Failed to create service. Please try again."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        } catch (err) {
            console.error(
                "Error checking profile before service creation:",
                err
            );
            setError("Error verifying profile status");
            return;
        }
    };

    return (
        <div className="p-3 w-2xl text-black dark:text-white">
            <h1 className="text-3xl font-bold mb-3 text-[var(--color-primary)] dark:text-white">
                List a new service
            </h1>
            <p className="text-sm text-[var(--color-primary)] dark:text-gray-400 mb-6">
                You can list any skill you have, or offer to help with anything.
                Be creative!
            </p>

            {isCheckingStatus ? (
                <div className="flex items-center justify-center p-4 text-[var(--color-primary)] dark:text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mr-2"></div>
                    <span>Checking user status...</span>
                </div>
            ) : (
                <>
                    {!isConnected && (
                        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-200">
                            Please connect your wallet to create a service
                        </div>
                    )}

                    {isConnected && !isRegistered && !isCheckingStatus && (
                        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-200">
                            Please register your profile first
                        </div>
                    )}

                    {error && !isCheckingStatus && (
                        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {txHash && (
                        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-lg">
                            <p className="mb-2">Transaction submitted!</p>
                            <button
                                onClick={() => openInBlockscout(txHash)}
                                className="text-sm underline hover:text-blue-800 dark:hover:text-blue-100 transition-colors cursor-pointer"
                            >
                                View on Blockscout
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-[var(--color-primary)] dark:text-white"
                                htmlFor="title"
                            >
                                Service title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="I will help you with..."
                                className="w-full px-4 py-2 border border-[var(--color-secondary)] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-primary)] dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-[var(--color-primary)] dark:text-white"
                                htmlFor="description"
                            >
                                Service description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your service..."
                                className="w-full px-4 py-2 border border-[var(--color-secondary)] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-primary)] dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                rows="4"
                                disabled={isLoading}
                            ></textarea>
                        </div>
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-[var(--color-primary)] dark:text-white"
                                htmlFor="category"
                            >
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-[var(--color-secondary)] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-primary)] dark:text-white"
                                disabled={isLoading}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-[var(--color-primary)] dark:text-white"
                                htmlFor="hours"
                            >
                                Number of hours (1-24)
                            </label>
                            <input
                                type="number"
                                id="hours"
                                name="hours"
                                required
                                min="1"
                                max="24"
                                value={formData.hours}
                                onChange={handleChange}
                                placeholder="Enter number of hours..."
                                className="w-full px-4 py-2 border border-[var(--color-secondary)] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-primary)] dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 my-5 bg-[var(--color-primary)] text-white rounded-3xl hover:bg-[var(--color-primary)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Service...
                                </div>
                            ) : (
                                "Create Service"
                            )}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default CreateServices;
