export interface IMetaFetchApi {
	url: string
	method: string
	withToken?: boolean,
	errMsgs?: {
		[status: number]: string
	}
}

export interface IMtaFetchSendResult {
	status: number
	ok: boolean
	errMsg: string
	data: any
}

export default class MtaFetch <T extends string | number | symbol> {
	private _host: string = ''
	private _token: string = ''
	private _apiMap: {
		// eslint-disable-next-line no-unused-vars
		[key in T]: IMetaFetchApi
	}

	constructor (option: {
		host: string,
		apis: {
			// eslint-disable-next-line no-unused-vars
			[key in T]: IMetaFetchApi
		},
		token?: string
	}) {
		const { host, token, apis } = option
		this._host = host
		this._apiMap = apis
		this._token = token || ''
	}

	public computeWholeUrl (options: {
		url: string,
		urlParams: { [key: string]: string | number | boolean },
		query: { [key: string]: string | number | boolean }
	}) {
		const { url = '', urlParams = {}, query = {} } = options
		let wholeUrl = url

		for (const key in urlParams) {
			const re = new RegExp(`:${key}`, 'g')
			wholeUrl = wholeUrl.replace(re, encodeURI(`${urlParams[key]}`))
		}

		if (Object.keys(query).length > 0) {
			wholeUrl += '?'
		}
		for (const key in query) {
			wholeUrl += `${key}=${query[key]}&`
		}

		return wholeUrl.replace(/&$/, '').replace(/\?$/, '')
	}

	public buildFormData (data: { [key: string]: any }) {
		const formData = new FormData()
		if (typeof data !== 'object') return formData

		for (const key in data) {
			formData.append(key, data[key])
		}

		return formData
	}

	public async send (option: {
		type: T,
		urlParams?: { [key: string]: string | number | boolean },
		query?: { [key: string]: any },
		data?: { [key: string]: any },
		formData?: boolean,
		headers?: {
			[key: string]: any
		},
		errMsgs?: {
			[status: number]: string
		}
	}): Promise<IMtaFetchSendResult> {
		try {
			const { type, urlParams = {}, query = {}, data = {}, formData = false, headers = {}, errMsgs } = option
			const { _host, _apiMap, _token } = this
			if (!_apiMap || !_apiMap[type]) {
				return {
					status: 0,
					ok: false,
					errMsg: `type [${type}] is not in apis`,
					data: undefined
				}
			}
			const { url: theUrl = '', method, withToken = false, errMsgs: defaultErrMsgs = {} } = _apiMap[type]

			const wholeUrl = this.computeWholeUrl({
				url: `${_host}${theUrl}`,
				urlParams,
				query
			})

			let body: BodyInit = JSON.stringify(data)
			const fetchHeaders: HeadersInit = {
				'Content-Type': 'application/json',
				...headers
			}
			// 是否为表单格式
			if (formData) {
				body = this.buildFormData(data)
				fetchHeaders['Content-Type'] = 'multipart/form-data'
			}
			// 是否需要携带token
			if (withToken) {
				fetchHeaders.Authorization = _token
			}

			const fetchInit: RequestInit = {
				method,
				headers: fetchHeaders,
				body
			}
			// Request with GET/HEAD method cannot have body
			if (['GET', 'get', 'HEAD', 'head'].includes(method)) delete fetchInit.body
			const res = await fetch(wholeUrl, fetchInit).catch((err: Error) => err)
			if (res instanceof Error) {
				console.error(res)
				return {
					status: -1,
					ok: false,
					errMsg: res.message,
					data: undefined
				}
			}
			const { status, ok } = res
			const resData = await res.json()
			return {
				status,
				ok,
				errMsg: errMsgs && errMsgs[status] ? errMsgs[status] : defaultErrMsgs[status] || '',
				data: resData
			}
		} catch (err) {
			const error = err as Error
			console.error(error)
			return {
				status: 0,
				ok: false,
				errMsg: error.message,
				data: undefined
			}
		}
	}

	public getHost () {
		return this._host
	}

	public setHost (host: string) {
		this._host = host
	}

	public getToken () {
		return this._token
	}

	public setToken (token: string) {
		this._token = token
	}

	public getApis () {
		return this._apiMap
	}

	public setApis (apis: {
		// eslint-disable-next-line no-unused-vars
		[key in T]: IMetaFetchApi
	}) {
		this._apiMap = apis
	}

	public getApiByType (type: T) {
		return this._apiMap[type]
	}
}
