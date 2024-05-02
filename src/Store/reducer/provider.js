import { createSlice } from '@reduxjs/toolkit';

export const provider = createSlice({
	name : 'provider',
	initialState : {
		connection : null,
		chainId : null,
		account : null
	},
	reducers : {
		setAccount: (state, action) => {
			state.account = action.payload
		},
		setNetwork : (state, action) => {
			state.chainId = action.payload
		},
		setProvider : (state, action) => {
			state.connection = action.payload
		}
	}
});

export const { setAccount, setNetwork, setProvider  } = provider.actions;

export default provider.reducer;