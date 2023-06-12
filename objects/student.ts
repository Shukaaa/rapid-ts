interface StudentInterface {
    id: number;
    name: string;
    age: number;
}

export class student {
    // This is the object that will be used to create the data
    object: StudentInterface = {} as StudentInterface
    // This is used to check if the data is valid, and to get the types of the properties
    object_for_datacheck: StudentInterface = {
        id: 0,
        name: "",
        age: 0
    }
    // This is used to create the object
    constructor(student: StudentInterface) {
        this.object.id = student.id
        this.object.name = student.name
        this.object.age = student.age
    }
}
