export type OpenApiSpec = {
	openapi: string,
	servers: {
		url: string,
		description: string,
	}[],
	info: {
		title: string,
		version: string,
	},
	tags: {
		name: string,
		description: string,
	}[],
	paths: {},
	components: {
		schemas: {},
	}
}