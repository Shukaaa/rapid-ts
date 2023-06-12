import {JsonFileService} from "../services/JsonFileService";
import fs from "fs";

export class IdStore {
    static folder: string = "./storage/id"
    static path: string = this.folder + "/ids.json"

    static check() {
        if (!JsonFileService.exists(this.path)) {
            fs.mkdirSync(this.folder)
            JsonFileService.writeJsonFile(this.path, {})
        }
    }

    static get(name: string) {
        let idStorage = JSON.parse(fs.readFileSync(this.path, 'utf-8'))

        if (idStorage[name] == undefined) {
            idStorage[name] = 0
            fs.writeFileSync(this.path, JSON.stringify(idStorage), 'utf-8')
        }

        return idStorage[name]
    }

    static set(name: string, id: number) {
        let idStorage = JSON.parse(fs.readFileSync(this.path, 'utf-8'))
        idStorage[name] = id

        JsonFileService.writeJsonFile(this.path, idStorage)
    }
}
