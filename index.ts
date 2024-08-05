import { LocalSigningManager } from "@polymeshassociation/local-signing-manager";
import { Polymesh, BigNumber } from "@polymeshassociation/polymesh-sdk";

require("dotenv").config();

enum RPC {
  Testnet = "wss://testnet-rpc.polymesh.live",
  Mainnet = "wss://mainnet-rpc.polymesh.network",
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
  const network = process.argv[2] || "test";
  const node = network == "test" ? RPC.Testnet : RPC.Mainnet;
  const receiver = process.env[`RECEIVER_${network.toUpperCase()}`];

  console.log(`Starting...`);
  const signingManager = await LocalSigningManager.create({
    accounts: [
      {
        mnemonic: process.env.TARGET_MNEMONIC!, // most mnemonics are 12 words
      },
    ],
  });

  console.log(`Connecting to ${network}net...`);
  const polyClient = await Polymesh.connect({
    nodeUrl: node,
    signingManager,
  });

  while (true) {
    try {
      process.stdout.write('.');
      const balance = await polyClient.accountManagement.getAccountBalance();
  
      if (!balance.free.isLessThan(new BigNumber(0.1))) {
        console.log(`\nBalance: ${balance.free.toString()}`);
    
        const nonce = await polyClient.accountManagement.getSigningAccount()?.getCurrentNonce();
        const polyxTransferTx = await polyClient.network.transferPolyx(
          {
            amount: balance.free.minus(0.1),
            to: receiver!,
            memo: "",
          },
          {
            nonce,
          }
        );
      
        try {
          console.log("Trasfering POLYX...");
          await polyxTransferTx.run();
          console.log("Completed.", "^_^");
        } catch (e) {
          console.log("Error in transfer transaction!", e);
        }  
      }

      // await sleep(100);
    } catch (err) {
      console.error("Error!", err);
    }
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch(console.error);
