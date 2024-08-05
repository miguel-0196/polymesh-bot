// https://web3auth.io/docs/connect-blockchain/other/polymesh
import { LocalSigningManager } from "@polymeshassociation/local-signing-manager";
import { Polymesh, BigNumber } from "@polymeshassociation/polymesh-sdk";

require("dotenv").config();

const main = async () => {
  const receiver = process.env.RECEIVER_KEY!;
  const signingManager = await LocalSigningManager.create({
    accounts: [{mnemonic: process.env.TARGET_MNEMONIC!},],
  });

  console.log(`Connecting...`);
  const polyClient = await Polymesh.connect({
    nodeUrl: process.env.RPC_URL!,
    signingManager,
  });

  while (true) {
    try {
      process.stdout.write('.');
      const balance = await polyClient.accountManagement.getAccountBalance();
  
      if (!balance.free.isLessThan(new BigNumber(2.1))) {
        const polyxTransferTx = await polyClient.network.transferPolyx(
          {
            amount: balance.free.minus(0.1),
            to: receiver,
            memo: "",
          }
          /*,{
              nonce, = await polyClient.accountManagement.getSigningAccount()?.getCurrentNonce();
          }*/
        );
      
        try {
          console.log(`\nTrasfering ${balance.free.toString()} POLYX...`);
          await polyxTransferTx.run();
          console.log("Completed.");
        } catch (e) {
          console.log("Error in transfer transaction!", e);
        }
        console.log(JSON.stringify(polyxTransferTx.receipt?.events));
      }
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
