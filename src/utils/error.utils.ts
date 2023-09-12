export class ErrorUtils {
    static jsonThrow(errorMsg: string, res: any) {
        res.status(404).json({ error: errorMsg })
    }
}
