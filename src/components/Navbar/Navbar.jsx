import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(0, 0, 0, 0.8)] backdrop-blur-lg border-b border-white/50 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <a
              href="#home"
              className="font-mono text-xl font-bold dark:text-white text-black mr-10"
            >
              Chrono
              <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                Trade
              </span>
            </a>

            <div className="flex items-center space-x-8">
              <Link
                to="/explore"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>

              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dummy
              </Link>

              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dummy2
              </Link>
            </div>
          </div>

          <div>
            <ConnectButton chainStatus={"none"} accountStatus={"avatar"} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
