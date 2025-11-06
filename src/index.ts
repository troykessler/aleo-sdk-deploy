import { AleoSigner } from "./signer.js";

const main = async () => {
  const localnetRpc = "http://localhost:3030";

  // test private key with funds
  const privateKey =
    "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";
  const signer = AleoSigner.connectWithSigner([localnetRpc], privateKey);

  await signer.createValidatorAnnounce();
  console.log("done!");
};

main();
