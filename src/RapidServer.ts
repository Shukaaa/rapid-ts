import express, {Express} from 'express';
import {objects} from '../objects/api-objects';
import {GenerateEndpointUtils} from './utils/GenerateEndpointUtils';
import bodyParser from "body-parser";
import {JsonFileService} from "./services/JsonFileService";
import {IdStore} from "./stores/IdStore";

export class RapidServer {
    app: Express = express();
    server: any;
    name: string = "";

    constructor() {
        const config_data = JsonFileService.readJsonFile("./config.json");

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))

        IdStore.check()

        let port = config_data["port"]
        if (port == undefined) {
            console.log("Port couldn't be found inside the config.json, so it will be set to 3000")
            port = 3000
        }

        let prefix = config_data["prefix"]
        if (prefix == undefined) {
            console.log("Prefix couldn't be found inside the config.json, so it will be set to nothing")
            prefix = ""
        }

        const name = config_data["name"]
        if (name == undefined) {
            throw Error("Api name couldn't be found inside the config.json")
        }
        this.name = name

        const endpoints = config_data["endpoints"]
        if (endpoints == undefined) {
            throw Error("Endpoints couldn't be found inside the config.json")
        }

        let endpoint_names: string[] = []
        for (let endpoint of endpoints) {
            IdStore.get(endpoint["name"])

            const endpoint_name = endpoint["name"]
            if (endpoint_name == undefined) {
                throw Error("Endpoint name couldn't be found inside one of the endpoints in the config.json")
            }

            endpoint_names.push(endpoint_name)

            if (!JsonFileService.exists(`./storage/${endpoint_name}.json`)) {
                JsonFileService.writeJsonFile(`./storage/${endpoint_name}.json`, {data: []})
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

            const hasId = endpoint["hasId"]
            if (hasId == undefined) {
                throw Error("hasId couldn't be found inside the endpoint " + endpoint_name)
            }

            for (let method of endpoint_methods) {
                GenerateEndpointUtils.buildEndpoint(method, this.app, endpoint_name, object_class, hasId, prefix)
            }
        }

        this.createStartPage(prefix, endpoint_names, this.name)
        this.server = this.listen(port, this.name, prefix)
    }

    private listen(port: number, api_name: string, prefix: string) {
        return this.app.listen(port, () => {
            console.log(`🪐 [${api_name}]: Server is running at http://localhost:${port}${prefix}`);
        });
    }

    private createStartPage(prefix: string, endpoint_names: string[], api_name: string) {
        this.app.get(prefix, (req, res) => {
            res.send(`
                <head>
                    <style>
                        body {
                            font-family: sans-serif;
                        }
                    </style>
                    <title>${api_name}</title>
                </head>
                <h1>${api_name} is running!</h1>
                <p>created by: <a href="https://github.com/Shukaaa/rapid-ts">RAPID-ts</a></p>
                
                <h2>Endpoints</h2>
                <ul>
                    ${endpoint_names.map(endpoint => `<li><a href="${prefix}/${endpoint}">${prefix}/${endpoint}</a></li>`).join("\n")}
                </ul>`)
        });
    }

    public close() {
        console.log(`🪐 [${this.name}]: Server is closing...`)
        this.server.close()
    }
}