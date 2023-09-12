import { Express } from 'express';
import {ErrorUtils} from "./error.utils";
import {IdStore} from "../stores/id.store";
import {JsonFileService} from "../services/json-file.service";

export class GenerateEndpointUtils {
    public static buildEndpoint(method: string, app: Express, name: string, object_class: any, hasID: boolean, prefix: string) {
        let path: string = `./storage/${name}.json`
        let endpoint_name: string = prefix + "/" + name

        switch (method) {
            case "GET":
                app.get(endpoint_name, (req, res) => {
                    res.json(JsonFileService.readJsonFile(path))
                })
                break;

            case "GET_BY_ID":
                if (!hasID) {
                    throw Error("GET_BY_ID method is not allowed for " + name + " because it doesn't have an id")
                }

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
                break;

            case "POST":
                app.post(endpoint_name, (req, res) => {
                    let jsonFile = JsonFileService.readJsonFile(path)
                    let body = req.body
                    let object_for_datacheck = new object_class({}).object_for_datacheck

                    if (!this.datatypeChecks(body, object_class, object_for_datacheck, res)) {
                        return;
                    }

                    let object = new object_class(body)

                    if (hasID) {
                        let id = IdStore.get(name)
                        IdStore.set(name, id + 1)

                        object.object.id = id + 1
                    }

                    if (!this.undefinedChecks(object, object_for_datacheck, res)) {
                        return;
                    }

                    jsonFile.push(object.object)
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

                    if (!this.datatypeChecks(body, object_class, object_for_datacheck, res)) {
                        return;
                    }

                    let object = new object_class(body)
                    object.object.id = id

                    if (!this.undefinedChecks(object, object_for_datacheck, res)) {
                        return;
                    }

                    // replace the object with the same id
                    for (let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] == object.object.id) {
                            jsonFile[i] = object.object
                            JsonFileService.writeJsonFile(path, jsonFile)

                            res.json(object.object)
                            return
                        }
                    }
                })
                break;

            case "DELETE":
                if (!hasID) {
                    throw Error("DELETE method is not allowed for " + name + " because it doesn't have an id")
                }

                app.delete(endpoint_name + "/:id", (req, res) => {
                    const id = +req.params.id
                    let jsonFile = JsonFileService.readJsonFile(path)

                    for(let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] == id) {
                            jsonFile.splice(i, 1)
                            JsonFileService.writeJsonFile(path, jsonFile)

                            res.status(204).send()
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "PATCH":
                if (!hasID) {
                    throw Error("PATCH method is not allowed for " + name + " because it doesn't have an id")
                }

                app.patch(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = JsonFileService.readJsonFile(path)
                    let body = req.body
                    let object_for_datacheck = new object_class({}).object_for_datacheck

                    jsonFile.forEach((object: any) => {
                        if (object["id"] == id) {
                            for (let property in body) {
                                if (typeof body[property] != typeof object_for_datacheck[property]) {
                                    ErrorUtils.jsonThrow("The property " + property + " is not of the type " + typeof new object_class({}).object_for_datacheck[property], res)
                                    return
                                }

                                object[property] = body[property]
                            }

                            JsonFileService.writeJsonFile(path, jsonFile)
                            res.json(object)
                            return
                        }
                    })
                })
                break;
        
            default:
                throw new Error("Unknown method " + method + " in config file")
        }
    }

    private static undefinedChecks(object: any, object_for_datacheck: any, res: any) {
        for (let property in object.object) {
            if (object.object[property] == undefined) {
                ErrorUtils.jsonThrow("The property " + property + " is undefined", res)
                return false
            }
        }

        for (const key in object_for_datacheck) {
            if (!object.object.hasOwnProperty(key)) {
                ErrorUtils.jsonThrow("The property " + key + " is not defined", res)
                return false
            }
        }

        return true
    }

    private static datatypeChecks(body: any, object_class: any, object_for_datacheck: any, res: any) {
        for (let property in body) {
            if (new object_class({}).object_for_datacheck[property] == undefined) {
                ErrorUtils.jsonThrow("The property " + property + " is not defined", res)
                return false
            }

            if (typeof body[property] != typeof object_for_datacheck[property]) {
                ErrorUtils.jsonThrow("The property " + property + " needs to be type of " + typeof new object_class({}).object_for_datacheck[property], res)
                return false
            }
        }

        return true
    }
}
