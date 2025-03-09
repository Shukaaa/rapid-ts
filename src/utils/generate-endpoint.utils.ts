import {Express} from 'express';
import {ErrorUtils} from "./error.utils";
import {IdStore} from "../stores/id.store";
import {FileUtils} from "./file.utils";
import {InterceptCreationsFn, InterceptUpdatesFn} from "../types/rapid-endpoints";
import {EnumStore} from "../stores/enum.store";
import {RapidConfig} from "../types/rapid-config";

export class GenerateEndpointUtils {
    public static buildEndpoint(
        method: string,
        app: Express,
        name: string,
        objectReference: any,
        config: RapidConfig,
        interceptCreations: InterceptCreationsFn | undefined,
        interceptUpdates: InterceptUpdatesFn | undefined
    ) {
        let path: string = `./storage/${name}.json`
        let endpoint_name: string = config.prefix + "/" + name

        switch (method) {
            case "GET":
                app.get(endpoint_name, (req, res) => {
                    res.json(FileUtils.readJsonFile(path))
                })
                break;

            case "GET_BY_ID":
                app.get(endpoint_name + "/:id", (req, res) => {
                    const id = req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    
                    const object = jsonFile.find((object: any) => object["id"] === +id)
                    if (object !== undefined) {
                        res.json(object)
                        return
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "POST":
                app.post(endpoint_name, (req, res) => {
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body

                    const latestId = IdStore.get(name)
                    const id = latestId + 1

                    if (!this.validateObject(body, objectReference, name+".", res)) {
                        return;
                    }
                    
                    if (interceptCreations !== undefined) interceptCreations(body, {id})

                    IdStore.set(name, id)
                    body['id'] = id

                    jsonFile.push(body)
                    FileUtils.writeJsonFile(path, jsonFile)

                    res.status(201).json(body)
                })
                break;

            case "PUT":
                app.put(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body
                    
                    if (!this.validateObject(body, objectReference, name+".", res)) {
                        return;
                    }
                    
                    if (interceptUpdates !== undefined) interceptUpdates(body, {id, method: "PUT"})

                    // replace the object with the same id
                    for (let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] === id) {
                            body.id = id
                            jsonFile[i] = body
                            FileUtils.writeJsonFile(path, jsonFile)

                            res.json(body)
                            return
                        }
                    }

                    // if no object with the same id was found, throw an error
                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "DELETE":
                app.delete(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    
                    for (let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] === id) {
                            jsonFile.splice(i, 1)
                            FileUtils.writeJsonFile(path, jsonFile)

                            res.status(204).send()
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "PATCH":
                app.patch(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body

                    if (interceptUpdates !== undefined) interceptUpdates(body, {id, method: "PATCH"})

                    for(let i = 0; i < jsonFile.length; i++) {
                        const object = jsonFile[i]
                        if (object["id"] === id) {
                            for (let property in body) {
                                const newObjectReference = {}
                                // @ts-ignore
                                newObjectReference[property] = typeof objectReference[property] === "object" ? objectReference[property] : [typeof objectReference[property]]
                                if (!this.validateObject({[property]: body[property]}, newObjectReference, name+".", res)) {
                                    return;
                                }
                                
                                object[property] = body[property]
                            }

                            FileUtils.writeJsonFile(path, jsonFile)
                            res.json(object)
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            default:
                throw new Error("Unknown method " + method + " in config file")
        }
    }
    
    private static validateObject(obj: any, reference: any, path: string, res: any): boolean {
        if (typeof obj !== "object" || obj === null) {
            ErrorUtils.jsonThrow(`Invalid object at ${path}: Expected object, got ${typeof obj}`, res);
            return false;
        }
        
        for (const key in reference) {
            if (!obj.hasOwnProperty(key)) {
                ErrorUtils.jsonThrow(`Missing key at ${path}${key}`, res);
                return false;
            }
            
            const refType = reference[key];
            const value = obj[key];

            if (Array.isArray(refType)) {
                if (!Array.isArray(value)) {
                    ErrorUtils.jsonThrow(`Invalid type at ${path}${key}: Expected array, got ${typeof value}`, res);
                    return false;
                }
                if (refType.length > 0) {
                    const expectedType = refType[0];
                    value.forEach((item: any, index: number) => {
                        if (typeof expectedType === "object") {
                            const result = this.validateObject(item, expectedType, `${path}${key}[${index}].`, res);
                            if (!result) return false;
                        } else {
                            const result = this.typeofCheck(item, expectedType, `${path}${key}[${index}]`, res);
                            if (!result) return false;
                        }
                    });
                }
            } else if (typeof refType === "object") {
                const result = this.validateObject(value, refType, `${path}${key}.`, res);
                if (!result) return false;
            } else {
                const result = this.typeofCheck(value, refType, `${path}${key}`, res);
                if (!result) return false;
            }
        }
        
        for (const key in obj) {
            if (!reference.hasOwnProperty(key)) {
                ErrorUtils.jsonThrow(`Invalid key at ${path}${key}: Unexpected key`, res);
                return false;
            }
        }
        
        return true;
    }
    
    private static typeofCheck(value: any, type: string, path: string, res: any): boolean {
        if (type.startsWith("id:")) {
            const idEndpointName = type.split(":")[1];
            return this.checkOtherEndpointsForId(value, idEndpointName, path, res);
        }
        
        if (type.startsWith("enum:")) {
            const enumName = type.split(":")[1];
            return this.checkEnum(value, enumName, path, res);
        }
        
        if (typeof value !== type) {
            ErrorUtils.jsonThrow(`Invalid type at ${path}: Expected ${type}, got ${typeof value}`, res);
            return false;
        }
        
        return true;
    }

    private static checkOtherEndpointsForId(id: number, endpointName: string, path: string, res: any): boolean {
        const jsonFile = FileUtils.readJsonFile(`./storage/${endpointName}.json`);
        const object = jsonFile.find((object: any) => object["id"] === id);
        if (object === undefined) {
            ErrorUtils.jsonThrow(`Invalid id at ${path}: Couldn't find object with id ${id} in ${endpointName}`, res);
            return false;
        }
        
        return true;
    }
    
    private static checkEnum(value: string, enumName: string, path: string, res: any): boolean {
        const enumValues = EnumStore.getEnum(enumName);
        
        if (enumValues === undefined) {
            ErrorUtils.jsonThrow(`Invalid enum at ${path}: Couldn't find enum ${enumName}`, res);
            return false;
        }
        
        if (!enumValues.includes(value)) {
            ErrorUtils.jsonThrow(`Invalid enum at ${path}: Expected one of ${enumValues.join(", ")}, got ${value}`, res);
            return false;
        }
        
        return true;
    }
}
