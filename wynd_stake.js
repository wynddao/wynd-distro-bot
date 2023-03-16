const { connect, getMnemonic, pprint } = require("./connect");

const distroAddr = "juno1yu7s35r3e43j635c7wxfev9876tvfpjf6n5803dwu6e3z8qrmvzshwk075";

// sees if it is time to call
async function checkTrigger(client) {
    const { config } = await client.queryContractSmart(distroAddr, {config:{}});
    pprint(config);
    const elapsed = Date.now() / 1000 - config.last_payment;
    if (elapsed < config.epoch) {
        console.log(`Next epoch comes in ${config.epoch - elapsed} seconds`);
        return false;
    } else {
        return true;
    }
}

async function pingTrigger(client, address) {
    console.log(`Triggering payout`);
    await client.execute(address, distroAddr, {payout: {}}, "auto");
}

async function main() {
    const mnemonic = getMnemonic();
    const { client, address} = await connect(mnemonic);
    if (await checkTrigger(client)) {
        await pingTrigger(client, address);
    }
}

main().then(
    () => {
        process.exit(0);
    },
    (error) => {
        console.error(error);
        process.exit(1);
    },
);