import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import Navbar from "../components/Navbar";
import ProfileContent from "../components/ProfileContent";
import Settings from "../components/Settings";
import Timebank from "../components/Timebank";
import CreateService from "../components/CreateServices";

function Profile() {
    const [selectedPage, setSelectedPage] = useState("Profile");
    const [profileName, setProfileName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const { address } = useAccount();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.showCreateService) {
            setSelectedPage("CreateService");
        }
    }, [location.state]);

    useEffect(() => {
        const fetchprofileName = async () => {
            if (address) {
                try {
                    setIsLoading(true);
                    const profile = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProfile",
                        args: [address],
                    });

                    setProfileName(profile[1]);
                    setIsRegistered(profile[5] || false);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setProfileName("guest");
                    setIsRegistered(false);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchprofileName();
    }, [address]);

    return (
        <>
            <Navbar />
            <section className="pt-14 grid grid-cols-4 bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] min-h-screen">
                {/* Sidebar */}
                <div className="col-span-1 h-full flex flex-col px-6 py-8 space-y-2 border-r border-[var(--color-secondary)] dark:border-gray-700 bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                    <div className="flex items-center space-x-3 mb-6">
                        {/* Replace with actual user avatar */}
                        <img
                            className="w-10 h-10 rounded-full border-2 border-[var(--color-secondary)] dark:border-gray-600"
                            src="https://picsum.photos/40?random=4"
                            alt={`${profileName?.name || "User"}'s Avatar`}
                        />
                        <div>
                            <p className="font-semibold text-[var(--color-primary)] dark:text-white">
                                {isLoading ? (
                                    <span className="animate-pulse">
                                        Loading...
                                    </span>
                                ) : (
                                    profileName || "guest"
                                )}
                            </p>
                            {isRegistered && (
                                <p className="text-xs text-[var(--color-primary)] dark:text-gray-400">
                                    Registered User
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left transition-colors duration-200 ${
                            selectedPage === "Profile"
                                ? "bg-[var(--color-hover)] dark:bg-gray-700 text-[var(--color-primary)] dark:text-white"
                                : "text-[var(--color-primary)] dark:text-gray-300 hover:bg-[var(--color-hover)] dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedPage("Profile")}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c.01 0 .01 0 .02-.01L18 20M6 20l5.98-6.01c.01-.01.01-.01.02-.01z"
                            ></path>
                        </svg>
                        <span>Profile</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left transition-colors duration-200 ${
                            selectedPage === "CreateService"
                                ? "bg-[var(--color-hover)] dark:bg-gray-700 text-[var(--color-primary)] dark:text-white"
                                : "text-[var(--color-primary)] dark:text-gray-300 hover:bg-[var(--color-hover)] dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedPage("CreateService")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6"
                            />
                        </svg>
                        <span>Create Service</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left transition-colors duration-200 ${
                            selectedPage === "Timebank"
                                ? "bg-[var(--color-hover)] dark:bg-gray-700 text-[var(--color-primary)] dark:text-white"
                                : "text-[var(--color-primary)] dark:text-gray-300 hover:bg-[var(--color-hover)] dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedPage("Timebank")}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0v-5m0 5h-5M9 7h1m0 4h1m-1 4h1m8-10h.01M7 16h.01"
                            ></path>
                        </svg>
                        <span>Timebank</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left transition-colors duration-200 ${
                            selectedPage === "Settings"
                                ? "bg-[var(--color-hover)] dark:bg-gray-700 text-[var(--color-primary)] dark:text-white"
                                : "text-[var(--color-primary)] dark:text-gray-300 hover:bg-[var(--color-hover)] dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedPage("Settings")}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            ></path>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                        </svg>
                        <span>Settings</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="col-span-3 h-full px-12 py-8 overflow-auto bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                    {selectedPage === "Profile" && <ProfileContent />}
                    {selectedPage === "CreateService" && <CreateService />}
                    {selectedPage === "Timebank" && <Timebank />}
                    {selectedPage === "Settings" && <Settings />}
                </div>
            </section>
        </>
    );
}

export default Profile;
