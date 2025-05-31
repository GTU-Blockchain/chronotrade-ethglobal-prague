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

export const timeTokenAddress = "0x65ea937aE6316F543356a9012fFB4E997dD6C820";
export const chronoTradeAddress = "0xCF0C8a69fb06e2111dC9fE643a0D726198097686";
export const chronoTradeAbi = chronoTradeArtifact.abi;
export const timeTokenAbi = timeTokenArtifact.abi;
