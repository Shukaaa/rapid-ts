# 🪐 rapid-ts 🪐

![top language badge](https://img.shields.io/github/languages/top/shukaaa/rapid-ts) ![npm (scoped)](https://img.shields.io/npm/v/@rapid-api/rapid-ts) ![npm downloads](https://img.shields.io/npm/dt/@rapid-api/rapid-ts)

## Description

The "@rapid-api/rapid-ts" package allows you to quickly create a REST API with tiny js/ts configurations. The API stores custom data locally in a folder. It is designed to generate small, and performant APIs for fast testing or as an API for quick projects.

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
    name: "students-api", // The name of your API. This will be used for identification purposes
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
                name: "", // A string property
                age: 0, // A number property
                isMale: true, // A boolean property
                subjects: [] // An array property
            },
            interceptCreations: (data, event) => { // Optional: A function that will be called when a new object is created (POST). It receives the data and the event as arguments.
                data.name = data.name.toLocaleUpperCase() // Event: { id: number }
            },
            interceptUpdates: (data, event) => { // Optional: A function that will be called when an object is updated (PUT or PATCH). It receives the data and the event as arguments.
                console.group(data, event) // Event: { method: 'PUT' | 'PATCH', id: number }
            }
        }
    ],
    overviewPage: { // An object containing the configuration for the overview page
        enable: true, // A boolean value indicating whether the overview page should be enabled
        theme: "LIGHT" // The theme of the overview page ("LIGHT" or "DARK")
    }
}
```

### Step 2: Create RapidServer Instance

Here is an example code snippet:

```js
import { RapidServer } from '@rapid-api/rapid-ts';

const rapidServer = new RapidServer(options);
rapidServer.start();
```

### Additional Features

- To stop the server, you can use the `rapidServer.stop()` method.
- To restart the server, you can use the `rapidServer.restart()` method (be aware that dynamically added endpoints are gone).
