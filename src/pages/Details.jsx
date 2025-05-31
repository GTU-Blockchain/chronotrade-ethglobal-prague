import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useReadContract, useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import { chronoTradeAddress, chronoTradeAbi } from "../config";
import Navbar from "../components/Navbar";

function Details() {
  const { id } = useParams();
  const { isConnected } = useAccount();

  // Fetch service and seller details using useReadContract
  const { 
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError
  } = useReadContract({
    address: chronoTradeAddress,
    abi: chronoTradeAbi,
    functionName: "getService",
    args: [parseInt(id)],
    enabled: !!id
  });

  // Write contract hook for buyService
  const { writeContract, isPending, isError, error: writeError } = useWriteContract();

  // Log the raw service data
  useEffect(() => {
    console.log("Raw Service Data:", serviceData);
    if (serviceData) {
      console.log("Service:", serviceData[0]);
      console.log("Seller:", serviceData[1]);
      console.log("Seller Name:", serviceData[2]);
      console.log("Seller Description:", serviceData[3]);
      console.log("Seller Rating Sum:", serviceData[4]);
      console.log("Seller Rating Count:", serviceData[5]);
    }
  }, [serviceData]);

  const handleBuyService = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to trade");
      return;
    }

    try {
      // Get current timestamp and add 1 hour for scheduling
      const scheduledTime = Math.floor(Date.now() / 1000) + 3600; // Current time + 1 hour

      await writeContract({
        address: chronoTradeAddress,
        abi: chronoTradeAbi,
        functionName: "buyService",
        args: [parseInt(id), BigInt(scheduledTime)],
      });
    } catch (err) {
      console.error("Error buying service:", err);
      setError(err.message);
    }
  };

  if (isServiceLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[var(--color-background-dark)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </>
    );
  }

  if (serviceError || !serviceData) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-red-500">
          {serviceError?.message || "Service not found"}
        </div>
      </>
    );
  }

  // Parse service and seller data
  const service = serviceData[0];
  const sellerAddress = serviceData[1];
  const sellerName = serviceData[2];
  const sellerDescription = serviceData[3];
  const sellerRatingSum = Number(serviceData[4]);
  const sellerRatingCount = Number(serviceData[5]);

  const averageRating = sellerRatingCount > 0 
    ? (sellerRatingSum / sellerRatingCount).toFixed(1)
    : "No ratings";

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen bg-white dark:bg-[var(--color-background-dark)] py-8 text-black dark:text-white justify-center pt-24">
        <div className="w-full max-w-3xl">
          <div className="w-full h-64 bg-[var(--color-secondary)] rounded-xl mb-8 flex items-center justify-center">
            <span className="text-6xl font-semibold text-white">
              {service.title ? service.title.charAt(0) : '?'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{service.title || 'Untitled Service'}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            {service.description || 'No description available'}
          </p>
          <div className="flex items-center mb-6">
            <Link
              to={`/profile/${sellerAddress}`}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-4">
                <span className="text-2xl font-semibold text-white">
                  {sellerName ? sellerName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <div className="text-lg font-semibold">{sellerName || 'Unknown User'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Rating: {averageRating} ({sellerRatingCount} reviews)
                </div>
                {sellerDescription && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {sellerDescription}
                  </div>
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center mb-6">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mr-4">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
              <span className="ml-2 text-sm text-gray-500">{service.durationHours || 0} hours</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium">
              {service.category || 'Uncategorized'}
            </span>
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button 
            className="w-full md:w-auto px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-hover)] text-white rounded-full font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleBuyService}
            disabled={!isConnected || isPending}
          >
            {isPending ? "Processing..." : "Trade"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Details;
