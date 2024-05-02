import { ethers } from 'ethers'
import { setAccount, setProvider, setNetwork } from './reducer/provider'

export const loadProvider = (dispatch) => {
	// Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    dispatch(setProvider(provider))

    return provider
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork();
	dispatch(setNetwork(chainId))

	return
}

export const loadAccount = async (dispatch) => {
	 // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch(setAccount(account))

    return account
}