import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useReadContract, useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { addDays, isBefore, isAfter, startOfDay, getDay } from 'date-fns';
import { readContract } from "wagmi/actions";
import {
    chronoTradeAddress,
    chronoTradeAbi,
    config,
    timeTokenAddress,
    timeTokenAbi,
} from "../config";
import Navbar from "../components/Navbar";
import { waitForTransactionReceipt } from "wagmi/actions";

const DAYS_OF_WEEK = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
];

function Details() {
    const { id } = useParams();
    const { isConnected } = useAccount();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [sellerAvailability, setSellerAvailability] = useState(null);

    // Write contract hooks
    const { writeContractAsync } = useWriteContract();
    const { writeContractAsync: writeTimeTokenAsync } = useWriteContract();

    // Fetch service and seller details using useReadContract
    const {
        data: serviceData,
        isLoading: isServiceLoading,
        error: serviceError,
    } = useReadContract({
        address: chronoTradeAddress,
        abi: chronoTradeAbi,
        functionName: "getService",
        args: [parseInt(id)],
        enabled: !!id,
    });

    // Fetch seller's availability
    useEffect(() => {
        const fetchSellerAvailability = async () => {
            if (serviceData && serviceData[1]) {
                try {
                    const profileData = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProfile",
                        args: [serviceData[1]],
                    });
                    console.log("Profile Data:", profileData);
                    console.log("Available Days:", profileData[6]);
                    console.log("Time Slots:", profileData[7]);
                    setSellerAvailability({
                        availableDays: profileData[6],
                        timeSlots: profileData[7],
                    });
                } catch (err) {
                    console.error("Error fetching seller availability:", err);
                }
            }
        };

        fetchSellerAvailability();
    }, [serviceData]);

    // Check if a date is available based on seller's schedule
    const isDateAvailable = (date) => {
        if (!sellerAvailability) return false;
        
        const today = startOfDay(new Date());
        const maxDate = addDays(today, 30); // Allow booking up to 30 days in advance
        
        // Check if date is within valid range
        if (isBefore(date, today) || isAfter(date, maxDate)) {
            return false;
        }

        // Get the day of week (0-6, where 0 is Sunday)
        const dayOfWeek = getDay(date);
        // Convert to our format (0-6, where 0 is Monday)
        const ourDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Check if the day is in seller's available days
        return sellerAvailability.availableDays.some(day => Number(day) === ourDayOfWeek);
    };

    // Get available time slots for the selected date
    const getAvailableTimeSlots = () => {
        if (!selectedDate || !sellerAvailability) return null;

        const dayOfWeek = getDay(selectedDate);
        const ourDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        console.log("Getting time slots for day:", ourDayOfWeek);
        console.log("Available days:", sellerAvailability.availableDays);
        
        const dayIndex = sellerAvailability.availableDays.findIndex(day => Number(day) === ourDayOfWeek);
        console.log("Day index:", dayIndex);
        
        if (dayIndex === -1) return null;

        return sellerAvailability.timeSlots[dayIndex];
    };

    // Generate time slots based on the available hours
    const generateTimeSlots = (timeSlot) => {
        if (!timeSlot) return [];
        
        const slots = [];
        const startHour = timeSlot.startHour;
        const endHour = timeSlot.endHour;
        const durationHours = serviceData[0].durationHours;

        for (let hour = startHour; hour <= endHour - durationHours; hour++) {
            slots.push({
                start: hour,
                end: hour + durationHours,
                label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + durationHours).toString().padStart(2, '0')}:00`
            });
        }

        return slots;
    };

    const handleBuyService = async () => {
        if (!isConnected) {
            setError("Please connect your wallet to trade");
            return;
        }

        if (!selectedDate || !selectedTimeSlot) {
            setError("Please select a date and time slot");
            return;
        }

        if (!serviceData || !serviceData[0] || !serviceData[0].isActive) {
            setError("This service is no longer active");
            return;
        }

        if (!id) {
            setError("Invalid service ID");
            return;
        }

        try {
            setError(null);
            setIsProcessing(true);

            // Create timestamp from selected date and time slot
            const selectedDateTime = new Date(selectedDate);
            selectedDateTime.setHours(selectedTimeSlot.start, 0, 0, 0); // Set to start hour of the selected slot
            const scheduledTime = Math.floor(selectedDateTime.getTime() / 1000); // Convert to Unix timestamp

            console.log("Debug values:", {
                id,
                serviceId: Number(id),
                scheduledTime,
                selectedDate: selectedDateTime.toISOString(),
                selectedTimeSlot,
                serviceData: serviceData[0],
            });

            if (isNaN(Number(id))) {
                throw new Error("Invalid service ID");
            }

            if (!chronoTradeAddress) {
                throw new Error("Contract address is not defined");
            }

            // Calculate total price in TIME tokens (1 token per hour)
            const totalPrice =
                BigInt(serviceData[0].durationHours) * BigInt(10 ** 18); // Convert to wei (18 decimals)

            // First approve the ChronoTrade contract to spend TIME tokens
            console.log("Approving TIME tokens...");
            const approveHash = await writeTimeTokenAsync({
                address: timeTokenAddress,
                abi: timeTokenAbi,
                functionName: "approve",
                args: [chronoTradeAddress, totalPrice],
            });

            console.log("Approval transaction hash:", approveHash);
            await waitForTransactionReceipt(config, { hash: approveHash });
            console.log("TIME tokens approved");

            // Now proceed with buying the service
            const args = [Number(id), scheduledTime];
            console.log("Contract call args:", args);

            const hash = await writeContractAsync({
                address: chronoTradeAddress,
                abi: chronoTradeAbi,
                functionName: "buyService",
                args: args.map((arg) => BigInt(arg)),
            });

            console.log("Transaction hash:", hash);

            const tx = await waitForTransactionReceipt(config, {
                hash,
            });

            console.log("Transaction receipt:", tx);

            // Navigate to profile page after successful purchase
            navigate("/profile");
        } catch (err) {
            console.error("Error buying service:", err);
            console.error("Error details:", {
                message: err.message,
                code: err.code,
                data: err.data,
            });
        } finally {
            setIsProcessing(false);
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

    const averageRating =
        sellerRatingCount > 0
            ? (sellerRatingSum / sellerRatingCount).toFixed(1)
            : "No ratings";

    const availableTimeSlot = getAvailableTimeSlots();
    const timeSlots = generateTimeSlots(availableTimeSlot);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center min-h-screen bg-white dark:bg-[var(--color-background-dark)] py-8 text-black dark:text-white justify-center pt-24">
                <div className="w-full max-w-3xl">
                    <div className="w-full h-64 bg-[var(--color-secondary)] rounded-xl mb-8 flex items-center justify-center">
                        <span className="text-6xl font-semibold text-white">
                            {service.title ? service.title.charAt(0) : "?"}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-4">
                        {service.title || "Untitled Service"}
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 mb-8">
                        {service.description || "No description available"}
                    </p>
                    <div className="flex items-center mb-6">
                        <Link
                            to={`/profile/${sellerAddress}`}
                            className="flex items-center hover:opacity-80 transition-opacity"
                        >
                            <div className="w-20 h-20 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mr-4">
                                <span className="text-2xl font-semibold text-white">
                                    {sellerName
                                        ? sellerName.charAt(0).toUpperCase()
                                        : "?"}
                                </span>
                            </div>
                            <div>
                                <div className="text-lg font-semibold">
                                    {sellerName || "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Rating: {averageRating} ({sellerRatingCount}{" "}
                                    reviews)
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
                            <svg
                                className="w-5 h-5 text-gray-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Duration
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                                {service.durationHours || 0} hours
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium">
                            {service.category || "Uncategorized"}
                        </span>
                    </div>

                    {/* Seller Availability Section */}
                    {sellerAvailability && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                Seller's Availability
                            </h2>
                            <div className="space-y-3 mb-6">
                                {sellerAvailability.availableDays.map((day, index) => {
                                    const timeSlot = sellerAvailability.timeSlots[index];
                                    if (!timeSlot) return null;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <span className="text-gray-900 dark:text-white">
                                                {DAYS_OF_WEEK[day].label}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {timeSlot.startHour}:00 - {timeSlot.endHour}:00
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Date and Time Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Select Date and Time
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={(newDate) => {
                                        setSelectedDate(newDate);
                                        setSelectedTimeSlot(null);
                                    }}
                                    shouldDisableDate={(date) => !isDateAvailable(date)}
                                    sx={{
                                        '& .MuiPickersDay-root.Mui-selected': {
                                            backgroundColor: 'var(--color-primary)',
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                            
                            {selectedDate && timeSlots && timeSlots.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                                        Available Time Slots
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {timeSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedTimeSlot(slot)}
                                                className={`p-3 rounded-lg border transition-colors duration-200 ${
                                                    selectedTimeSlot && selectedTimeSlot.start === slot.start
                                                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                            >
                                                {slot.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedDate && (!timeSlots || timeSlots.length === 0) && (
                                <div className="mt-4 text-gray-600 dark:text-gray-400">
                                    No available time slots for this date
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500 text-sm">{error}</div>
                    )}

                    <button
                        className="w-full md:w-auto px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-hover)] text-white rounded-full font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleBuyService}
                        disabled={!isConnected || isProcessing || !selectedDate || !selectedTimeSlot}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            "Trade"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

export default Details;
