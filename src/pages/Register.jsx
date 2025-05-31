import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    writeContract,
    waitForTransactionReceipt,
    readContract,
} from "wagmi/actions";
import {
    config,
    chronoTradeAddress,
    chronoTradeAbi,
    timeTokenAddress,
    timeTokenAbi,
} from "../config";
import { useAccount } from "wagmi";
import { flowTestnet } from "viem/chains";
import Navbar from "../components/Navbar";
import { openInBlockscout } from "../utils/helpers";

function Register() {
    const navigate = useNavigate();
    const { address, isConnected, chainId } = useAccount();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState(null);

    // Redirect to home if wallet is disconnected
    useEffect(() => {
        if (!isConnected) {
            navigate("/");
        }
    }, [isConnected, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Double check wallet connection before proceeding
        if (!isConnected || !address) {
            setError("Please connect your wallet first");
            navigate("/");
            return;
        }

        // Check if we're on the correct network
        if (chainId !== flowTestnet.id) {
            setError("Please switch to Flow Testnet");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setTxHash(null);

            const result = await writeContract(config, {
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "registerUser",
                args: [name, bio],
            });

            setTxHash(result);
            await waitForTransactionReceipt(config, {
                hash: result,
            });

            // Redirect to profile page after successful registration
            navigate("/profile");
        } catch (err) {
            console.error("Registration error:", err);
            if (!isConnected) {
                setError(
                    "Wallet disconnected. Please reconnect and try again."
                );
                navigate("/");
            } else if (err.message.includes("network")) {
                setError("Please switch to Flow Testnet");
            } else {
                setError(
                    err.message || "Failed to register. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // If wallet is not connected, don't render the form at all
    if (!isConnected) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black pt-16">
                    <h2 className="text-xl font-semibold mb-4">
                        Please connect your wallet to register
                    </h2>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)]"
                    >
                        Go to Home
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black pt-16">
                <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">
                            Create Your Profile
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Register to start trading your time
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {txHash && (
                        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-lg">
                            <p className="mb-2">Registration submitted!</p>
                            <button
                                onClick={() => openInBlockscout(txHash)}
                                className="text-sm underline hover:text-blue-800 dark:hover:text-blue-100 transition-colors"
                            >
                                View on Blockscout
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Display Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                placeholder="Enter your name"
                                disabled={!isConnected || isLoading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                required
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="4"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                placeholder="Tell us about yourself"
                                disabled={!isConnected || isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!isConnected || isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Registering...
                                </div>
                            ) : !isConnected ? (
                                "Connect Wallet to Register"
                            ) : (
                                "Register"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;
