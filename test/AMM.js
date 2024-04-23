const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('AMM', () => {
  let accounts, 
      deployer,
      liqudityProvider;

  let token1,
      token2,
      amm;



  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    liqudityProvider = accounts[1]

    //Deploy Token
    const Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
    token2 = await Token.deploy('USD Token', 'USD', '1000000')

    //Send Token1 to liquidity Provider
    let transaction = await token1.connect(deployer)
          .transfer(liqudityProvider.address, tokens(100000))
        await transaction.wait();

    //Send Token2 to liquidity Provider    
    transaction = await token2.connect(deployer)
        .transfer(liqudityProvider.address, tokens(100000))
      await transaction.wait();

    const AMM = await ethers.getContractFactory('AMM')
    amm = await AMM.deploy(token1.address, token2.address)
    
  })

    describe('Deployment', () => {

      it('has correct name', async () => {
        expect(amm.address).to.not.equal(0x0)
      })

      it('returns token1 address', async () => {
        expect(await amm.token1()).to.equal(token1.address)
      })

      it('returns token2 address', async () => {
        expect(await amm.token2()).to.equal(token2.address)
      })

    })

    describe('Swaping tokens', () => {
      let amount, transaction, result;

      it('faciliates Swaps', async () => {
        amount = tokens(100000)
        transaction = await token1.connect(deployer).approve(amm.address, amount)
        await transaction.wait()

        transaction = await token2.connect(deployer).approve(amm.address, amount)
        await transaction.wait()

        transaction = await amm.connect(deployer).addLiquidity(amount, amount)
        await transaction.wait()

        expect(await token1.balanceOf(amm.address)).to.equal(amount)
        expect(await token2.balanceOf(amm.address)).to.equal(amount)

        expect(await amm.token1Balance()).to.equal(amount)
        expect(await amm.token2Balance()).to.equal(amount)

        //expect(await amm.K()).to.equal(tokens(100000))
        //console.log(await amm.K())

        //check deployer has 100 shares;
        expect(await amm.shares(deployer.address)).to.equal(tokens(100))
        expect(await amm.totalShares()).to.equal(tokens(100))

        //LP adds More Liquidity
        //LP approves 50k tokens
        amount = tokens(50000)
        tranaction = await token1.connect(liqudityProvider).approve(amm.address, amount)
        await transaction.wait()

        transaction = await token2.connect(liqudityProvider).approve(amm.address, amount)
        await transaction.wait()

        let token2Deposit = await amm.calculateToken2Deposit(amount)

        transaction = await amm.connect(liqudityProvider).addLiquidity(amount, token2Deposit)
        await transaction.wait()

        expect(await amm.shares(liqudityProvider.address)).to.equal(tokens(50))

        expect(await amm.shares(deployer.address)).to.equal(tokens(100))

        expect(await amm.totalShares()).to.equal(tokens(150))
      })
      
      describe('Success', () => {

      })

      describe('Failure', () => {

      })

  })

  // describe('Approving Tokens', () => {
  //   let amount, transaction, result

  //   beforeEach(async () => {
  //     amount = tokens(100)
  //     transaction = await token.connect(deployer).approve(exchange.address, amount)
  //     result = await transaction.wait()
  //   })

  //   describe('Success', () => {
  

  //   })

  //   describe('Failure', () => {
      
  //   })

  // })

})
