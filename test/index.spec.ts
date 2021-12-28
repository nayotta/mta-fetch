import MtaFetch from '../src'

const host = 'http://example.com'
const simpleFetch = new MtaFetch({
	host,
	apis: {
		test: {
			url: '/v1/test',
			method: 'GET',
			withToken: true,
			errMsgs: {
				400: 'bad request'
			}
		}
	}
})

test('initial', () => {
	expect(simpleFetch.getHost()).toBe(host)
	expect(simpleFetch.getToken()).toBe('')
	expect(Object.keys(simpleFetch.getApis()).length).toBe(1)
})

test('set funcs', () => {
	simpleFetch.setToken('Bearer test')
	expect(simpleFetch.getToken()).toBe('Bearer test')
	expect(simpleFetch.getApis().test.url).toBe('/v1/test')
	expect(simpleFetch.getApis().test.method).toBe('GET')
	expect(simpleFetch.getApis().test.withToken).toBe(true)
	expect(simpleFetch.getApis().test.errMsgs?.[400]).toBe('bad request')
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

test('failed to fetch', async () => {
	// mock fetch
	const mockFetchPromise = Promise.reject(new Error('Failed to fetch'))
	const globalRef: any = global
	globalRef.fetch = jest.fn().mockImplementation(() => mockFetchPromise)

	const host = 'http://test.example.com'
	const mtaFetch = new MtaFetch({
		host,
		apis: {
			test: {
				url: '/test',
				method: 'get',
				errMsgs: {
					500: 'test'
				}
			}
		}
	})
	const result = await mtaFetch.send({
		type: 'test'
	})

	expect(result.ok).toBe(false)
	expect(result.status).toBe(-1)
	expect(result.errMsg).toBe('Failed to fetch')
	expect(result.data).toBe(undefined)
})

test('bad request', async () => {
	// mock fetch
	const mockJsonPromise = Promise.resolve({
		data: 'BAD REQUEST'
	})
	const mockFetchPromise = Promise.resolve({
		ok: false,
		status: 400,
		json: () => mockJsonPromise
	})
	const globalRef: any = global
	globalRef.fetch = jest.fn().mockImplementation(() => mockFetchPromise)

	const host = 'http://test.example.com'
	const mtaFetch = new MtaFetch({
		host,
		apis: {
			test: {
				url: '/test',
				method: 'get',
				errMsgs: {
					400: 'bad request'
				}
			}
		}
	})
	const result = await mtaFetch.send({
		type: 'test'
	})

	expect(result.ok).toBe(false)
	expect(result.status).toBe(400)
	expect(result.errMsg).toBe('bad request')
	expect(result.data.data).toBe('BAD REQUEST')
})
