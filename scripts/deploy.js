import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { flowTestnet } from "viem/chains";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validatePrivateKey(privateKey) {
    // Remove '0x' prefix if it exists
    const key = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;

    // Check if the key is a valid hex string of 64 characters (32 bytes)
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(
            "Invalid private key format. Please provide a 32-byte hex string (with or without '0x' prefix)"
        );
    }

    return `0x${key}`;
}

async function main() {
    if (!process.env.PRIVATE_KEY) {
        throw new Error("Please set PRIVATE_KEY in your .env file");
    }

    // Validate and format the private key
    const privateKey = validatePrivateKey(process.env.PRIVATE_KEY);

    // Create wallet client
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
        account,
        chain: flowTestnet,
        transport: http(),
    });

    // Create public client
    const publicClient = createPublicClient({
        chain: flowTestnet,
        transport: http(),
    });

    // Read contract artifacts
    const timeTokenArtifact = JSON.parse(
        readFileSync(
            join(__dirname, "../artifacts/contracts/TIME.sol/TIME.json"),
            "utf8"
        )
    );
    const chronoTradeArtifact = JSON.parse(
        readFileSync(
            join(
                __dirname,
                "../artifacts/contracts/ChronoTrade.sol/ChronoTrade.json"
            ),
            "utf8"
        )
    );

    console.log("Deploying TIME token...");
    const timeTokenHash = await walletClient.deployContract({
        abi: timeTokenArtifact.abi,
        bytecode: timeTokenArtifact.bytecode,
    });

    console.log("Waiting for TIME token deployment...");
    const timeTokenReceipt = await publicClient.waitForTransactionReceipt({
        hash: timeTokenHash,
    });
    const timeTokenAddress = timeTokenReceipt.contractAddress;
    console.log("TIME token deployed to:", timeTokenAddress);

    console.log("Deploying ChronoTrade...");
    const chronoTradeHash = await walletClient.deployContract({
        abi: chronoTradeArtifact.abi,
        bytecode: chronoTradeArtifact.bytecode,
        args: [timeTokenAddress],
    });

    console.log("Waiting for ChronoTrade deployment...");
    const chronoTradeReceipt = await publicClient.waitForTransactionReceipt({
        hash: chronoTradeHash,
    });
    const chronoTradeAddress = chronoTradeReceipt.contractAddress;
    console.log("ChronoTrade deployed to:", chronoTradeAddress);

    // Set ChronoTrade contract address in TIME token
    console.log("Setting ChronoTrade contract address in TIME token...");
    const setContractHash = await walletClient.writeContract({
        address: timeTokenAddress,
        abi: timeTokenArtifact.abi,
        functionName: "setChronoTradeContract",
        args: [chronoTradeAddress],
    });

    await publicClient.waitForTransactionReceipt({
        hash: setContractHash,
    });

    console.log("Deployment complete!");
    console.log("TIME Token:", timeTokenAddress);
    console.log("ChronoTrade:", chronoTradeAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
