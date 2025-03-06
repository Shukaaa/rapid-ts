import {FileUtils} from "../utils/file.utils";
import fs from "fs";

export class IdStore {
    static folder: string = "./storage"
    static path: string = this.folder + "/id-counter.json"

    static check() {
        if (!FileUtils.exists(this.folder)) {
            fs.mkdirSync(this.folder)
        }

        if (!FileUtils.exists(this.path)) {
            fs.writeFileSync(this.path, "{}", 'utf-8')
        }
    }

    static get(name: string) {
        let idStorage = JSON.parse(fs.readFileSync(this.path, 'utf-8'))

        if (idStorage[name] === undefined) {
            idStorage[name] = 0
            fs.writeFileSync(this.path, JSON.stringify(idStorage), 'utf-8')
        }

        return idStorage[name]
    }

    static set(name: string, id: number) {
        let idStorage = JSON.parse(fs.readFileSync(this.path, 'utf-8'))
        idStorage[name] = id

        FileUtils.writeJsonFile(this.path, idStorage)
    }
}
