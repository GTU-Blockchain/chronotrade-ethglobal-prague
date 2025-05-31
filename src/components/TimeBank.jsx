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
    <div className="min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-black dark:text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4">TimeBank Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your TIME tokens and service history
        </p>

        {/* Account Summary */}
        <div className="flex justify-between items-start p-6 rounded-lg border border-gray-200 dark:border-gray-600 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Account Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overview of your TIME tokens
            </p>
          </div>
          <img
            src="https://picsum.photos/200"
            alt="Account Summary"
            className="w-32 h-32 rounded-lg object-cover"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-between border-b border-gray-300 mb-6">
          <button
            className={`pb-2 hover:cursor-pointer ${
              activeTab === "provided"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "text-gray-600 dark:text-gray-200 hover:text-black dark:hover:text-white hover:cursor-pointer"
            }`}
            onClick={() => setActiveTab("provided")}
          >
            Services Provided
          </button>
          <button
            className={`pb-2 hover:cursor-pointer ${
              activeTab === "received"
                ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold"
                : "text-gray-600 dark:text-gray-200 hover:text-black dark:hover:text-white hover:cursor-pointer"
            }`}
            onClick={() => setActiveTab("received")}
          >
            Services Received
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-secondary)]">
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
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Date: {service.date} | Duration: {service.duration} | Rating:{" "}
                    {service.rating}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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