# mta-fetch

[![Build and Lint](https://github.com/nayotta/mta-fetch/actions/workflows/build.yml/badge.svg)](https://github.com/nayotta/mta-fetch/actions/workflows/build.yml)

> a simple browser fetch module.

## example

```js
const MtaFetch = require('@nayotta/mta-fetch')

const mtaFetch = new MtaFetch({
	host: 'http://example.com',
	apis: {
		signin: {
			url: '/v1/signin',
			method: 'post'
		},
		getInfo: {
			url: '/v1/books/type/:id',
			method: 'get'
		}
	},
	errMsgs: {
		signin: {
			200: 'signin success',
			401: 'unauthorization',
			500: 'sever error'
		}
	}
})

mtaFetch.send({
	type: 'signin',
	// default content-type is application/json
	// form-data can be set by format argument
	data: {
		username: 'username',
		password: 'password'
	}
}).then(res => {
	const { ok, status, errMsg, data } = res
	console.log(ok, status, errMsg, data)
})


mtaFetch.send({
	type: 'getInfo',
	urlParams: {
		id: 'info_id'
	},
	query: {
		search: 'keyword'
	},
	errMsg: {
		200: 'success',
		400: 'bad request',
		401: 'unauthorization',
		404: 'not found',
		500: 'server error'
	}
}).then(res => {
	const { ok, status, errMsg, data } = res
	console.log(ok, status, errMsg, data)
})
```
