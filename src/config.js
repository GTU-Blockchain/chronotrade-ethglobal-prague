import { http, createConfig } from "wagmi";
import { flowTestnet } from "viem/chains";

// Import the ABI directly from the artifacts directory
// Vite will handle this JSON import at build time
import chronoTradeArtifact from "../artifacts/contracts/ChronoTrade.sol/ChronoTrade.json";
import timeTokenArtifact from "../artifacts/contracts/TIME.sol/TIME.json";

// This config is now only used for direct contract interactions
// The main wallet connection is handled by RainbowKit
export const config = createConfig({
    chains: [flowTestnet],
    transports: {
        [flowTestnet.id]: http(flowTestnet.rpcUrls.default.http[0]),
    },
});

export const timeTokenAddress = "0x3C6eBB3798A2F27d2bDf8F86f1cF74D1999019a6";
export const chronoTradeAddress = "0x701312CA665B725b0a751bAa859Bb218B03a7fd0";
export const chronoTradeAbi = chronoTradeArtifact.abi;
export const timeTokenAbi = timeTokenArtifact.abi;
