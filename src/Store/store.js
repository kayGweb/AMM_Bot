import { configureStore } from '@reduxjs/toolkit'

import provider from './reducer/provider'

export const store = configureStore ({
	reducer : {
		provider
	},
	middleware :  getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck : false
		})
});

export default configureStore;