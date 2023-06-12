import { Express } from 'express';
import {ErrorUtils} from "./ErrorUtils";
import {IdStore} from "../stores/IdStore";
import {JsonFileService} from "../services/JsonFileService";

export class GenerateEndpointUtils {
    public static buildEndpoint(method: string, app: Express, name: string, object_class: any, hasID: boolean, prefix: string) {
        let path: string = `./storage/${name}.json`
        let endpoint_name: string = prefix + "/" + name

        switch (method) {
            case "GET":
                app.get(endpoint_name, (req, res) => {
                    res.json(JsonFileService.readJsonFile(path))
                })

                if (hasID) {
                    app.get(endpoint_name + "/:id", (req, res) => {
                        const id = req.params.id
                        let jsonFile = JsonFileService.readJsonFile(path)

                        for(let i = 0; i < jsonFile.length; i++) {
                            if (jsonFile[i]["id"] == id) {
                                res.json(jsonFile[i])
                                return
                            }
                        }

                        ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                    })
                }
                break;

            case "POST":
                app.post(endpoint_name, (req, res) => {
                    let jsonFile = JsonFileService.readJsonFile(path)
                    let body = req.body
                    let object_for_datacheck = new object_class({}).object_for_datacheck

                    // Check if the datatype are correct
                    for (let property in body) {
                        if (typeof body[property] != typeof object_for_datacheck[property]) {
                            ErrorUtils.jsonThrow("The property " + property + " is not of the type " + typeof new object_class({}).object_for_datacheck[property], res)
                            return
                        }
                    }

                    let object = new object_class(body)

                    if (hasID) {
                        let id = IdStore.get(name)
                        IdStore.set(name, id + 1)

                        object.object.id = id + 1
                    }

                    // Check if the object has all the properties
                    for (let property in object.object) {
                        if (object.object[property] == undefined) {
                            ErrorUtils.jsonThrow("The property " + property + " is undefined", res)
                            return
                        }
                    }

                    jsonFile.data.push(object.object)
                    JsonFileService.writeJsonFile(path, jsonFile)

                    res.status(201).json(object.object)
                })
                break;

            case "PUT":
                if (!hasID) {
                    throw Error("PUT method is not allowed for " + name + " because it doesn't have an id")
                }

                app.put(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = JsonFileService.readJsonFile(path)
                    let body = req.body
                    let object_for_datacheck = new object_class({}).object_for_datacheck

                    // Check if the datatype are correct
                    for (let property in body) {
                        if (typeof body[property] != typeof object_for_datacheck[property]) {
                            ErrorUtils.jsonThrow("The property " + property + " is not of the type " + typeof new object_class({}).object_for_datacheck[property], res)
                            return
                        }
                    }

                    let object = new object_class(body)
                    object.object.id = id

                    // Check if the object has all the properties
                    for (let property in object.object) {
                        if (object.object[property] == undefined) {
                            ErrorUtils.jsonThrow("The property " + property + " is undefined", res)
                            return
                        }
                    }

                    // replace the object with the same id
                    for (let i = 0; i < jsonFile.data.length; i++) {
                        if (jsonFile.data[i]["id"] == object.object.id) {
                            jsonFile.data[i] = object.object
                            JsonFileService.writeJsonFile(path, jsonFile)

                            res.json(object.object)
                            return
                        }
                    }
                })
                break;

            case "DELETE":
                app.delete(endpoint_name + "/:id", (req, res) => {
                    const id = req.params.id
                    let jsonFile = JsonFileService.readJsonFile(path)

                    for(let i = 0; i < jsonFile.data.length; i++) {
                        if (jsonFile.data[i]["id"] == id) {
                            jsonFile.data.splice(i, 1)
                            JsonFileService.writeJsonFile(path, jsonFile)

                            res.status(204).send()
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "PATCH":
                app.patch(endpoint_name, (req, res) => {
                    res.send("PATCH")
                })
                break;
        
            default:
                throw new Error("Unknown method " + method + " in config file")
        }
    }
}