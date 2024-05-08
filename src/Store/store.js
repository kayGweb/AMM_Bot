import { configureStore } from '@reduxjs/toolkit'

import provider from './reducer/provider'
import tokens from './reducer/tokens'
import amm from './reducer/amm'

export const store = configureStore ({
	reducer : {
		provider,
		tokens,
		amm
	},
	middleware :  getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck : false
		})
});

export default configureStore;