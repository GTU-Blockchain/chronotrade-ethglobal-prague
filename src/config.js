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

export const timeTokenAddress = "0xb000c2632f2Ea6DaFB08C44afdfA101A5c540a8e";
export const chronoTradeAddress = "0x063F7B1d3A64D364734EECF7EBCEAf5BDee91716";
export const chronoTradeAbi = chronoTradeArtifact.abi;
export const timeTokenAbi = timeTokenArtifact.abi;
