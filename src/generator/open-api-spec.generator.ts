import {RapidConfig} from "../types/rapid-config";
import {OpenApiSpec} from "../types/openapi-spec";
import {RapidEndpoint} from "../types/rapid-endpoints";

export class OpenApiSpecGenerator {
	static generateOpenApiSpec(config: RapidConfig): OpenApiSpec {
		return {
			openapi: "3.0.0",
			servers: [
				{
					url: "http://localhost:" + config.port + config.prefix,
					description: "Local development server"
				}
			],
			info: {
				title: config.name,
				version: "1.0.0",
			},
			tags: config.endpoints.map(endpoint => {
				return {
					name: endpoint.name,
					description: "Endpoint for " + endpoint.name
				}
			}),
			paths: this.mergeAllPaths(config),
			components: {
				schemas: this.createSchemaForEndpoints(config)
			}
		}
	}
	
	private static mergeAllPaths(config: RapidConfig): any {
		let paths = {} as any
		
		for (const endpoint of config.endpoints) {
			const endpointPaths = OpenApiSpecGenerator.generatePathsForEndpoint(endpoint)
			paths = {...paths, ...endpointPaths}
		}
		
		return paths
	}
	
	private static generatePathsForEndpoint(endpoint: RapidEndpoint) {
		let path = "/" + endpoint.name;
		let paths = {} as any;
		
		const createPathDefinition = (
				method: string,
				summary: string,
				hasId: boolean = false,
				hasRequestBody: boolean = false,
				requestBodySchema?: string,
				successResponseCode: number = 200
		) => {
			const fullPath = hasId ? `${path}/{id}` : path;
			if (!paths[fullPath]) paths[fullPath] = {};
			
			paths[fullPath][method.toLowerCase()] = {
				summary,
				description: summary,
				tags: [endpoint.name],
				...(hasId
						? {
							parameters: [
								{
									name: "id",
									in: "path",
									required: true,
									description: `The id of the ${endpoint.name}`,
								},
							],
						}
						: {}),
				...(hasRequestBody
						? {
							requestBody: {
								content: {
									"application/json": {
										schema: {
											$ref: `#/components/schemas/${requestBodySchema}`,
										},
									},
								},
							},
						}
						: {}),
				responses: {
					...(successResponseCode === 200 ? {
						"200": {
							description: "Successful request",
							content: {
								"application/json": {
									...(method === "GET" ? {
										schema: {
											$ref: `#/components/schemas/${endpoint.name}-array`,
										}
									} : {
										schema: {
											$ref: `#/components/schemas/${endpoint.name}`
										}
									}),
								},
							},
						},
					} : {}),
					...(successResponseCode === 201 ? {
						"201": {
							description: "Successful request",
							content: {
								"application/json": {
									schema: {
										$ref: `#/components/schemas/${endpoint.name}`,
									},
								},
							},
						},
					} : {}),
					...(successResponseCode === 204 ? {
						"204": {
							description: "Successful request",
						},
					} : {}),
					"404": {
						description: "Error Message",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										error: {
											type: "string",
											description: "The error message",
										}
									},
								},
							},
						},
					},
				},
			};
		};
		
		for (const method of endpoint.methods) {
			switch (method) {
				case"GET":
					createPathDefinition("GET", `Get all ${endpoint.name}`);
					break;
				case"GET_BY_ID":
					createPathDefinition("GET", `Get ${endpoint.name} by id`, true);
					break;
				case"POST":
					createPathDefinition("POST", `Create new ${endpoint.name}`, false, true, endpoint.name, 201);
					break;
				case"PUT":
					createPathDefinition("PUT", `Update ${endpoint.name}`, true, true, endpoint.name);
					break;
				case"PATCH":
					createPathDefinition("PATCH", `Update ${endpoint.name}`, true, true, `${endpoint.name}-single-attribute-example`);
					break;
				case"DELETE":
					createPathDefinition("DELETE", `Delete ${endpoint.name}`, true, false, undefined, 204);
					break;
				default:
					throw new Error(`Unknown method ${method} in config file`);
			}
		}
		
		return paths;
	}
	
	private static createSchemaForEndpoint(endpoint: RapidEndpoint) {
		let objectReferenceTypes: { [key: string]: { type: string } } = {};
		Object.keys(endpoint.objectReference).forEach(key => {
			// @ts-ignore
			objectReferenceTypes[key] = {type: typeof endpoint.objectReference[key]};
			
			// @ts-ignore
			if (Array.isArray(endpoint.objectReference[key])) {
				objectReferenceTypes[key] = {type: "array"};
			}
		});
		
		const schema = {
			type: "object",
			properties: {
				id: {
					type: "number",
					description: "The id of the object"
				},
				...objectReferenceTypes
			},
		}
		
		const firstObjectAttribute = Object.keys(endpoint.objectReference)[0];
		const singleAttributeSchema = {
			type: "object",
			properties: {
				[firstObjectAttribute]: objectReferenceTypes[firstObjectAttribute],
			}
		}
		
		return {
			[endpoint.name]: schema,
			[`${endpoint.name}-array`]: {
				type: "array",
				items: {
					$ref: `#/components/schemas/${endpoint.name}`
				}
			},
			[`${endpoint.name}-single-attribute-example`]: singleAttributeSchema
		};
	}
	
	private static createSchemaForEndpoints(config: RapidConfig) {
		let schemas = {} as any;
		
		for (const endpoint of config.endpoints) {
			const schema = this.createSchemaForEndpoint(endpoint);
			schemas = {...schemas, ...schema};
		}
		
		return schemas;
	}
}