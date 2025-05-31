import React, { useState } from "react";

const TimeBank = () => {
    const [activeTab, setActiveTab] = useState("provided");

    const servicesProvided = [
        {
            title: "Web Development",
            date: "Oct 1, 2023",
            duration: "1.5 hours",
            rating: "★★★★★",
            recipient: "Alex",
        },
        {
            title: "Graphic Design",
            date: "Oct 2, 2023",
            duration: "2 hours",
            rating: "★★★★☆",
            recipient: "Jordan",
        },
    ];

    const servicesReceived = [
        {
            title: "Content Writing",
            date: "Oct 3, 2023",
            duration: "3 hours",
            rating: "★★★★★",
            provider: "Chris",
        },
        {
            title: "SEO Optimization",
            date: "Oct 4, 2023",
            duration: "2.5 hours",
            rating: "★★★★☆",
            provider: "Taylor",
        },
    ];

    const services =
        activeTab === "provided" ? servicesProvided : servicesReceived;

    return (
        <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-primary)] dark:text-white p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-bold mb-4 text-[var(--color-primary)] dark:text-white">
                    TimeBank Dashboard
                </h1>
                <p className="text-[var(--color-primary)] dark:text-gray-400 mb-8">
                    Manage your TIME tokens and service history
                </p>

                {/* Account Summary */}
                <div className="flex justify-between items-start p-6 rounded-lg border border-[var(--color-secondary)] dark:border-gray-700 bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] mb-8 shadow-sm">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--color-primary)] dark:text-white">
                            Account Summary
                        </h2>
                        <p className="text-sm text-[var(--color-primary)] dark:text-gray-400">
                            Overview of your TIME tokens
                        </p>
                    </div>
                    <img
                        src="https://picsum.photos/200"
                        alt="Account Summary"
                        className="w-32 h-32 rounded-lg object-cover border-2 border-[var(--color-secondary)] dark:border-gray-700"
                    />
                </div>

                {/* Tabs */}
                <div className="relative flex gap-4 border-b border-[var(--color-secondary)] dark:border-gray-700 mb-6">
                    <button
                        className={`relative pb-2 transition-all duration-300 ease-in-out ${
                            activeTab === "provided"
                                ? "text-[var(--color-primary)] dark:text-white font-semibold"
                                : "text-[var(--color-primary)] dark:text-gray-400 hover:text-[var(--color-primary)] dark:hover:text-white"
                        }`}
                        onClick={() => setActiveTab("provided")}
                    >
                        Services Provided
                        <span
                            className={`absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] transform transition-transform duration-300 ease-in-out ${
                                activeTab === "provided"
                                    ? "scale-x-100"
                                    : "scale-x-0"
                            }`}
                        />
                    </button>
                    <button
                        className={`relative pb-2 transition-all duration-300 ease-in-out ${
                            activeTab === "received"
                                ? "text-[var(--color-primary)] dark:text-white font-semibold"
                                : "text-[var(--color-primary)] dark:text-gray-400 hover:text-[var(--color-primary)] dark:hover:text-white"
                        }`}
                        onClick={() => setActiveTab("received")}
                    >
                        Services Received
                        <span
                            className={`absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] transform transition-transform duration-300 ease-in-out ${
                                activeTab === "received"
                                    ? "scale-x-100"
                                    : "scale-x-0"
                            }`}
                        />
                    </button>
                </div>

                {/* Services List */}
                <div className="space-y-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] p-4 rounded-lg shadow-sm border border-[var(--color-secondary)] dark:border-gray-700 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-primary)]">
                                    {activeTab === "provided" ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 15l7-7 7 7"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[var(--color-primary)] dark:text-white">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-primary)] dark:text-gray-400">
                                        Date: {service.date} | Duration:{" "}
                                        {service.duration} | Rating:{" "}
                                        <span className="text-[var(--color-primary)]">
                                            {service.rating}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--color-primary)] dark:text-gray-400">
                                {activeTab === "provided"
                                    ? `Recipient: ${service.recipient}`
                                    : `Provider: ${service.provider}`}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimeBank;
