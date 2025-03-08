# 🪐 rapid-ts 🪐

![top language badge](https://img.shields.io/github/languages/top/shukaaa/rapid-ts) ![npm (scoped)](https://img.shields.io/npm/v/@rapid-api/rapid-ts) ![npm downloads](https://img.shields.io/npm/dt/@rapid-api/rapid-ts)

## Description

`@rapid-api/rapid-ts` is a lightweight package for quickly creating REST APIs with minimal JS/TS configuration. It is specialized in CRUD operations and stores custom data locally in a folder. Designed for speed and efficiency, it enables the rapid development of small, high-performance APIs, making it ideal for fast testing or quick project setups.

## Installation

To install the package via npm, run the following command:

```shell
npm install @rapid-api/rapid-ts
```

## Usage

### Step 1: Configuration Object

Here is an example content of the config object:

```js
const options = {
	name: "school-api", // The name of your API. This will be used for identification purposes
	port: 3000, // The port number on which your API will listen for incoming requests (default: 3000)
	prefix: "/api", // The URL prefix to be added before the API endpoints. If the prefix is "/api", then the endpoint "test" will be accessible via "/api/test"
	endpoints: [ // An array containing the definitions of your API endpoints
		{
			name: "students", // The name of the endpoint. This will be used for identification purposes.
			methods: [ // An array of HTTP methods that the endpoint supports ("GET", "GET_BY_ID", "POST", "PUT", "PATCH", "DELETE").
				"GET",
				"GET_BY_ID",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			objectReference: { // An object containing the properties of the objects that will be stored in the endpoint.
				name: "string", // A string property
				age: "number", // A number property
				isClassRepresentative: "boolean", // A boolean property
				subjects: [ // An array property containing another objectReference
					{
						name: "string", // A string property
						grade: "number" // A number property
					}
				],
			},
			interceptCreations: (data, event) => { // Optional: A function that will be called when a new object is created (POST). It receives the data and the event as arguments.
				data.name = data.name.toUpperCase();
			},
			interceptUpdates: (data, event) => { // Optional: A function that will be called when an object is updated (PUT or PATCH). It receives the data and the event as arguments.
				data.age = data.age + 1;
			}
		},
		{
			name: "classes", // The name of the endpoint. This will be used for identification purposes.
			methods: [ // An array of HTTP methods that the endpoint supports ("GET", "GET_BY_ID", "POST", "PUT", "PATCH", "DELETE").
				"GET",
				"GET_BY_ID",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			],
			objectReference: { // An object containing the properties of the objects that will be stored in the endpoint.
				name: "string", // A string property
				students: ["id:students"], // An array property containing id references to objects in the "students" endpoint
			}
		}
	]
}
```

### Step 2: Create RapidServer Instance

Here is an example code snippet:

```js
import { RapidServer } from '@rapid-api/rapid-ts';

const rapidServer = new RapidServer(options);
rapidServer.start();
```

### Step 3: Test Your API

You can now test your API by visiting the following URL in your browser: `http://localhost:3000/api-spec`

This will display the API reference page, which contains information about the available endpoints and their methods.
You can also send requests to the API endpoints using the interface provided on the page.

### Additional Features

- To stop the server, you can use the `rapidServer.stop()` method.
- To restart the server, you can use the `rapidServer.restart()` method (be aware that dynamically added endpoints are gone).
