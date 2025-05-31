import React from "react";
import Navbar from "../components/Navbar";

function Details() {
  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-[var(--color-background-dark)] py-8 text-black dark:text-white justify-center pt-24">
      <div className="w-full max-w-3xl">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Landscape"
          className="w-full h-64 object-cover rounded-xl mb-8"
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-4">The Art of Landscape Photography</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          Landscape photography is the art of capturing the world around you. In this lesson, you'll learn how to create beautiful images that tell a story and evoke emotion. From composition to lighting, post-processing, and more, this lesson covers everything you need to know to take your landscape photography to the next level.
        </p>
        <div className="flex items-center mb-6">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Sean Tucker"
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <div className="text-lg font-semibold">Sean Tucker</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Photographer and Filmmaker</div>
          </div>
        </div>
        <div className="flex items-center mb-6">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mr-4">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
            <span className="ml-2 text-sm text-gray-500">1 hour · 30 min</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {['Photography', 'Art', 'Landscape', 'Camera', 'Lighting'].map((tag) => (
            <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
        <button className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-colors duration-200">
          Request Lesson
        </button>
      </div>
    </div>
    </>
  );
}

export default Details;
