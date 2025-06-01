export const getBlockscoutUrl = (txHash) => {
    // Using Blockscout for Sepolia testnet
    return `https://evm-testnet.flowscan.io/tx/${txHash}`;
};

export const openInBlockscout = (txHash) => {
    window.open(getBlockscoutUrl(txHash), "_blank");
};
