import { http, createConfig } from "wagmi";
import { flowMainnet, flowTestnet } from "viem/chains";

export const config = createConfig({
    chains: [flowMainnet, flowTestnet],
    transports: {
        [flowMainnet.id]: http(),
        [flowTestnet.id]: http(),
    },
});

export const timeTokenAddress = "0xEe3849bB6C0EB5bEb5149dd3b46d886278054CB9";

export const chronoTradeAddress = "0x62aF0eDE45BcdCF256809Ab398A5a5c6B6Fefd15";
