import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { privateKeyToAccount } from "viem/accounts";

export default buildModule("TimeToken", (m) => {
    if (!process.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY environment variable is not set");
    }

    // Convert private key to account
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

    // Deploy TIME token contract
    const timeToken = m.contract("TIME", [], {
        from: account.address,
    });

    // Note: ChronoTrade address will be set after ChronoTrade deployment
    // This will be handled in a separate transaction after both contracts are deployed

    return { timeToken };
});
