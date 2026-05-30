const { ethers } = require("./node_modules/ethers");
const ABI = require("./src/blockchain/GiveHope.json");

async function run() {
    const provider = new ethers.JsonRpcProvider("https://polygon-amoy-bor-rpc.publicnode.com");
    const contract = new ethers.Contract("0xc3C96A6D23aB6902F32F13A404609d310b18eE8F", ABI, provider);
    
    const latest = await provider.getBlockNumber();
    console.log("Latest block:", latest);

    let allEvents = [];
    const chunkSize = 9999;
    const scanRange = 2000000; // scan last 2M blocks

    for (let to = latest; to > latest - scanRange; to -= chunkSize) {
        const from = Math.max(to - chunkSize, 0);
        try {
            const events = await contract.queryFilter(contract.filters.DonationReceived(), from, to);
            if (events.length > 0) {
                allEvents.push(...events);
                console.log("Found", events.length, "events in blocks", from, "-", to);
            }
        } catch (e) {
            // skip chunk errors
        }
        if (from === 0) break;
    }

    console.log("\nTotal events found:", allEvents.length);
    allEvents.forEach(e => {
        console.log("  tx:", e.transactionHash, "| amount:", ethers.formatEther(e.args.amount), "MATIC | campaignId:", Number(e.args.campaignId), "| block:", e.blockNumber);
    });
}

run();
