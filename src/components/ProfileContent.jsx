import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    readContract,
    writeContract,
    waitForTransactionReceipt,
} from "wagmi/actions";
import {
    config,
    timeTokenAddress,
    timeTokenAbi,
    chronoTradeAddress,
    chronoTradeAbi,
} from "../config";
import { openInBlockscout } from "../utils/helpers";

const DAYS_OF_WEEK = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
];

const ProfileContent = () => {
    const { address, isConnected } = useAccount();
    const [walletInfo, setWalletInfo] = useState({
        address: "",
        timeTokens: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isUpdatingSlots, setIsUpdatingSlots] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");

    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [reviewError, setReviewError] = useState(null);
    const [ratingStats, setRatingStats] = useState([
        { star: "5", percent: 0 },
        { star: "4", percent: 0 },
        { star: "3", percent: 0 },
        { star: "2", percent: 0 },
        { star: "1", percent: 0 },
    ]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const [txHash, setTxHash] = useState(null);

    const [providedServices, setProvidedServices] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [serviceError, setServiceError] = useState(null);
    const [cancelTxHash, setCancelTxHash] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Fetch wallet information when address changes
    useEffect(() => {
        const fetchWalletInfo = async () => {
            if (address && isConnected) {
                try {
                    setIsLoading(true);
                    setError(null);

                    // Get TIME token balance
                    const balance = await readContract(config, {
                        address: timeTokenAddress,
                        abi: timeTokenAbi,
                        functionName: "balanceOf",
                        args: [address],
                    });

                    // Convert balance from wei to tokens (assuming 18 decimals)
                    const tokenBalance = Number(balance) / 10 ** 18;

                    setWalletInfo({
                        address: address,
                        timeTokens: tokenBalance,
                    });
                } catch (err) {
                    console.error("Error fetching wallet info:", err);
                    setError("Failed to load wallet information");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setWalletInfo({
                    address: "",
                    timeTokens: 0,
                });
                setIsLoading(false);
            }
        };

        fetchWalletInfo();
    }, [address, isConnected]);

    // Load existing time slots when component mounts
    useEffect(() => {
        const loadTimeSlots = async () => {
            if (address && isConnected) {
                try {
                    const profile = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProfile",
                        args: [address],
                    });

                    // Convert contract time slots to our format
                    const availableDays = profile[6]; // DayOfWeek[] array
                    const timeSlots = profile[7]; // TimeSlot[] array

                    const slots = [];
                    for (let i = 0; i < availableDays.length; i++) {
                        const day = availableDays[i];
                        const slot = timeSlots[i];
                        slots.push({
                            day: day,
                            startTime: `${slot.startHour}:00`,
                            endTime: `${slot.endHour}:00`,
                        });
                    }
                    setAvailability(slots);
                } catch (err) {
                    console.error("Error loading time slots:", err);
                }
            }
        };
        loadTimeSlots();
    }, [address, isConnected]);

    // Fetch user's services and their comments
    useEffect(() => {
        const fetchUserReviews = async () => {
            if (address && isConnected) {
                try {
                    setIsLoadingReviews(true);
                    setReviewError(null);

                    // Get user's provided services
                    const providedServices = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProvidedServices",
                        args: [address],
                    });

                    // Fetch comments for each service
                    const allComments = [];
                    for (const service of providedServices) {
                        const comments = await readContract(config, {
                            address: chronoTradeAddress,
                            abi: chronoTradeAbi,
                            functionName: "getComments",
                            args: [service.id],
                        });
                        allComments.push(...comments);
                    }

                    // Sort comments by timestamp (newest first)
                    allComments.sort(
                        (a, b) => Number(b.timestamp) - Number(a.timestamp)
                    );

                    // Calculate rating statistics
                    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    let totalRating = 0;

                    allComments.forEach((comment) => {
                        const rating = Number(comment.rating);
                        ratingCounts[rating]++;
                        totalRating += rating;
                    });

                    const total = allComments.length;
                    const average = total > 0 ? totalRating / total : 0;

                    // Update rating stats
                    const newRatingStats = Object.entries(ratingCounts)
                        .map(([star, count]) => ({
                            star,
                            percent:
                                total > 0
                                    ? Math.round((count / total) * 100)
                                    : 0,
                        }))
                        .reverse();

                    setReviews(allComments);
                    setRatingStats(newRatingStats);
                    setAverageRating(average);
                    setTotalReviews(total);
                } catch (err) {
                    console.error("Error fetching reviews:", err);
                    // Only set error for actual errors, not for empty reviews
                    if (!err.message?.includes("no reviews")) {
                        setReviewError("Failed to load reviews");
                    }
                } finally {
                    setIsLoadingReviews(false);
                }
            }
        };

        fetchUserReviews();
    }, [address, isConnected]);

    // Fetch user's provided services
    useEffect(() => {
        const fetchProvidedServices = async () => {
            if (address && isConnected) {
                try {
                    setIsLoadingServices(true);
                    setServiceError(null);

                    const services = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProvidedServices",
                        args: [address],
                    });

                    // Filter services to only show active ones where the current user is the provider
                    const userServices = services.filter(
                        (service) =>
                            service.seller.toLowerCase() ===
                                address.toLowerCase() && service.isActive
                    );

                    setProvidedServices(userServices);
                } catch (err) {
                    console.error("Error fetching provided services:", err);
                    // Only set error for actual errors, not for empty services
                    if (!err.message?.includes("no services")) {
                        setServiceError("Failed to load services");
                    }
                } finally {
                    setIsLoadingServices(false);
                }
            }
        };

        fetchProvidedServices();
    }, [address, isConnected]);

    // Helper function to convert time string to hour (0-23)
    const timeToHour = (timeStr) => {
        const [hours] = timeStr.split(":").map(Number);
        return hours;
    };

    const handleDayChange = (dayValue) => {
        setSelectedDays((prev) => {
            if (prev.includes(dayValue)) {
                return prev.filter((d) => d !== dayValue);
            } else {
                return [...prev, dayValue].sort((a, b) => a - b);
            }
        });
    };

    const handleAddAvailability = async () => {
        if (
            selectedDays.length === 0 ||
            !selectedStartTime ||
            !selectedEndTime
        ) {
            setUpdateError(
                "Please select at least one day and set start/end times"
            );
            return;
        }

        const startHour = timeToHour(selectedStartTime);
        const endHour = timeToHour(selectedEndTime);

        if (startHour >= endHour) {
            setUpdateError("End time must be after start time");
            return;
        }

        // Check for overlapping slots for each selected day
        for (const day of selectedDays) {
            const hasOverlap = availability.some(
                (slot) =>
                    slot.day === day &&
                    ((startHour >= timeToHour(slot.startTime) &&
                        startHour < timeToHour(slot.endTime)) ||
                        (endHour > timeToHour(slot.startTime) &&
                            endHour <= timeToHour(slot.endTime)))
            );

            if (hasOverlap) {
                setUpdateError(
                    `Time slot overlaps with an existing slot on ${DAYS_OF_WEEK[day].label}`
                );
                return;
            }
        }

        try {
            setIsUpdatingSlots(true);
            setUpdateError(null);
            setTxHash(null);

            // Create new slots for each selected day
            const newSlots = selectedDays.map((day) => ({
                day: day,
                startTime: selectedStartTime,
                endTime: selectedEndTime,
            }));

            // Prepare data for contract
            const allSlots = [...availability, ...newSlots];
            const availableDays = [...new Set(allSlots.map((s) => s.day))];
            const timeSlots = allSlots.map((slot) => ({
                startHour: timeToHour(slot.startTime),
                endHour: timeToHour(slot.endTime),
            }));

            // Call contract
            const result = await writeContract(config, {
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "updateTimeSlots",
                args: [availableDays, timeSlots],
            });

            setTxHash(result);
            await waitForTransactionReceipt(config, {
                hash: result,
            });

            // Update local state
            setAvailability(allSlots);
            setSelectedDays([]);
            setSelectedStartTime("");
            setSelectedEndTime("");
        } catch (err) {
            console.error("Error updating time slots:", err);
            setUpdateError(err.message || "Failed to update time slots");
        } finally {
            setIsUpdatingSlots(false);
        }
    };

    const handleRemoveAvailability = async (index) => {
        try {
            setIsUpdatingSlots(true);
            setUpdateError(null);

            // Remove the slot from local state
            const updatedSlots = availability.filter((_, i) => i !== index);

            // Prepare data for contract
            const availableDays = [...new Set(updatedSlots.map((s) => s.day))];
            const timeSlots = updatedSlots.map((slot) => ({
                startHour: timeToHour(slot.startTime),
                endHour: timeToHour(slot.endTime),
            }));

            // Call contract
            const result = await writeContract(config, {
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "updateTimeSlots",
                args: [availableDays, timeSlots],
            });

            await waitForTransactionReceipt(config, {
                hash: result,
            });

            setAvailability(updatedSlots);
        } catch (err) {
            console.error("Error removing time slot:", err);
            setUpdateError(err.message || "Failed to remove time slot");
        } finally {
            setIsUpdatingSlots(false);
        }
    };

    const handleCancelService = async (serviceId) => {
        try {
            setIsCancelling(true);
            setServiceError(null);
            setCancelTxHash(null);

            // First check if the user is the provider of this service
            const service = providedServices.find(
                (s) => s.id.toString() == serviceId.toString()
            );
            if (!service) {
                throw new Error("Service not found");
            }

            if (service.seller.toLowerCase() != address.toLowerCase()) {
                throw new Error(
                    "You can only cancel services that you provide"
                );
            }

            const result = await writeContract(config, {
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "cancelService",
                args: [service.id, "Cancelled by service provider"],
            });

            setCancelTxHash(result);
            await waitForTransactionReceipt(config, {
                hash: result,
            });

            // Update the services list after cancellation
            setProvidedServices((prevServices) =>
                prevServices.filter(
                    (service) => service.id.toString() !== serviceId.toString()
                )
            );
        } catch (err) {
            console.error("Error cancelling service:", err);
            setServiceError(err.message || "Failed to cancel service");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="p-6 text-black dark:text-white">
            {/* Wallet Section */}
            <div className="mb-10 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Wallet Information
                </h2>
                {isLoading ? (
                    <div className="flex items-center text-gray-900 dark:text-white">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                        Loading wallet information...
                    </div>
                ) : error ? (
                    <div className="text-red-600 dark:text-red-400">
                        {error}
                    </div>
                ) : !isConnected ? (
                    <div className="text-gray-600 dark:text-gray-400">
                        Please connect your wallet
                    </div>
                ) : (
                    <>
                        <p className="text-sm mb-1 text-gray-900 dark:text-white">
                            <span className="font-medium">Address:</span>{" "}
                            {walletInfo.address.slice(0, 6)}...
                            {walletInfo.address.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">Time Tokens:</span>{" "}
                            {walletInfo.timeTokens.toFixed(2)} TIME
                        </p>
                    </>
                )}
            </div>

            {/* Services Section */}
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                Service and Skills
            </h2>
            {serviceError && providedServices.length > 0 && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-200 rounded-lg">
                    {serviceError}
                </div>
            )}
            {cancelTxHash && (
                <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-lg">
                    <p className="mb-2">Service cancellation submitted!</p>
                    <button
                        onClick={() => openInBlockscout(cancelTxHash)}
                        className="text-sm underline hover:text-blue-800 dark:hover:text-blue-100 transition-colors cursor-pointer"
                    >
                        View on Blockscout
                    </button>
                </div>
            )}
            {isLoadingServices ? (
                <div className="flex items-center justify-center p-4 text-gray-900 dark:text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mr-2"></div>
                    <span>Loading services...</span>
                </div>
            ) : providedServices.length === 0 ? (
                <div className="p-6 my-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        You haven't created any services yet.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Create a service to start offering your time and skills
                        to others.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
                    {providedServices.map((service) => (
                        <div
                            key={service.id.toString()}
                            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-shadow duration-300"
                        >
                            {service.seller.toLowerCase() ==
                                address.toLowerCase() && (
                                <button
                                    onClick={() =>
                                        handleCancelService(service.id)
                                    }
                                    disabled={isCancelling}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Cancel Service"
                                >
                                    ×
                                </button>
                            )}
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white pr-8">
                                {service.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {service.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-[var(--color-primary)] text-white text-xs rounded-full">
                                    {service.category}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                    {service.durationHours} hours
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Availability Section */}
            <div className="mb-14">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Availability
                </h2>
                {updateError && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-200 rounded-lg">
                        {updateError}
                    </div>
                )}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                            Available Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleDayChange(value)}
                                    disabled={isUpdatingSlots}
                                    className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                                        selectedDays.includes(value)
                                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <select
                            value={selectedStartTime}
                            onChange={(e) =>
                                setSelectedStartTime(e.target.value)
                            }
                            className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={isUpdatingSlots}
                        >
                            <option value="">Start Time</option>
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={`${i}:00`}>
                                    {`${i.toString().padStart(2, "0")}:00`}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedEndTime}
                            onChange={(e) => setSelectedEndTime(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={isUpdatingSlots}
                        >
                            <option value="">End Time</option>
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = i + 1;
                                const timeValue = `${hour}:00`;
                                const isDisabled =
                                    selectedStartTime &&
                                    timeToHour(timeValue) <=
                                        timeToHour(selectedStartTime);
                                return (
                                    <option
                                        key={i}
                                        value={timeValue}
                                        disabled={isDisabled}
                                    >
                                        {`${hour
                                            .toString()
                                            .padStart(2, "0")}:00`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button
                        onClick={handleAddAvailability}
                        disabled={isUpdatingSlots || selectedDays.length === 0}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdatingSlots ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                            </div>
                        ) : (
                            "Add Time Slots"
                        )}
                    </button>
                </div>
                {availability.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            Selected Availability
                        </h3>
                        <ul className="space-y-3">
                            {availability.map((slot, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <span>
                                        {DAYS_OF_WEEK[slot.day].label} from{" "}
                                        {slot.startTime} to {slot.endTime}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleRemoveAvailability(index)
                                        }
                                        disabled={isUpdatingSlots}
                                        className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-2xl hover:cursor-pointer duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {txHash && (
                    <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-lg">
                        <p className="mb-2">Time slots update submitted!</p>
                        <button
                            onClick={() => openInBlockscout(txHash)}
                            className="text-sm underline hover:text-blue-800 dark:hover:text-blue-100 transition-colors cursor-pointer"
                        >
                            View on Blockscout
                        </button>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Comments and Reviews
            </h2>

            {isLoadingReviews ? (
                <div className="flex items-center justify-center p-4 text-gray-900 dark:text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    <span className="ml-2">Loading reviews...</span>
                </div>
            ) : reviewError && reviews.length > 0 ? (
                <div className="text-red-600 dark:text-red-400 p-4">
                    {reviewError}
                </div>
            ) : reviews.length === 0 ? (
                <div className="p-6 my-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        No reviews yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Reviews will appear here once users rate your services.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full mr-4 flex items-center justify-center text-white">
                                    {review.author.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {review.author.slice(0, 6)}...
                                        {review.author.slice(-4)}
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {formatDate(review.timestamp)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[var(--color-primary)] text-lg mb-1">
                                {generateStars(review.rating)}
                            </p>
                            <p className="mb-2 text-gray-900 dark:text-white">
                                {review.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Rating Overview - Only show if there are reviews */}
            {reviews.length > 0 && (
                <div className="mt-10 mb-10">
                    <div className="flex items-center gap-2 text-4xl font-bold text-gray-900 dark:text-white">
                        {averageRating.toFixed(1)}
                        <span className="text-2xl font-normal text-[var(--color-primary)]">
                            {generateStars(Math.round(averageRating))}
                        </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-md mb-3">
                        {totalReviews} reviews
                    </div>

                    {ratingStats.map((r) => (
                        <div key={r.star} className="flex items-center mb-2">
                            <span className="w-5 text-gray-900 dark:text-white">
                                {r.star}
                            </span>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded h-2 w-80 mx-2 overflow-hidden">
                                <div
                                    className="bg-[var(--color-primary)] h-2"
                                    style={{ width: `${r.percent}%` }}
                                />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-md mx-2">
                                {r.percent}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileContent;
