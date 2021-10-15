export type TMtaFetchMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'
	|'get'|'post'|'put'|'patch'|'delete'

export interface IMtaFetchApis {
	[key: string]: {
		url: string
		method: TMtaFetchMethod
		withoutToken?: boolean
	}
}

export interface IMtaFetchErrorMsgs {
	[key: string]: {
		[status: number]: string
	}
}

export interface IMtaFetchSendResult {
	status: number
	ok: boolean
	errMsg: string
	data: any
}

export default class MtaFetch {
	private _host: string = ''
	private _token: string = ''
	private _apiMap: IMtaFetchApis = {}
	private _errMsgs: IMtaFetchErrorMsgs = {}

	constructor (option: {
		host: string,
		apis: IMtaFetchApis,
		errMsgs: IMtaFetchErrorMsgs,
		token?: string
	}) {
		const { host, token, apis, errMsgs } = option
		if (host) this._host = host
		if (token) this._token = token
		if (apis) this._apiMap = apis
		if (errMsgs) this._errMsgs = errMsgs
	}

	public computeWholeUrl (options: {
		url: string,
		urlParams: { [key: string]: string|number|boolean },
		query: { [key: string]: string|number|boolean }
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
		type: string,
		urlParams?: { [key: string]: string|number|boolean },
		query?: { [key: string]: any },
		data?: { [key: string]: any },
		formData?: boolean,
		headers?: {
			[key: string]: any
		},
		errMsg?: {
			[status: number]: string
		}
	}): Promise<IMtaFetchSendResult> {
		try {
			const { type, urlParams = {}, query = {}, data = {}, formData = false, headers = {}, errMsg } = option
			const { _host, _apiMap, _errMsgs, _token } = this
			if (!_apiMap[type]) {
				return {
					status: 0,
					ok: false,
					errMsg: `type [${type}] is not in apis`,
					data: undefined
				}
			}
			const { url: theUrl = '', method, withoutToken } = _apiMap[type]

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
			if (!withoutToken) {
				fetchHeaders.Authorization = _token
			}

			const fetchInit: RequestInit = {
				method,
				headers: fetchHeaders,
				body
			}
			// Request with GET/HEAD method cannot have body
			if (['GET', 'HEAD'].includes(method)) delete fetchInit.body
			const res = await fetch(wholeUrl, fetchInit).catch((err: Error) => err)
			if (res instanceof Error) {
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
				errMsg: errMsg && errMsg[status] ? errMsg[status] : _errMsgs[type][status] || '',
				data: resData
			}
		} catch (err) {
			const error = err as Error
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

	public setApis (apis: IMtaFetchApis) {
		this._apiMap = apis
	}

	public getErrMsgs () {
		return this._errMsgs
	}

	public setErrMsgs (errMsgs: IMtaFetchErrorMsgs) {
		this._errMsgs = errMsgs
	}

	public getApiByType (type: string) {
		return this._apiMap[type]
	}

	public setApiByType (type: string, api: {
		url: string
		method: TMtaFetchMethod
		withoutToken?: boolean
	}) {
		this._apiMap = {
			...this._apiMap,
			[type]: api
		}
	}

	public getErrMsgByType (type: string) {
		return this._errMsgs[type]
	}

	public setErrMsgByType (type: string, errMsg: {
		[status: number]: string
	}) {
		this._errMsgs = {
			...this._errMsgs,
			[type]: errMsg
		}
	}
}
