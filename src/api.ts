import express, { Express, Request, Response } from 'express';
import * as fs from 'fs';
import { objects } from '../objects/api-objects';
import { GenerateEndpointUtils } from './utils/GenerateEndpointUtils';

export const runApi = () => {
    const config_data = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

    const app: Express = express();

    const port = config_data["port"]
    if (port == undefined) { throw Error("Port couldn't be found inside the config.json") }

    const api_name = config_data["name"]
    if (api_name == undefined) { throw Error("Name couldn't be found inside the config.json") }

    const endpoints = config_data["endpoints"]
    if (endpoints == undefined) { throw Error("Endpoints couldn't be found inside the config.json") }

    for(let endpoint of endpoints) {
        const endpoint_name = endpoint["name"]
        if (endpoint_name == undefined) {
            throw Error("Endpoint name couldn't be found inside one of the endpoints in the config.json")
        }

        const endpoint_methods = endpoint["methods"]
        if (endpoint_methods == undefined) {
            throw Error("Endpoint methods couldn't be found inside the endpoint " + endpoint_name)
        }

        const object_name = endpoint["object"]
        if (object_name == undefined) {
            throw Error("Object name couldn't be found inside the endpoint " + endpoint_name)
        }

        // @ts-ignore
        const object_class = objects[object_name]
        if (object_class == undefined) {
            throw Error("Object class with the name " + object_name + " couldn't be found inside the api-objects.ts")
        }

        console.log("Endpoint: " + endpoint_name)
        console.log("Methods: " + endpoint_methods)
        console.log("Object: " + object_name)
        console.log("Class: " + object_class)

        for(let method of endpoint_methods) {
            GenerateEndpointUtils.buildEndpoint(method, app, endpoint_name, object_class)
        }
    }

    app.listen(port, () => {
        console.log(`🪐 [${api_name}]: Server is running at http://localhost:${port}`);
    });
}
