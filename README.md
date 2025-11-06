# aleo-sdk-deploy

This repo showcases the current bug in the aleo sdk where deploying programs fails. This program tries to deploy a
hyperlane contract. To run it execute the following:

```
yarn install
yarn build

leo devnet --storage ~/tmp --clear-storage --snarkos ~/.cargo/bin/snarkos --snarkos-features test_network --consensus-heights 0,1,2,3,4,5,6,7,8,9,10 -y
yarn start
```

Tested with `leo 3.3.1`

Should currently error with

```
Creating deployment transaction
file:///Users/troykessler/Desktop/aleo-sdk-deploy/node_modules/@provablehq/sdk/dist/testnet/browser.js:1815
            throw new Error(`Error posting transaction: ${error}`);
                  ^

Error: Error posting transaction: Error: Invalid transaction — Invalid deployment transaction 'at19zj8qghupuc9xg6ng5wax5jgyranyq0jhf4w3l35jcgcdptm7grsj4uv0x' - missing program checksum
    at AleoNetworkClient.submitTransaction (file:///Users/troykessler/Desktop/aleo-sdk-deploy/node_modules/@provablehq/sdk/dist/testnet/browser.js:1815:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ProgramManager.deploy (file:///Users/troykessler/Desktop/aleo-sdk-deploy/node_modules/@provablehq/sdk/dist/testnet/browser.js:4069:16)
    at async AleoSigner.deployProgram (file:///Users/troykessler/Desktop/aleo-sdk-deploy/dist/signer.js:42:26)
    at async AleoSigner.createValidatorAnnounce (file:///Users/troykessler/Desktop/aleo-sdk-deploy/dist/signer.js:51:9)
    at async main (file:///Users/troykessler/Desktop/aleo-sdk-deploy/dist/index.js:7:5)
```
