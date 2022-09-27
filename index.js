const { GasPrice, DirectSecp256k1HdWallet, SigningCosmWasmClient, makeCosmoshubPath } = require("cosmwasm");
const { env } = require("process");

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
  
  async function main() {
    const mnemonic = getMnemonic();
    const { client, address} = await connect(mnemonic);
    // TODO: call the contract
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