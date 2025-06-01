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

export const timeTokenAddress = "0x1C380ed8c247Ad848Cb0F8E515986539b594f6D4";
export const chronoTradeAddress = "0xb7eC71eEc7259749c41bdF0C14E28C4724608B03";
export const chronoTradeAbi = chronoTradeArtifact.abi;
export const timeTokenAbi = timeTokenArtifact.abi;
