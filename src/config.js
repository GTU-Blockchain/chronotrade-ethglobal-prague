import { http, createConfig } from "wagmi";
import { flowMainnet, flowTestnet } from "viem/chains";

export const config = createConfig({
    chains: [flowMainnet, flowTestnet],
    transports: {
        [flowMainnet.id]: http(),
        [flowTestnet.id]: http(),
    },
});

const timeTokenAddress = "0x550169D05dCCE151F3642eB2CE2069fe2cD1D03B";

const chronoTradeAddress = "0x57Ec6f741D36EB5285cB90Aa246fe14073386221";
