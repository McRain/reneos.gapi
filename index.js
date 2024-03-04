import { graphql, GraphQLSchema, GraphQLObjectType } from "graphql"

import * as Models from './models/index.js'

let _schema, _queries = {}, _mutations = {}, _subscription = {}

class Api {

	static get Schema() {
		return _schema
	}

	static CookieHandler(context, result) {
		result.cookie = context.cookie
	}

	static PreHandler(handler) {
		_before.push(handler)
	}

	static PostHandler(handler) {
		_after.push(handler)
	}

	static Add(op, values) {
		if(op.toLowerCase().startsWith('q'))
		{
			_queries = {
				..._queries,
				...values
			}
		}else if(op.toLowerCase().startsWith('m')){
			_mutations = {
				..._mutations,
				...values
			}
		}else{
			_subscription = {
				..._subscription,
				...values
			}
		}
	}

	static async Exec(query, time, user, ip) {
		const dn = Date.now()
		const contextValue = { user, ip, time }
		await Promise.all(_before.map(h => h(contextValue)))

		//change in version 0.0.5
		let result
		try {
			result = await graphql({
				schema:_schema,
				source:query,
				contextValue
			})
		} catch (e) {
			result = {
				errors:[e],
				data: {
					error: { code: 500 }
				}
			}
		}
		if(result.errors){
			let code = 500
			result.errors.forEach(er=>{
				const c = er.originalError?.code
				console.warn(`${new Date().toLocaleString()} : ${er.path?er.path.join('.'):''} : (${c}) ${er.message}`)
				code = c || 500
			})
			const last = result.errors.at(-1) || {}
			result.data = {
				error:{
					code:code || 500,
					message:last.message
				}
			}
		}

		//---END
		
		await Promise.all(_after.map(h => h(contextValue, result, dn)))
		result.data.time = Date.now() - dn
		return result
	}

	static async Route(request, responce) {
		const query = request.body.query
		if (!query)
			return {}
		const { data, cookie } = await Api.Exec(query, request.time || Date.now(), request.user || {}, request.remoteIp)
		responce.cookie = cookie
		return { data }
	}

	static BuildSchema() {
		try {
			_schema = new GraphQLSchema({
				query: new GraphQLObjectType({
					name: "Query",
					description: "QueryAPI",
					fields: () => _queries
				}),
				mutation: new GraphQLObjectType({
					name: "Mutation",
					description: "MutationAPI",
					fields: () => _mutations
				}),
				/*subscription: new GraphQLObjectType({
					name: "Subscription",
					description: "SubscriptionAPI",
					fields: () => _subscription
				}),*/
				extensions: {}
			})
		} catch (error) {
			console.log(error.message)
		}
	}
}

const _before = [], _after = [Api.CookieHandler]

export { Api, Models }