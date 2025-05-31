import React, { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { useNavigate, Link } from "react-router-dom";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import Navbar from "../components/Navbar";

function Explore() {
    const { isConnected } = useAccount();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const pageSize = 10;

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

    // Fetch services from contract
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [servicesData] = await readContract(
                    config,
                    {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getServicesPaginated",
                        args: [page * pageSize, pageSize],
                    }
                );

                // Filter out inactive services
                const activeServices = servicesData.filter(
                    (service) => service.isActive
                );
                console.log("Fetched services:", activeServices);
                setServices(activeServices);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Failed to load services. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [page]);

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

    return (
        <>
            <Navbar />
            <div className="pt-16 flex flex-col justify-start items-center dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black min-h-screen">
                <section className="w-5xl pt-8 px-12 overflow-auto">
                    {/* Main Content */}
                    <h1 className="text-3xl font-semibold mb-2">
                        Find a Skill
                    </h1>
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

                    {/* Categories */}
                    <div className="flex flex-wrap gap-3 mb-8 text-black dark:text-white">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`px-4 py-2 rounded-xl text-sm ${
                                    selectedCategory === cat
                                        ? "bg-[var(--color-primary)] text-white hover:cursor-pointer"
                                        : "bg-[var(--color-secondary)] text-gray-700 hover:bg-[var(--color-hover)] hover:cursor-pointer transition-all duration-200"
                                }`}
                                onClick={() =>
                                    setSelectedCategory(
                                        selectedCategory === cat ? "All" : cat
                                    )
                                }
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Services List */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Results</h2>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">
                                {error}
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No services found. Try adjusting your search or
                                category.
                            </div>
                        ) : (
                            <>
                                {filteredServices.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-4">
                                                <span className="text-lg font-semibold">
                                                    {service.title.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium">
                                                    {service.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {service.description}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Duration:{" "}
                                                        {service.durationHours}{" "}
                                                        hours
                                                    </span>
                                                    <span className="mx-2 text-gray-300">
                                                        •
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Category:{" "}
                                                        {service.category}
                                                    </span>
                                                    <span className="mx-2 text-gray-300">
                                                        •
                                                    </span>
                                                    <Link
                                                        to={`/profile/${service.seller}`}
                                                        className="text-sm text-[var(--color-primary)] hover:underline"
                                                    >
                                                        View Provider Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)] hover:cursor-pointer transition-colors duration-200"
                                            onClick={() => {
                                                if (!isConnected) {
                                                    alert(
                                                        "Please connect your wallet to trade"
                                                    );
                                                    return;
                                                }
                                                navigate(
                                                    `/service/${service.id}`
                                                );
                                            }}
                                        >
                                            Trade
                                        </button>
                                    </div>
                                ))}

                                {/* Pagination */}
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] disabled:opacity-50"
                                        onClick={() =>
                                            setPage((p) => Math.max(0, p - 1))
                                        }
                                        disabled={page === 0}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] disabled:opacity-50"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={
                                            filteredServices.length < pageSize
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

export default Explore;
