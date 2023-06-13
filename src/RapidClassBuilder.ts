export function getRapidObjectClass(object: object, constructor: (data: object) => void = (): void => {}): any {
    return class {
        object_for_datacheck: object = object
        object: object = {}

        constructor(data: object) {
            if (Object.keys(data).length != 0) {
                constructor.call(this, data);
            }

            this.object = data
        }
    }
}
