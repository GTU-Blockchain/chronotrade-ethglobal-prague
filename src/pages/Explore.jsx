import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import Navbar from "../components/Navbar";

function Explore() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { address } = useAccount();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await readContract(config, {
                    address: chronoTradeAddress,
                    abi: chronoTradeAbi,
                    functionName: "getAllServices",
                });
                setServices(result);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Failed to load services. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Filter services based on search query and category
    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        "All",
        "Programming",
        "Design",
        "Mentorship",
        "Illustration",
        "Music",
        "Video Production",
        "Photography",
        "Other",
    ];

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)]"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pt-14 flex flex-col jsutify-center items-center dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black min-h-screen">
                <section className="w-5xl pt-8 px-12 overflow-auto">
                    {/* Main Content */}
                    <h1 className="text-3xl font-semibold mb-2">Find a Skill</h1>
                    <p className="text-sm dark:text-gray-300 text-gray-700 mb-6">
                        Browse available skills and hours
                    </p>
                {/* Search Bar */}
                <div className="relative mb-8">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search for skills..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                    {/* Search Bar */}
                     <div className="relative mb-8">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search for skills..."
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Results</h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No services found matching your criteria
                        </div>
                    ) : (
                        filteredServices.map((service) => (
                            <div key={service.id.toString()} className="mb-4">
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-4">
                                            <span className="text-lg font-semibold">
                                                {service.seller
                                                    ?.slice(0, 2)
                                                    ?.toUpperCase() || "NA"}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                {service.title ||
                                                    "Untitled Service"}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {service.description ||
                                                    "No description"}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Duration:{" "}
                                                {service.durationHours || 0}{" "}
                                                hours
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={
                                            !address ||
                                            address === service.seller
                                        }
                                    >
                                        {!address
                                            ? "Connect Wallet"
                                            : address === service.seller
                                            ? "Your Service"
                                            : "Trade"}
                                    </button>
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <Link
                                        to="/details"
                                        className="px-6 py-2 bg-[var(--color-secondary)] text-gray-700 rounded-full hover:bg-[var(--color-hover)] hover:cursor-pointer"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default Explore;
