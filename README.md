# Pet-Shop-Dapp
## About This Project ##
Our pet shop DApp is a decentralized application designed to offer an efficient way to handle online pet shops using Ethereum. This DApp is enhanced based on the petShopTutorial in the truffle site, the UI compononet references this figma design: https://www.figma.com/community/file/1152897221563037581. <br />
The DApp has the following features availiable: 
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
* Once the app starts, metamask will ask for connection of the previously imported wallet.

## Our Pages ##
#### Admin Landing Page
User page won't have "Add Products" option in nav bar <br />
<img width="956" alt="image" src="https://user-images.githubusercontent.com/52727328/234970486-8b9433bb-c853-42dd-8127-44dce1c591e0.png">

#### Admin Register Pet Page 
Sale/Adoption selection and price inputs won't be visible to non-admin users <br />
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234970845-58d830e5-116f-44b4-ae17-c6eaa2088212.png"> <br />
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234972666-d3df5e75-1ed6-4499-9d36-487be4f2e2ae.png">

#### Browse Pets Page 
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234974096-76fbe50b-2342-4c19-af6c-a2c87bee8d60.png"> <br />
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234974210-e3f8c19d-375e-4276-a63b-e9b8d8951108.png">

#### Buy/Adopt Pet
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234978878-e6faa5bc-2864-43ab-aa0d-0a5b540d2c76.png"> <br />
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234979024-8cdc55d4-a1ea-4480-8ce1-12fd9751f8c5.png">

#### Filter Pets
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234974431-154eef7e-53a9-4783-9f05-8561fdbaf624.png">

#### Browse Products Page
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234978737-de196138-d66b-4da1-81c3-c9fde050d34f.png">

#### Buy Product
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234979381-f1bcd076-5ab5-4160-8c46-d382a56c4269.png">
Stock Decreases:
<img width="948" alt="image" src="https://user-images.githubusercontent.com/52727328/234979646-6bca83c5-1d82-48d7-83ff-402c298a3d22.png">

#### Add Product Page
<img width="960" alt="image" src="https://user-images.githubusercontent.com/52727328/234979756-379b68e3-72fc-45a6-a53b-fa9e4616dc2a.png">











  








