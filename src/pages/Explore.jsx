import React, { useState } from "react";
import Navbar from "../components/Navbar";

function Explore() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

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
         {
            title: "Another Skill",
            description: "This is a description for another skill",
            image: "https://picsum.photos/50?random=3",
        },
         {
            title: "Programming Service",
            description: "Offering programming help",
            image: "https://picsum.photos/50?random=5",
        },
    ];

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    <div>
                         <h2 className="text-2xl font-semibold mb-4">Results</h2>
                        {filteredServices.map((service, index) => (
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
                </section>
            </div>
        </>
    );
}

export default Explore;
