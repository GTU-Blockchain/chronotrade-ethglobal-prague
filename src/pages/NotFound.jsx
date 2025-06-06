import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[var(--color-background-dark)] bg-white dark:text-white text-black">
      <h1 className="text-7xl font-extrabold text-[var(--color-primary)] drop-shadow-lg mb-4">
        404
      </h1>
      <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
      <p className="text-lg dark:text-gray-400 text-gray-600 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <a
        href="/"
        className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 transform hover:shadow-xl hover:scale-105"
      >
        Go Home
      </a>
    </div>
  );
};

export default NotFound;
