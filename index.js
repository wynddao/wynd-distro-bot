const { GasPrice, DirectSecp256k1HdWallet, SigningCosmWasmClient, makeCosmoshubPath } = require("cosmwasm");
const { env } = require("process");

const distroAddr = "juno1yu7s35r3e43j635c7wxfev9876tvfpjf6n5803dwu6e3z8qrmvzshwk075";

const pprint = x => console.log(JSON.stringify(x, undefined, 2));

// Check "MNEMONIC" env variable and ensure it is set to a reasonable value
function getMnemonic() {
    const mnemonic = env["MNEMONIC"];
    if (!mnemonic || mnemonic.length < 48) {
        throw new Error("Must set MNEMONIC to a 12 word phrase");
    }
    return mnemonic;
}

const junoConfig = {
    chainId: "juno-1",
    rpcEndpoint: "https://rpc.juno-1.deuslabs.fi:443",
    prefix: "juno",
    gasPrice: GasPrice.fromString("0.005ujuno"),
    feeToken: "ujuno",
};
  
async function connect(mnemonic) {
    const { prefix, gasPrice, feeToken, rpcEndpoint } = junoConfig;
    const hdPath = makeCosmoshubPath(0);

    // Setup signer
    const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix, hdPaths: [hdPath] });
    const { address } = (await offlineSigner.getAccounts())[0];
    console.log(`Connected to ${address}`);
    
    // Init SigningCosmWasmClient client
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, offlineSigner, {
        prefix,
        gasPrice,
    });
    const balance = await client.getBalance(address, feeToken);
    console.log(`Balance: ${balance.amount} ${balance.denom}`);
  
    const chainId = await client.getChainId();
  
    if (chainId !== junoConfig.chainId) {
        throw Error("Given ChainId doesn't match the clients ChainID!");
    }
  
    return { client, address };
}

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