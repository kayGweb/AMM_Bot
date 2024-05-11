import { ethers } from 'ethers'
import { setAccount, setProvider, setNetwork } from './reducer/provider'

import TOKEN_ABI from '../abis/Token.json'
import AMM_ABI from '../abis/AMM.json'
import config from '../config.json'

import { setContracts, setSymbols, balancesLoaded } from './reducer/tokens'
import { setContract, sharesLoaded, swapRequest, swapSuccess, swapFail } from './reducer/amm'

export const loadProvider = (dispatch) => {
	// Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    dispatch(setProvider(provider))

    return provider
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork();
	dispatch(setNetwork(chainId))

	return chainId
}

export const loadAccount = async (dispatch) => {
	 // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch(setAccount(account))

    return account
}

export const loadTokens = async (provider, chainId, dispatch) => {
	const dapp = new ethers.Contract(config[chainId].dapp.address, TOKEN_ABI, provider)
	const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

	dispatch(setContracts([dapp, usd]))
	dispatch(setSymbols([await dapp.symbol(), await usd.symbol()]))
}

export const loadAMM = async (provider, chainId, dispatch) => {
	const amm = new ethers.Contract(config[chainId].amm.address, AMM_ABI, provider)

	dispatch(setContract(amm))

	return amm
}

// Load Balances & Shares
export const loadBalances = async (amm, tokens, account, dispatch) => {
	const balance1 = await tokens[0].balanceOf(account)
	const balance2 = await tokens[1].balanceOf(account)

	dispatch(balancesLoaded([
		ethers.utils.formatUnits(balance1.toString(), 'ether'),
		ethers.utils.formatUnits(balance2.toString(), 'ether')
	]))

	const shares = await amm.shares(account)
	dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')))
}

// SWAP

export const swap = async (provider, amm, token, symbol, amount, dispatch) => {
	
	try{
		// Tell Redux that the use is swapping
		dispatch(swapRequest())

		let transaction

		const signer = await provider.getSigner()

		transaction = await token.connect(signer).approve(amm.address, amount)
		await transaction.wait()

		if(symbol === 'DAPP'){
			transaction = await amm.connect(signer).swapToken1(amount)
			await transaction.wait()
		} else {
			transaction = await amm.connect(signer).swapToken2(amount)
		}

		await transaction.wait()

		// Tell Redux that swap has completed
		dispatch(swapSuccess(transaction.hash))
	}catch(error){
		dispatch(swapFail())
	}

	

}

