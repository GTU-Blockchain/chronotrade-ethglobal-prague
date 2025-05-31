import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useCallback } from "react";

function Navbar() {
  const { address, isConnected } = useAccount();
  const location = useLocation();

  // Handler for ChronoTrade click
  const handleHomeClick = useCallback(
    (e) => {
      if (location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById("home");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [location.pathname]
  );

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(0, 0, 0, 0.8)] backdrop-blur-lg border-b border-white/50 shadow-lg h-16">
      <div className="w-full mx-auto px-30">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="font-mono text-xl font-bold dark:text-white text-black mr-10"
              onClick={handleHomeClick}
            >
              Chrono
              <span className="bg-gradient-to-r from-green-500 to-[var(--color-primary)] bg-clip-text text-transparent">
                Trade
              </span>
            </Link>

            <div className="flex items-center space-x-8">
              <Link
                to="/explore"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:-translate-y-0.5 transition-all duration-200 hover:font-bold"
              >
                Explore
              </Link>

              {isConnected && address ? (
                <Link
                  to={`/my-services/${address}`}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:-translate-y-0.5 transition-all duration-200 hover:font-bold"
                >
                  My Services
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed">
                  My Services
                </span>
              )}

              <Link
                to="/chat"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:-translate-y-0.5 transition-all duration-200 hover:font-bold"
              >
                Dummy2
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ConnectButton chainStatus={"none"} accountStatus={"avatar"} />
            {isConnected && address && (
              <Link to="/profile" className="mx-2">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white shadow"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
