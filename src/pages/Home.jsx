import Navbar from "../components/Navbar/Navbar";
import { data } from "../assets/temp";

function Home() {
  return (
    <main
      id="home"
      className="min-h-screen bg-white dark:bg-gradient-to-br dark:via-blue-950 dark:from-gray-800 dark:to-gray-800 text-black dark:text-white flex flex-col items-center justify-center"
    >
      <Navbar />
      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to ChronoTrade</h1>
        <p className="text-lg mb-8">
          Your gateway to decentralized trading and finance.
        </p>

        <form>
          <div className="flex items-center justify-center space-x-2">
            <input
              type="text"
              placeholder="Ask AI Assistant"
              className="p-2 rounded-2xl border-slate-400 border-2 bg-gray-200 dark:bg-gray-700 dark:text-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-2xl px-4 py-3"
            />
            <button
              type="submit"
              className="transition-colors duration-200 bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl border-2 border-blue-800 hover:bg-green-950 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Ask
            </button>
          </div>
        </form>
      </section>

      <section className="h-screen flex flex-col items-start w-5xl pt-10 mx-auto">
        <div className="flex flex-col items-start mb-4">
          <h3 className="text-center font-bold text-xl">Latest Service</h3>
          <div className="flex flex-row items-start justify-center space-x-4 mt-4 w-full">
            <div className="text-center rounded-full dark:bg-blue-[var(--color-hover)] bg-[var(--color-secondary)] font-semibold py-2 px-4">
              Latest
            </div>
            <div className="text-center rounded-full dark:bg-blue-[var(--color-hover)] bg-[var(--color-secondary)] font-semibold py-2 px-4">
              Trending
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-start items-center gap-6 w-full">
          {data.map((x, i) => (
            <div key={i} className="w-40">
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
