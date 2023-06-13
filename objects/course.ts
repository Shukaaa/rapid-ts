interface CourseInterface {
    id: number,
    name: string
}

export class course {
    // This is the object that will be used to create the data
    object: CourseInterface = {} as CourseInterface
    // This is used to check if the data is valid, and to get the types of the properties
    object_for_datacheck: CourseInterface = {
        id: 0,
        name: ""
    }
    // This is used to create the object
    constructor(course: CourseInterface) {
        this.object.id = course.id
        // for optional body properties, check if they are undefined and set default values
        this.object.name = course.name ? course.name : ""
    }
}
