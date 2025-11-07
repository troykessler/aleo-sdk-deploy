import {
  getOrInitConsensusVersionTestHeights,
  initThreadPool,
} from "@provablehq/sdk";
import { AleoSigner } from "./signer.js";

// Attempt to set the default test heights for the consensus versions from the CONSENSUS_VERSION_HEIGHTS envar when nodeJS loads its wasm module.
function setDefaultTestHeights() {
  const consensusVersionHeights = process.env["CONSENSUS_VERSION_HEIGHTS"];
  if (consensusVersionHeights) {
    getOrInitConsensusVersionTestHeights(consensusVersionHeights);
  }
}

setDefaultTestHeights();

await initThreadPool();

const main = async () => {
  const localnetRpc = "http://localhost:3030";

  // test private key with funds
  const privateKey =
    "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";
  const signer = AleoSigner.connectWithSigner([localnetRpc], privateKey);

  // await signer.createValidatorAnnounce();
  await signer.createMailbox();
  console.log("done!");
};

main();
