# 🪐 rapid-ts 🪐

![top language badge](https://img.shields.io/github/languages/top/shukaaa/rapid-ts) ![npm (scoped)](https://img.shields.io/npm/v/@rapid-api/rapid-ts) ![npm downloads](https://img.shields.io/npm/dt/@rapid-api/rapid-ts)

## Description

The "@rapid-api/rapid-ts" package allows you to quickly create a REST API with small js / ts. The API stores data locally in a folder. It is designed to generate small, and performant APIs for testing or as mock APIs. Please note that this solution is not intended to be a 100% secure or production-use API. It is well-suited for very small or private projects.

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
            object: "student", // The name of the rapid object associated with the endpoint. This specifies the structure of the data for that endpoint.
            hasId: true // A boolean value indicating whether the endpoint's objects have an ID property.
        }
    ],
    overviewPage: { // An object containing the configuration for the overview page
        enable: true, // A boolean value indicating whether the overview page should be enabled
        theme: "LIGHT" // The theme of the overview page ("LIGHT" or "DARK")
    }
}
```

### Step 2: Object Structure

Here is an example content of the object structure:

```js
import { getRapidObjectClass } from '@rapid-api/rapid-ts';

const rapid_objects = {
    student: getRapidObjectClass({ // The name of the object you defined in the config object (in this case, "student")
        id: 0, // The ID of the object. This is required if the endpoint hasId is set to true.
        name: "John Doe", // A string property
        age: 20, // A number property
        isMale: true, // A boolean property
        subjects: [ // An array property
            "Math",
            "Science",
            "History"
        ]
    })
}
```

> You can't distinguish between float and integer values, because only JavaScript's datatypes are supported.

### Step 3: Create RapidServer Instance

Here is an example code snippet:

```js
import { RapidServer, getRapidObjectClass } from '@rapid-api/rapid-ts';

const rapid_server = new RapidServer(options, rapid_objects);
rapid_server.start();
```

### Manipulating Data in POST/PUT/PATCH Requests
You can manipulate the data during POST, PUT, or PATCH requests by providing a callback function as the second argument to the getRapidObjectClass function. This callback function will receive the data sent in the request, and you can perform any desired modifications or access the data within the function. Here's an updated example:

```javascript
const rapid_objects = {
    student: getRapidObjectClass({ // The name of the object you defined in the config object (in this case, "student")
        id: 0, // The ID of the object. This is required if the endpoint hasId is set to true.
        name: "John Doe", // A string property
        age: 20, // A number property
        isMale: true, // A boolean property
        subjects: [ // An array property
            "Math",
            "Science",
            "History"
        ]
    }, (data) => { // The callback function
        console.log("Received Data", data)
        data.name = data.name.toUpperCase();
    })
}
```

### Adding Endpoints at Runtime

The "@rapid-api/rapid-ts" package provides two methods to add endpoints dynamically during runtime.

#### Method 1: addRapidEndpoint()

The `addRapidEndpoint()`:

```javascript
rapid_server.addRapidEndpoint({
    name: "dynamicRapid",
    methods: [
        "GET",
        "POST"
    ],
    object: "dynamic", // The name of the object is unecessary, because the object is defined in the second argument
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
