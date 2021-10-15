import MtaFetch from '../src'

const host = 'http://example.com'
const simpleFetch = new MtaFetch({
	host,
	apis: {},
	errMsgs: {}
})

test('initial', () => {
	expect(simpleFetch.getHost()).toBe(host)
	expect(simpleFetch.getToken()).toBe('')
	expect(Object.keys(simpleFetch.getApis()).length).toBe(0)
	expect(Object.keys(simpleFetch.getErrMsgs()).length).toBe(0)
})

test('set funcs', () => {
	simpleFetch.setToken('Bearer test')
	expect(simpleFetch.getToken()).toBe('Bearer test')

	simpleFetch.setApis({
		test: {
			url: '/v1/test',
			method: 'GET'
		}
	})
	expect(simpleFetch.getApis().test.url).toBe('/v1/test')
	expect(simpleFetch.getApis().test.method).toBe('GET')

	simpleFetch.setErrMsgs({
		test: {
			200: 'success'
		}
	})
	expect(simpleFetch.getErrMsgs().test[200]).toBe('success')

	simpleFetch.setApiByType('test2', {
		url: '/v1/test2',
		method: 'POST'
	})
	expect(simpleFetch.getApiByType('test2').url).toBe('/v1/test2')
	expect(simpleFetch.getApiByType('test2').method).toBe('POST')
	expect(simpleFetch.getApis().test2.url).toBe('/v1/test2')
	expect(simpleFetch.getApis().test2.method).toBe('POST')

	simpleFetch.setErrMsgByType('test2', {
		200: 'success',
		401: 'unauthorization'
	})
	expect(simpleFetch.getErrMsgByType('test2')[200]).toBe('success')
	expect(simpleFetch.getErrMsgByType('test2')[401]).toBe('unauthorization')
	expect(simpleFetch.getErrMsgs().test2[200]).toBe('success')
	expect(simpleFetch.getErrMsgs().test2[401]).toBe('unauthorization')
})

test('computeWholeUrl', () => {
	expect(simpleFetch.computeWholeUrl({
		url: '/accounts/:accountId/books/:bookId',
		urlParams: {
			accountId: 'account_id',
			bookId: 'book_id'
		},
		query: {
			limit: '10',
			offset: '0'
		}
	})).toBe('/accounts/account_id/books/book_id?limit=10&offset=0')
})

test('buildFormData', () => {
	const formData = simpleFetch.buildFormData({
		string: 'string',
		number: 0,
		boolean: true
	})
	expect(formData instanceof FormData).toBe(true)
	expect(formData.get('string')).toBe('string')
	expect(formData.get('number')).toBe('0')
	expect(formData.get('boolean')).toBe('true')
})

test('no server', async () => {
	const host = 'http://localhost:80'
	const mtaFetch = new MtaFetch({
		host,
		apis: {
			test: {
				url: '/test',
				method: 'get'
			}
		},
		errMsgs: {
			test: {
				500: 'test'
			}
		}
	})
	const result = await mtaFetch.send({
		type: 'test'
	})

	expect(result.ok).toBe(false)
	expect(result.status).toBe(0)
	expect(result.errMsg).toBe('fetch is not defined')
	expect(result.data).toBe(undefined)
})
