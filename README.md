# 🪐 rapid-ts 🪐

> **WARNING:**
> The project is new and under permanent development and may still be buggy. Please report any issues you find.

![top language badge](https://img.shields.io/github/languages/top/shukaaa/rapid-ts) ![npm (scoped)](https://img.shields.io/npm/v/@rapid-api/rapid-ts) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/shukaaa/rapid-ts) ![npm downloads](https://img.shields.io/npm/dm/@rapid-api/rapid-ts)

## Description

The "@rapid-api/rapid-ts" package allows you to quickly create a REST API based on JSON configurations and small js / ts. The API stores data locally in a folder. It is designed to generate small, performant, and stable APIs for testing or as mock APIs. Please note that this solution is not intended to be a 100% secure or production-ready API. It is well-suited for private projects.

## Installation

To install the package via npm, run the following command:

```shell
npm install @rapid-api/rapid-ts
```

## Usage

### Step 1: Create Configuration File

Create a configuration file named "config.rapid.json". In this file, you can define information about your API. The properties in the JSON file have the following meanings:

- `"name"`: The name of your API. This will be used for identification purposes.
- `"port"`: The port number on which your API will listen for incoming requests. (default: 3000)
- `"prefix"`: The URL prefix to be added before the API endpoints. For example, if the prefix is "/api", then the endpoint "test" will be accessible via "/api/test". (default: /api/v1)
- `"endpoints"`: An array containing the definitions of your API endpoints.

Each endpoint definition within the `"endpoints"` array should have the following properties:

- `"name"`: The name of the endpoint. This will be used for identification purposes.
- `"methods"`: An array of HTTP methods that the endpoint supports (e.g., "GET", "POST", "PUT", etc.).
- `"object"`: The name of the rapid object associated with the endpoint. This specifies the structure of the data for that endpoint.
- `"hasId"`: A boolean value indicating whether the endpoint's objects have an ID property.

Here is an example content of the "config.rapid.json" file:

```json
{
    "name": "students-api",
    "port": 3000,
    "prefix": "/api",
    "endpoints": [
        {
            "name": "students",
            "methods": [
                "GET",
                "GET_BY_ID",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ],
            "object": "student",
            "hasId": true
        }
    ]
}
```

### Step 2: JavaScript Code

In your JavaScript code, import the necessary modules and define your rapid objects and server. The code snippet below demonstrates how to use the package:

```javascript
import { getRapidObjectClass, RapidServer } from '@rapid-api/rapid-ts';

// Define the rapid objects based on your configuration
const rapid_objects = {
    student: getRapidObjectClass({
        id: 0,
        name: "John Doe",
        age: 20,
        isMale: true,
        subjects: ["Math", "Science", "History"]
    })
};

// Create a new instance of the RapidServer with the configuration file and rapid objects
const rapid_server = new RapidServer("./config.rapid.json", rapid_objects);

// Start the server
rapid_server.start();
```

### Manipulating Data in POST/PUT/PATCH Requests
You can manipulate the data during POST, PUT, or PATCH requests by providing a callback function as the second argument to the getRapidObjectClass function. This callback function will receive the data sent in the request, and you can perform any desired modifications or access the data within the function. Here's an updated example:

```javascript
import { getRapidObjectClass, RapidServer } from '@rapid-api/rapid-ts';

// Define the rapid objects based on your configuration
const rapid_objects = {
    student: getRapidObjectClass({
        id: 0,
        name: "John Doe",
        age: 20,
        isMale: true,
        subjects: ["Math", "Science", "History"]
    }, (data) => {
        console.log("Received Data", data)
        data.name = data.name.toUpperCase();
    })
};

// Create a new instance of the RapidServer with the configuration file and rapid objects
const rapid_server = new RapidServer("./config.rapid.json", rapid_objects);

// Start the server
rapid_server.start();
```

### Adding Endpoints at Runtime

The "@rapid-api/rapid-ts" package provides two methods to add endpoints dynamically during runtime.

#### Method 1: addRapidEndpoint()

The `addRapidEndpoint()` method allows you to add endpoints based on the same schema as defined in the JSON configuration file. Here's an example code snippet:

```javascript
const { getRapidObjectClass } = require('@rapid-api/rapid-ts');

rapid_server.addRapidEndpoint({
    name: "dynamicRapid",
    methods: [
        "GET",
        "POST"
    ],
    object: "dynamic",
    hasId: false
}, getRapidObjectClass({
    text: "text"
}));
```

In this example, a new endpoint named "dynamicRapid" is added with the specified HTTP methods, object structure, and ID flag. The `getRapidObjectClass()` function is used to define the structure of the associated object.

#### Method 2: addExpressEndpoint()

Since "@rapid-api/rapid-ts" is built on top of Express.js, you can also add custom Express endpoints using the `addExpressEndpoint()` method. Here's an example code snippet:

```javascript
rapid_server.addExpressEndpoint({
    name: "dynamic",
    method: "GET"
}, (req, res) => {
    res.send("Custom Express Endpoint");
});
```

In this example, a new Express endpoint is added with the specified name and HTTP method. The provided callback function handles the request and response logic for that endpoint.

### Additional Features

- To stop the server, you can use the `rapid_server.stop()` method.
- To restart the server, you can use the `rapid_server.restart()` method (be aware that dynamically added endpoints are gone).

### TypeScript Support

This package provides TypeScript typings and can be used in TypeScript projects as well.
