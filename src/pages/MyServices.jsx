import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useParams } from "react-router-dom";

function MyServices() {
  useParams().address;

  const services = [
    {
      id: 1,
      profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
      serviceName: "Web Design Consultation",
      date: "Jul 1, 2023, 2:00 PM",
    },
    {
      id: 2,
      profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
      serviceName: "Blockchain Audit",
      date: "Jun 15, 2023, 10:00 AM",
    },
    {
      id: 3,
      profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
      serviceName: "Smart Contract Deployment",
      date: "Jul 1, 2023, 2:00 PM",
    },
  ];

  const [isDark, setIsDark] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDark(e.matches);
    matcher.addEventListener("change", handleChange);
    return () => matcher.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <Navbar />
      <section className="flex flex-col w-full dark:bg-[var(--color-background-dark)] bg-white min-h-screen pt-16 items-center justify-start">
        <div className="flex flex-col w-full max-w-5xl dark:text-white text-black mt-10 transition-all duration-200">
          <h2 className="font-bold text-2xl mb-4">Services Complete</h2>
          {services.map((x, i) => (
            <div
              key={i}
              className="flex items-center w-full hover:bg-[var(--color-hover)] p-4 rounded-2xl"
            >
              <img src={x.profilePic} className="rounded-full w-20 mr-5" />
              <div className="flex flex-col justify-center">
                <p className="font-semibold">{x.serviceName}</p>
                <p className="dark:text-white/70 text-black/50">{x.date}</p>
              </div>
              <Link
                to={"/comments"}
                className="ml-auto flex items-center active:scale-95 transition-all duration-200"
              >
                <img
                  src={
                    isDark
                      ? "../src/assets/message-white.svg"
                      : "../src/assets/message-black.svg"
                  }
                  alt="Comments"
                  className="w-8 h-8 hover:scale-110 transition-transform duration-150"
                />
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full max-w-5xl dark:text-white text-black mt-10 space-y-4">
          <h3 className="font-semibold text-xl mb-4">Upcoming Services</h3>
          {services.map((x, i) => (
            <div key={i} className="flex items-center w-full pl-4 rounded-2xl">
              <img src={x.profilePic} className="rounded-full w-20 mr-5" />
              <div className="flex flex-col justify-center">
                <p className="font-semibold">{x.serviceName}</p>
                <p className="dark:text-white/70 text-black/50">{x.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default MyServices;
