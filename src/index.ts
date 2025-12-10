import {
  getOrInitConsensusVersionTestHeights,
  initThreadPool,
} from "@provablehq/sdk";
import { AleoSigner } from "./signer.js";

getOrInitConsensusVersionTestHeights("0,1,2,3,4,5,6,7,8,9,10");
await initThreadPool();

const main = async () => {
  const localnetRpc = "http://localhost:3030";

  // test private key with funds
  const privateKey =
    "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";
  const signer = AleoSigner.connectWithSigner([localnetRpc], privateKey);

  await signer.createValidatorAnnounce();
  // await signer.createMailbox();
  console.log("done!");
};

main();
