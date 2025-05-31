import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { ReactTyped } from "react-typed";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import { useNavigate } from "react-router-dom";

function Home() {
    const { isConnected } = useAccount();
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]); // Store all services for trending
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("latest"); // "latest" or "trending"
    const [serviceDetails, setServiceDetails] = useState({}); // Store additional service details
    const [sellerProfiles, setSellerProfiles] = useState({});
    const navigate = useNavigate();
    const [aiInput, setAiInput] = useState("");

    // Fetch all services and their details
    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch all active services
                const allServicesData = await readContract(config, {
                    address: chronoTradeAddress,
                    abi: chronoTradeAbi,
                    functionName: "getAllServices",
                });

                setAllServices(allServicesData);

                // Get unique seller addresses
                const uniqueSellers = [
                    ...new Set(
                        allServicesData.map((service) => service.seller)
                    ),
                ];

                // Fetch profiles for all unique sellers
                const profiles = {};
                for (const sellerAddress of uniqueSellers) {
                    try {
                        const profile = await readContract(config, {
                            address: chronoTradeAddress,
                            abi: chronoTradeAbi,
                            functionName: "getProfile",
                            args: [sellerAddress],
                        });
                        profiles[sellerAddress] = profile;
                    } catch (err) {
                        console.error(
                            `Error fetching profile for ${sellerAddress}:`,
                            err
                        );
                    }
                }
                setSellerProfiles(profiles);

                // Fetch service details
                const details = {};
                for (const service of allServicesData) {
                    try {
                        const comments = await readContract(config, {
                            address: chronoTradeAddress,
                            abi: chronoTradeAbi,
                            functionName: "getComments",
                            args: [service.id],
                        });

                        details[service.id] = {
                            ...service,
                            commentCount: comments.length,
                            averageRating:
                                comments.length > 0
                                    ? comments.reduce(
                                          (acc, comment) =>
                                              acc + Number(comment.rating),
                                          0
                                      ) / comments.length
                                    : 0,
                        };
                    } catch (err) {
                        console.error(
                            `Error fetching details for service ${service.id}:`,
                            err
                        );
                    }
                }

                setServiceDetails(details);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Failed to load services");
            } finally {
                setIsLoading(false);
            }
        };

        if (isConnected) {
            fetchAllServices();
        }
    }, [isConnected]);

    // Update displayed services when tab changes or data updates
    useEffect(() => {
        if (allServices.length === 0) return;

        let sortedServices;
        if (activeTab === "latest") {
            // Sort by service ID (newest first) - convert BigInt to Number
            sortedServices = [...allServices].sort(
                (a, b) => Number(b.id) - Number(a.id)
            );
        } else {
            // Sort by trending score (combination of ratings and comment count)
            sortedServices = [...allServices].sort((a, b) => {
                const aDetails = serviceDetails[a.id] || {
                    averageRating: 0,
                    commentCount: 0,
                };
                const bDetails = serviceDetails[b.id] || {
                    averageRating: 0,
                    commentCount: 0,
                };

                // Calculate trending score (weighted average of rating and comment count)
                const aScore =
                    Number(aDetails.averageRating) * 0.7 +
                    Number(aDetails.commentCount) * 0.3;
                const bScore =
                    Number(bDetails.averageRating) * 0.7 +
                    Number(bDetails.commentCount) * 0.3;

                return bScore - aScore;
            });
        }

        // Take only the first 8 services
        setServices(sortedServices.slice(0, 8));
    }, [activeTab, allServices, serviceDetails]);

    // Helper function to get initials from name
    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper function to get seller name
    const getSellerName = (address) => {
        const profile = sellerProfiles[address];
        return profile ? profile[1] : "Unknown Seller"; // profile[1] is the name field
    };

    // Helper function to get service rating
    const getServiceRating = (serviceId) => {
        const details = serviceDetails[serviceId];
        if (!details) return { rating: 0, count: 0 };
        return {
            rating: Number(details.averageRating).toFixed(1),
            count: Number(details.commentCount),
        };
    };

    const handleAiSubmit = (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;
        navigate("/chat", { state: { initialMessage: aiInput } });
    };

    return (
        <main
            id="home"
            className="min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-black dark:text-white flex flex-col items-center justify-center"
        >
            <Navbar />
            <section className="w-full min-h-screen flex flex-col items-center justify-center text-center">
                <h1 className="text-5xl font-bold mb-4">
                    Welcome to{" "}
                    <span className="relative group">
                        <span
                            className="text-black dark:text-white"
                            style={{
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            Chrono
                            <span className="bg-gradient-to-r from-green-500 to-[var(--color-primary)] bg-clip-text text-transparent">
                                Trade
                            </span>
                        </span>
                        <span
                            className="absolute left-0 right-0 bottom-0 h-1 pointer-events-none transition-transform duration-200 group-hover:-rotate-1"
                            style={{
                                background:
                                    "linear-gradient(90deg, #22c55e 0%, var(--color-primary) 100%)",
                                borderRadius: "4px",
                                zIndex: 0,
                                transformOrigin: "center bottom",
                            }}
                        />
                    </span>
                </h1>
                <p className="text-lg mb-8">
                    <ReactTyped
                        className="text-xl font-semibold text-center text-black/50 dark:text-white/50"
                        strings={[
                            "Trade Your Time, Earn Value",
                            "AI-Powered Service Exchange",
                            "Decentralized Time Marketplace",
                            "Empowering Users with Blockchain",
                            "Get and Offer Services Seamlessly",
                        ]}
                        typeSpeed={40}
                        backSpeed={50}
                        loop
                    />
                </p>

                <form onSubmit={handleAiSubmit}>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Ask AI Assistant"
                                className="p-2 rounded-2xl border-slate-400 border-2 bg-gray-200 dark:bg-gray-700 dark:text-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-500 w-2xl px-4 py-3 pl-10"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <line
                                        x1="21"
                                        y1="21"
                                        x2="16.65"
                                        y2="16.65"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="transition-colors duration-200 bg-gradient-to-r from-[var(--color-primary)] to-lime-400 bg-[length:200%_200%] bg-left hover:bg-right text-white px-6 py-3 rounded-2xl border-2 border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer"
                            style={{
                                backgroundSize: "200% 200%",
                                backgroundPosition: "left",
                                transition: "background-position 0.5s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundPosition = "right")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundPosition = "left")
                            }
                        >
                            Ask
                        </button>
                    </div>
                </form>
            </section>

            <section className="h-screen flex flex-col items-start w-5xl pt-10 mx-auto">
                <div className="flex flex-col items-start mb-4">
                    <h3 className="text-center font-bold text-xl">
                        Latest Services
                    </h3>
                    <div className="flex flex-row items-start justify-center space-x-4 mt-4 w-full">
                        <button
                            onClick={() => setActiveTab("latest")}
                            className={`text-center rounded-full font-semibold py-2 px-4 transition-colors duration-200 ${
                                activeTab === "latest"
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`text-center rounded-full font-semibold py-2 px-4 transition-colors duration-200 ${
                                activeTab === "trending"
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            Trending
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="w-full flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : error ? (
                    <div className="w-full text-center text-red-600 py-10">
                        {error}
                    </div>
                ) : services.length === 0 ? (
                    <div className="w-full text-center text-gray-500 py-10">
                        No services available
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                        {services.map((service, i) => {
                            const { rating, count } = getServiceRating(
                                service.id
                            );
                            return (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/service/${service.id}`)}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-gray-700/30 transition-all duration-200 hover:scale-[1.01] min-h-[280px] flex flex-col border border-gray-200 dark:border-gray-700 cursor-pointer"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white mr-3">
                                            {getInitials(
                                                getSellerName(service.seller)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                {getSellerName(service.seller)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {service.category}
                                            </p>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
                                        {service.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-grow">
                                        {service.description.length > 100
                                            ? `${service.description.slice(
                                                  0,
                                                  100
                                              )}...`
                                            : service.description}
                                    </p>
                                    <div className="space-y-2 mt-auto">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {service.durationHours} hour
                                                {service.durationHours !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                            <span className="text-sm font-medium text-[var(--color-primary)]">
                                                {service.durationHours} TIME
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span className="text-[var(--color-primary)] mr-1">
                                                ★
                                            </span>
                                            <span className="font-medium mr-1 text-gray-900 dark:text-white">
                                                {rating}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                ({count} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;
