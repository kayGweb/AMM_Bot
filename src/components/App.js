import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route} from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation'
import Swap from './Swap'
import Tabs from './Tabs'
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import Charts from './Charts'


import {
  loadAccount, 
  loadProvider, 
  loadNetwork, 
  loadTokens,
  loadAMM,
  loadBalances
} from '../Store/interactions'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = await loadProvider(dispatch);

    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () =>{
      window.location.reload()
    })

    // Fetch Accounts
    window.ethereum.on('accountsChanged', async () => {
      console.log("testing")
      await loadAccount(dispatch)
    })

    // Fetch Tokens
    await loadTokens(provider, chainId, dispatch)

    // Fetch amm
    await loadAMM(provider, chainId, dispatch)
  }

  useEffect(() => {
      loadBlockchainData()
  }, [])

  return(
    <Container>
      <HashRouter>
        <Navigation />

        <hr />

        <Tabs />
        
        <Routes>
          <Route exact path="/" element={<Swap />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App;
