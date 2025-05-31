import Navbar from "../components/Navbar";
import { data } from "../assets/temp";
import { ReactTyped } from "react-typed";

function Home() {
  return (
    <main
      id="home"
      className="min-h-screen bg-white dark:bg-[var(--color-background-dark)] text-black dark:text-white flex flex-col items-center justify-center "
    >
      <Navbar />
      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to{" "}
          <span className="relative group">
            <span
              className="text-black dark:text-white"
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              Chrono
              <span className="bg-gradient-to-r from-green-500 to-[var(--color-primary)] bg-clip-text text-transparent ">
                Trade
              </span>
            </span>
            <span
              className="absolute left-0 right-0 bottom-0 h-1 pointer-events-none transition-transform duration-200 group-hover:-rotate-1"
              style={{
                background:
                  "linear-gradient(90deg, #22c55e 0%, var(--color-primary) 100%)",
                borderRadius: "4px",
                zIndex: 0,
                transformOrigin: "center bottom",
              }}
            />
          </span>
        </h1>
        <p className="text-lg mb-8">
          <ReactTyped
            className="text-xl font-semibold text-center text-black/50 dark:text-white/50"
            strings={[
              "Trade Your Time, Earn Value",
              "AI-Powered Service Exchange",
              "Decentralized Time Marketplace",
              "Empowering Users with Blockchain",
              "Get and Offer Services Seamlessly",
            ]}
            typeSpeed={40}
            backSpeed={50}
            loop
          />
        </p>

        <form>
          <div className="flex items-center justify-center space-x-2">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask AI Assistant"
                className="p-2 rounded-2xl border-slate-400 border-2 bg-gray-200 dark:bg-gray-700 dark:text-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-500 w-2xl px-4 py-3 pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <line
                    x1="21"
                    y1="21"
                    x2="16.65"
                    y2="16.65"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            <button
              type="submit"
              className="transition-colors duration-200 bg-gradient-to-r from-[var(--color-primary)] to-lime-400 bg-[length:200%_200%] bg-left hover:bg-right text-white px-6 py-3 rounded-2xl border-2 border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer"
              style={{
                backgroundSize: "200% 200%",
                backgroundPosition: "left",
                transition: "background-position 0.5s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundPosition = "right")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundPosition = "left")
              }
            >
              Ask
            </button>
          </div>
        </form>
      </section>

      <section className="h-screen flex flex-col items-start w-5xl pt-10 mx-auto">
        <div className="flex flex-col items-start mb-4">
          <h3 className="text-center font-bold text-xl">Recomended Services</h3>
          <div className="flex flex-row items-start justify-center space-x-4 mt-4 w-full">
            <div className="text-center rounded-full dark:bg-[var(--color-primary)] bg-[var(--color-secondary)] font-semibold py-2 px-4">
              Latest
            </div>
            <div className="text-center rounded-full dark:bg-[var(--color-primary)] bg-[var(--color-secondary)] font-semibold py-2 px-4">
              Trending
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-10">
          {data.map((x, i) => (
            <div key={i} className="w-full">
              <img src={x.image} className="w-full rounded-xl" />
              <h4 className="font-semibold mt-4">{x.title}</h4>
              <p className="text-sm text-slate-400">{x.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
