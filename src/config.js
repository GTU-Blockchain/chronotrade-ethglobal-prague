import { http, createConfig } from "wagmi";
import { flowMainnet, flowTestnet } from "viem/chains";

export const config = createConfig({
    chains: [flowMainnet, flowTestnet],
    transports: {
        [flowMainnet.id]: http(),
        [flowTestnet.id]: http(),
    },
});
