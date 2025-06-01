import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { readContract } from "wagmi/actions";
import { config, chronoTradeAddress, chronoTradeAbi } from "../config";
import Navbar from "../components/Navbar";

const DAYS_OF_WEEK = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
];

function ViewProfile() {
    const { address } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState([
        { star: "5", percent: 0 },
        { star: "4", percent: 0 },
        { star: "3", percent: 0 },
        { star: "2", percent: 0 },
        { star: "1", percent: 0 },
    ]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            if (address) {
                try {
                    setIsLoading(true);
                    setError(null);

                    // Get user profile
                    const profileData = await readContract(config, {
                        address: chronoTradeAddress,
                        abi: chronoTradeAbi,
                        functionName: "getProfile",
                        args: [address],
                    });

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
                        try {
                            const comments = await readContract(config, {
                                address: chronoTradeAddress,
                                abi: chronoTradeAbi,
                                functionName: "getComments",
                                args: [service.id],
                            });
                            allComments.push(...comments);
                        } catch (err) {
                            // Skip inactive services silently
                            console.log(
                                `Service ${service.id} is inactive or not found, error: ${err}`
                            );
                            continue;
                        }
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

                    setProfile(profileData);
                    setServices(providedServices);
                    setReviews(allComments);
                    setRatingStats(newRatingStats);
                    setAverageRating(average);
                    setTotalReviews(total);
                } catch (err) {
                    console.error("Error fetching profile:", err);
                    setError("Failed to load profile information");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();
    }, [address]);

    // Helper function to format timestamp
    const formatDate = (timestamp) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Helper function to generate star rating display
    const generateStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                    <div className="text-red-600 dark:text-red-400">
                        {error}
                    </div>
                </div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                    <div className="text-gray-600 dark:text-gray-400">
                        Profile not found
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pt-14 min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
                <div className="max-w-4xl mx-auto p-8">
                    {/* Profile Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <img
                                src="https://picsum.photos/100"
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-[var(--color-primary)]"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile[1] || "Anonymous User"}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Services Offered
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="bg-[var(--color-primary)] text-white rounded-full px-4 py-1 text-sm"
                                >
                                    {service.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Availability Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Availability
                        </h2>
                        <div className="space-y-3">
                            {profile[6] && profile[7] && profile[6].map((day, index) => {
                                const timeSlot = profile[7][index];
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

                    {/* Reviews Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Reviews
                        </h2>

                        {/* Rating Overview */}
                        <div className="mb-8">
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
                                <div
                                    key={r.star}
                                    className="flex items-center mb-2"
                                >
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

                        {/* Review List */}
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full mr-4 flex items-center justify-center text-white">
                                            {review.author
                                                .slice(0, 2)
                                                .toUpperCase()}
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
                                    <p className="text-gray-900 dark:text-white">
                                        {review.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ViewProfile;
