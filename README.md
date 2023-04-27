# Pet-Shop-Dapp
## About This Project ##
Our pet shop DApp is a decentralized application designed to offer an efficient way to handle online pet shops using Ethereum. This DApp is enhanced based on the petShopTutorial in the truffle site, and it has the following features availiable: 
* Allows users to register their pets for a fee (0.01 ETH) for future adoption 
* Allows users to buy or adopt pets
* Allows users to buy products and services
* Allows admin to add products and pets 
* Allows effective filtering based on pets age, breed and price.

## Project Set Up ##
* Clone the git repository
* Install the following packages:
  * Node.js version: 16.15.0
  * lite-server version: 2.4.0
  * Solidity version: 0.5.16
  * web3 version: 1.8.2
  * Truffle version: 5.8.1
  * Ganache version: 7.7.0
  * web3-utils version 1.9.0
  * ipfs version 0.19.0  (IPFS command line version) 
* Open a terminal, inside the DApp folder, execute the following IPFS commands: 
  ```
  ipfs init
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]" (for windows)          
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin `[\"*\"]` (for mac)
  ipfs daemon
  ```
* Open the desktop Ganache, create a new workspace and import truffle-config.js in the folder as truffle projects.
* Install Metamask for in your browser: https://metamask.io/download/ <br />
  In the Metamask: 
  * Click “Import Wallet” to import an account, enter the mnemonic that is displayed in Ganache.
  * Add a new network by entering the fields shown below: <br />
  <img src="https://user-images.githubusercontent.com/52727328/234967045-bf928c3f-901d-43bc-ab56-4b9b90f9842d.png" width="250" height="auto">
* Open a new terminal and cd into the DApp folder, run the following command to start the DApp:
  ```
  truffle compile
  truffle migrate -- reset
  truffle test
  npm run dev 
  ```


  








