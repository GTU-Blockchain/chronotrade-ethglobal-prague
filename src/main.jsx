import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={{
          darkMode: darkTheme({
            accentColor: "var(--color-primary)",
            accentColorForeground: "white",
            fontStack: "system",
            overlayBlur: "small",
          }),
          lightMode: lightTheme({
            accentColor: "var(--color-primary)",
            accentColorForeground: "white",
            fontStack: "system",
            overlayBlur: "small",
          }),
        }}
      >
        <StrictMode>
          <App />
        </StrictMode>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
