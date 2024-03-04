import {GraphQLObjectType, GraphQLString, GraphQLBoolean} from "graphql"

import JsonData from "./jsondata.js"

export default new GraphQLObjectType({
	name: "Response",
	description: "Объект с результатами запросов",
	fields: () => ({
		code: {
			type: GraphQLString,
		},
		message: {
			type: GraphQLString,
		},
		result: {
			type: GraphQLBoolean
		},
		data: {
			type: JsonData
		}
	})
})