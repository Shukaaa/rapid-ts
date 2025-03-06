import * as fs from "fs";

export class FileUtils {
    static readJsonFile(filePath: string) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }

    static writeJsonFile(filePath: string, data: any) {
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8')
    }

    static exists(filePath: string) {
        return fs.existsSync(filePath)
    }
}
