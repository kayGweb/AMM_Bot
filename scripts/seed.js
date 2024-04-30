// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = tokens

async function main() {

  // Fetch Accounts
 console.log(`fetching accounts & network \m`)
 const accounts = await ethers.getSigners()
 const deployer = accounts[0]
 const investor1 = accounts[1]
 const investor2 = accounts[2]
 const investor3 = accounts[3]
 const investor4 = accounts[4]

 // Fetch Network
 const { chainId } = await ethers.provider.getNetwork()
 console.log(`Fetching token and transferring to accounts \n`)

 // Fetch Dapp Token
 const dapp =  await ethers.getContractAt('Token', config[chainId].dapp.address)
 console.log(`Dapp Token fetched: ${dapp.address}`)

  // Fetch USD Token
 const usd =  await ethers.getContractAt('Token', config[chainId].usd.address)
 console.log(`Usd Token fetched: ${usd.address}`)

 // Distrabute tokens to Investors

 let transaction

 //send dapp tokens to investor 1
 transaction = await dapp.connect(deployer).transfer(investor1.address, tokens(10))
 await transaction.wait()

 //send dapp tokens to investor 2
 transaction = await usd.connect(deployer).transfer(investor2.address, tokens(10))
 await transaction.wait()

 //send dapp tokens to investor 3
 transaction = await dapp.connect(deployer).transfer(investor3.address, tokens(10))
 await transaction.wait()

 //send dapp tokens to investor 4
 transaction = await usd.connect(deployer).transfer(investor4.address, tokens(10))
 await transaction.wait()

 //Adding Liquidity

 let amount = tokens(100)

 console.log(`fetching AMM.....`)

 //Fetch AMM
 const amm = await ethers.getContractAt('AMM', config[chainId].amm.address)
 console.log(`AMM fetched: ${amm.address}\n`)

 transaction = await dapp.connect(deployer).approve(amm.address, amount)
 await transaction.wait()

 transaction = await usd.connect(deployer).approve(amm.address, amount)
 await transaction.wait()

  
//Deployer adds liquidity
 console.log(`Adding Liquidity...\n`)
 transaction = await amm.connect(deployer).addLiquidity(amount,amount)
 await transaction.wait()

 //Investor 1 swaps: Dapp --> USD

 console.log(`investor 1 swaps...\n`)

//Investor approves all tokens
 transaction = await dapp.connect(investor1).approve(amm.address, tokens(10))
 await transaction.wait()

 transaction = await amm.connect(investor1).swapToken1(tokens(1))
 await transaction.wait()

 //Investor 2 Swaps: USD --> Dapp

 console.log(`investor 2 swaps...\n`)

//Investor approves all tokens
 transaction = await usd.connect(investor2).approve(amm.address, tokens(10))
 await transaction.wait()

 transaction = await amm.connect(investor2).swapToken2(tokens(1))
 await transaction.wait()

 //Investor 3 swaps: Dapp --> USD

 console.log(`investor 3 swaps...\n`)

//Investor approves all tokens
 transaction = await dapp.connect(investor3).approve(amm.address, tokens(10))
 await transaction.wait()

 transaction = await amm.connect(investor3).swapToken1(tokens(10))
 await transaction.wait()

 //Investor 4 swaps: USD --> Dapp

 console.log(`investor 4 swaps...\n`)

//Investor approves all tokens
 transaction = await usd.connect(investor4).approve(amm.address, tokens(10))
 await transaction.wait()

 transaction = await amm.connect(investor4).swapToken2(tokens(5))
 await transaction.wait()


console.log(`Finished...\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});