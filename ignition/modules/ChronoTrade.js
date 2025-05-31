import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { privateKeyToAccount } from "viem/accounts";
import { timeTokenAddress } from "../../src/config.js";

export default buildModule("ChronoTrade", (m) => {
    if (!process.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY environment variable is not set");
    }

    // Convert private key to account
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

    // Get the TIME token address from the deployment or use the provided one
    const timeTknAddress = m.getParameter("timeTokenAddress", timeTokenAddress);

    // Deploy ChronoTrade contract with TIME token address
    const chronoTrade = m.contract("ChronoTrade", [timeTknAddress], {
        from: account.address,
    });

    // Get the TIME token contract instance
    const timeToken = m.contractAt("TIME", timeTknAddress);

    // Update TIME token with ChronoTrade address
    m.call(timeToken, "setChronoTradeContract", [chronoTrade], {
        id: "updateChronoTradeAddress",
        from: account.address,
    });

    return { chronoTrade, timeToken };
});
