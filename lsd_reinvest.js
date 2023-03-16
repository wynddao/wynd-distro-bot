const { connect, getMnemonic } = require("./connect");

const hubAddr = "juno1snv8z7j75jwfce4uhkjh5fedpxjnrx9v20ffflzws57atshr79yqnw032r";

async function reinvest(client, address) {
    console.log("Reinvest LSD tokens");
    await client.execute(address, hubAddr, {reinvest: {}}, "auto");
    console.log("Done!");
}

async function main() {
    const mnemonic = getMnemonic();
    const { client, address} = await connect(mnemonic);
    await reinvest(client, address);
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