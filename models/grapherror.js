import { GraphQLError } from "graphql"

class GraphError extends GraphQLError {
	constructor(code, message,log) {
			super(message ||  `Error ${code}`);
			super.code = code
			this.code = code
			this.log = log || message
	}
}

export default GraphError