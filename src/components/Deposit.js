import { useSelector, useDispatch } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import { ethers } from 'ethers'

import Alert from './Alert'
import { addLiquidity, loadBalances } from '../Store/interactions'

const Deposit = () => {
	// state variables
	const [token1Amount, setToken1Amount] = useState(0)
	const [token2Amount, setToken2Amount] = useState(0)
	const [showAlert, setShowAlert] = useState(false)

	
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account)
	const balances = useSelector(state => state.tokens.balances)
	const tokens = useSelector(state => state.tokens.contracts)
	const symbols = useSelector(state => state.tokens.symbols)
	const amm = useSelector(state => state.amm.contract)
	const isDepositing = useSelector(state => state.amm.depositing.isDepositing)
	const isSuccess = useSelector(state => state.amm.depositing.isSuccess)
	const transactionHash = useSelector(state => state.amm.depositing.transactionHash)

	const dispatch = useDispatch()

	const amountHandler = async (e) => {
		if(e.target.id === 'token1'){
			setToken1Amount(e.target.value)

			// Fetch value from chain
			const _token1Amount = ethers.utils.parseUnits(e.target.value, 'ether')
			const result = await amm.calculateToken2Deposit(_token1Amount)
			const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether')

			// Set token 2 Amount
			setToken2Amount(_token2Amount)
		} else {
			setToken2Amount(e.target.value)

			// Fetch value from chain
			const _token2Amount = ethers.utils.parseUnits(e.target.value, 'ether')
			const result = await amm.calculateToken1Deposit(_token2Amount)
			const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether')

			// Set Token 1 Amount
			setToken1Amount(_token1Amount)
		}
	}

	const depositHandler = async (e) => {
		e.preventDefault()

		setShowAlert(false)

		const _token1Amount = ethers.utils.parseUnits(token1Amount, 'ether')
		const _token2Amount = ethers.utils.parseUnits(token2Amount, 'ether')
		
		await addLiquidity(provider, amm, tokens, [_token1Amount, _token2Amount], dispatch)

		await loadBalances(amm, tokens, account, dispatch)

		setShowAlert(true)
	}
	
	return(
		<div>
			<Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
				{account ? (
					<Form onSubmit={depositHandler} style={{ maxWidth : '450px', margin: '50px auto' }}>
						<Row>
							
							<Form.Text className='text-end my-2' muted>
								Balance: {balances[0]}
							</Form.Text>
							<InputGroup>
								<Form.Control
								 type='number' 
								 placeholder='0.0' 
								 min='0.0' 
								 step='any'
								 id='token1'
								 onChange={(e) => amountHandler(e)}
								 value={token1Amount === 0 ? "" : token1Amount}
							    >
								</Form.Control>
								<InputGroup.Text style={{ width: '100px' }} className='justify-content-center'>{symbols[0]}</InputGroup.Text>
							</InputGroup>
						</Row>
						<Row className='my-3'>
							<Form.Text className='text-end my-2' muted>
								Balance: {balances[1]}
							</Form.Text>
							<InputGroup>
								<Form.Control 
								type='number' 
								placeholder='0.0' 
								step='any'
								id='token2' 
								onChange={(e) => amountHandler(e)}
								value={token2Amount === 0 ? "" : token2Amount}
								>
								</Form.Control>
								<InputGroup.Text style={{ width: '100px' }} className='justify-content-center'>{symbols[1]}</InputGroup.Text>
							</InputGroup>
						</Row>
						<Row className='my-3'>
							{isDepositing ? (
								<Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
						 	):(
						 		<Button type='submit'>
									Deposit
								</Button>
						 	)}
						</Row>
					</Form>
				):(
		 			<p
		 			 className='d-flex justify-content-center align-items-center'
		 			 style={{ height: '300px' }}
		 			>
		 			 Please connect wallet.
		 			</p>
				)}
			</Card>

			{isDepositing ? (
				<Alert 
					message={'Deposit Pending...'}
					transactionHash={null}
					variant={'info'}
					showShowAlert={setShowAlert}
				/>
			) : isSuccess && showAlert ? (
				<Alert 
					message={'Deposit Successful...'}
					transactionHash={transactionHash}
					variant={'success'}
					showShowAlert={setShowAlert}
				/>
			) : !isSuccess && showAlert ? (
				<Alert 
					message={'Deposit Failed...'}
					transactionHash={null}
					variant={'danger'}
					showShowAlert={setShowAlert}
				/>
			) : (
				<></>
			)}

		</div>
	)

}

export default Deposit