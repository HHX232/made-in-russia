export const getContentType = () => ({
	'Content-Type': 'application/json'
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorCatch = (error: any): string =>
	error.response && error.response.data && error.response.data.message
		? typeof error.response.data.message === 'object'
			? error.response.data.message[0]
			: error.response.data.essage
		: error.message
