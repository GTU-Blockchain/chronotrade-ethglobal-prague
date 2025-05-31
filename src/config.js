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

export const timeTokenAddress = "0x4c5b1c61f264aFE0554b24fC4c4e47127A748Ab2";
export const chronoTradeAddress = "0x171c7f9871e10eac781429c45Bffb6cae93AF0ff";
export const chronoTradeAbi = chronoTradeArtifact.abi;
export const timeTokenAbi = timeTokenArtifact.abi;
