import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function Explore() {
    const [selectedPage, setSelectedPage] = useState("Skills");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = [
        "All",
        "Programming",
        "Design",
        "Mentorship",
        "Oil Marketing",
        "Oil Writing",
        "Illustration",
        "Music",
        "Video Production",
        "Photography",
        "Other",
    ];

    const services = [
        {
            title: "Test Title",
            description: "Description for test title",
            image: "https://picsum.photos/50?random=1",
        },
        {
            title: "Test Title 22",
            description: "Description for test title 22",
            image: "https://picsum.photos/50?random=2",
        },
    ];

    return (
            <section className="grid grid-cols-4 dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className="col-span-1 h-full flex flex-col px-6 py-8 space-y-2 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-6">
                         {/* Replace with actual user avatar */}
                        <img className="w-10 h-10 rounded-full" src="https://picsum.photos/40?random=4" alt="User Avatar" />
                        <div>
                            <p className="font-semibold dark:text-white">User Name</p>
                            <Link to="/profile/123" className="text-sm text-slate-600 dark:text-gray-400 hover:underline">View your profile</Link>
                        </div>
                    </div>
                    
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left ${
                            selectedPage === "Profile"
                                ? "bg-[var(--color-secondary)] hover:cursor-pointer"
                                : "hover:bg-[var(--color-hover)] hover:cursor-pointer transition-colors duration-200"
                        }`}
                        onClick={() => setSelectedPage("Profile")}
                    >
                        {/* Replace with actual icon */}
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c.01 0 .01 0 .02-.01L18 20M6 20l5.98-6.01c.01-.01.01-.01.02-.01z"></path></svg>
                        <span>Profile</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left ${
                            selectedPage === "Skills"
                                ? "bg-[var(--color-secondary)] hover:cursor-pointer"
                                : "hover:bg-[var(--color-hover)] hover:cursor-pointer transition-colors duration-200"
                        }`}
                        onClick={() => setSelectedPage("Skills")}
                    >
                         {/* Replace with actual icon */}
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Skills</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left ${
                            selectedPage === "Timebank"
                                ? "bg-[var(--color-secondary)] hover:cursor-pointer"
                                : "hover:bg-[var(--color-hover)] hover:cursor-pointer transition-colors duration-200"
                        }`}
                        onClick={() => setSelectedPage("Timebank")}
                    >
                         {/* Replace with actual icon */}
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m0 0v-5m0 5h-5M9 7h1m0 4h1m-1 4h1m8-10h.01M7 16h.01"></path></svg>
                        <span>Timebank</span>
                    </button>
                    <button
                        className={`flex items-center space-x-3 px-4 py-2 rounded-md w-full text-left ${
                            selectedPage === "Settings"
                                ? "bg-[var(--color-secondary)] hover:cursor-pointer"
                                : "hover:bg-[var(--color-hover)] hover:cursor-pointer transition-colors duration-200"
                        }`}
                        onClick={() => setSelectedPage("Settings")}
                    >
                         {/* Replace with actual icon */}
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Settings</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="col-span-3 h-full px-12 py-8 overflow-auto">
                    <h1 className="text-3xl font-semibold mb-2">Find a Skill</h1>
                    <p className="text-sm dark:text-gray-300 text-gray-700 mb-8">
                        Browse available skills and hours
                    </p>

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

                    {selectedPage === "Skills" && (
                        <div>
                             <h2 className="text-2xl font-semibold mb-4">Results</h2>
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between mb-4 p-4"
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div>
                                            <h3 className="text-lg font-medium">{service.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="px-6 py-2 bg-[var(--color-secondary)] text-gray-700 rounded-full hover:bg-[var(--color-hover)] hover:cursor-pointer"
                                    >
                                        Trade
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
    );
}

export default Explore;
