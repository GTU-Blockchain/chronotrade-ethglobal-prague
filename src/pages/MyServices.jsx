import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { readContract } from "wagmi/actions";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import { useAccount } from "wagmi";

function MyServices() {
    const navigate = useNavigate();
    const { address } = useAccount();
    const [receivedServices, setReceivedServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(true);
    const [isDark, setIsDark] = useState(
        window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    useEffect(() => {
        const fetchServices = async () => {
            if (!address) return;

            try {
                setIsLoading(true);
                setError(null);
                const [services, purchasedServices] = await readContract(
                    config,
                    {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getReceivedServices",
                        args: [address],
                    }
                );

                // Combine service and purchase data
                const combinedServices = services.map((service, index) => ({
                    ...service,
                    ...purchasedServices[index],
                }));

                setReceivedServices(combinedServices);
                setIsRegistered(true);
            } catch (err) {
                console.error("Error fetching services:", err);
                if (err.message.includes("User not registered")) {
                    setIsRegistered(false);
                } else {
                    setError(
                        "Failed to load services. Please try again later."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, [address]);

    useEffect(() => {
        const matcher = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsDark(e.matches);
        matcher.addEventListener("change", handleChange);
        return () => matcher.removeEventListener("change", handleChange);
    }, []);

    // Helper function to format date
    const formatDate = (timestamp) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString();
    };

    // Filter services based on their active status and ensure they are valid
    const validServices = receivedServices.filter(
        (service) =>
            service && typeof service === "object" && service.id !== undefined
    );

    const completedServices = validServices.filter(
        (service) => service && service.isCompleted
    );

    const upcomingServices = validServices.filter(
        (service) => service && !service.isCompleted
    );

    if (!address) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black pt-16">
                    <h2 className="text-xl font-semibold mb-4">
                        Please connect your wallet to view your services
                    </h2>
                </div>
            </>
        );
    }

    if (!isRegistered) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black pt-16">
                    <div className="text-center max-w-md p-8 space-y-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Account Not Registered
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You need to create a profile before you can view
                            your services.
                        </p>
                        <button
                            onClick={() => navigate("/register")}
                            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)] transition-colors duration-200"
                        >
                            Create Profile
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col justify-center items-center min-h-screen dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black pt-16">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-hover)]"
                    >
                        Retry
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <section className="flex flex-col w-full dark:bg-[var(--color-background-dark)] bg-white min-h-screen pt-16 items-center justify-start">
                <div className="flex flex-col w-full max-w-5xl dark:text-white text-black mt-10 transition-all duration-200">
                    <h2 className="font-bold text-2xl mb-4">
                        Completed Services
                    </h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : completedServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No completed services yet
                        </div>
                    ) : (
                        completedServices.map((service) => (
                            <div
                                key={
                                    service?.id
                                        ? service.id.toString()
                                        : Math.random()
                                }
                                className="flex items-center w-full hover:bg-[var(--color-hover)] p-4 rounded-2xl"
                            >
                                <div className="w-20 h-20 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-5">
                                    <span className="text-lg font-semibold">
                                        {service.seller
                                            ?.slice(0, 2)
                                            ?.toUpperCase() || "NA"}
                                    </span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-semibold">
                                        {service.title || "Untitled Service"}
                                    </p>
                                    <p className="dark:text-white/70 text-black/50">
                                        {service.purchaseTime
                                            ? formatDate(service.purchaseTime)
                                            : "No date"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Duration: {service.durationHours || 0}{" "}
                                        hours
                                    </p>
                                </div>
                                <Link
                                    to={`/comments/${service.id}`}
                                    className="ml-auto flex items-center active:scale-95 transition-all duration-200"
                                >
                                    <img
                                        src={
                                            isDark
                                                ? "../src/assets/message-white.svg"
                                                : "../src/assets/message-black.svg"
                                        }
                                        alt="Comments"
                                        className="w-8 h-8 hover:scale-110 transition-transform duration-150"
                                    />
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col w-full max-w-5xl dark:text-white text-black mt-10 space-y-4">
                    <h3 className="font-bold text-2xl mb-4">
                        Upcoming Services
                    </h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : upcomingServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No upcoming services
                        </div>
                    ) : (
                        upcomingServices.map((service) => (
                            <div
                                key={
                                    service?.id
                                        ? service.id.toString()
                                        : Math.random()
                                }
                                className="flex items-center w-full hover:bg-[var(--color-hover)] p-4 rounded-2xl"
                            >
                                <div className="w-20 h-20 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-5">
                                    <span className="text-lg font-semibold">
                                        {service.seller
                                            ?.slice(0, 2)
                                            ?.toUpperCase() || "NA"}
                                    </span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-semibold">
                                        {service.title || "Untitled Service"}
                                    </p>
                                    <p className="dark:text-white/70 text-black/50">
                                        {service.purchaseTime
                                            ? formatDate(service.purchaseTime)
                                            : "No date"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Duration: {service.durationHours || 0}{" "}
                                        hours
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </>
    );
}

export default MyServices;
