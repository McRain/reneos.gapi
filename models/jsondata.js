import { GraphQLScalarType, Kind } from "graphql"

function parseObject(v) {
	const result = {};
	v.fields.forEach(f => {
		result[f.name.value] = parseVal(f.value)
	});
	return result;
}

function parseArray(v) {
	const result = [v.length];
	for(let i=0;i<v.length;i++){
		result[i] = parseVal(v[i])
	}
	return result;
}

function parseVal(value) {
	switch (value.kind) {
		case Kind.INT:
			return parseInt(value.value)
		case Kind.FLOAT:
			return parseFloat(value.value);
		case Kind.BOOLEAN:
		case Kind.STRING:
		case Kind.ENUM:
			return value.value;
		case Kind.OBJECT:
			return parseObject(value)
		case Kind.NULL:
			return null;
		case Kind.LIST:
			return parseArray(value.values)

		default:
			return JSON.parse(value)
	}
}

export default new GraphQLScalarType({
	name: 'JsonData',
	serialize: value => {
		if (value.value && typeof value.value === "string")
			return JSON.parse(value.value);
		return value
	},
	parseValue: value => {
		if (value.value && typeof value.value === "string")
			return JSON.parse(value.value);
		return value
	},
	parseLiteral: parseVal
})