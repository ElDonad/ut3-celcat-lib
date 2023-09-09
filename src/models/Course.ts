import { Err, Ok, Result } from "ts-results";

function parseCourseDesc(desc: string) {
    return desc.split('-')[1].trim();
}

export class Course {

    constructor(
        public id: string,
        public title: string,
        public department: string | null
    ) { }

    static fromJson(json: any): Result<Course, void> {
        if (!json.id || !json.text) {
            return Err.EMPTY;
        }
        let department = json.dept ? json.dept : null;
        return Ok(new Course(
            json.id,
            parseCourseDesc(json.text),
            department
        ));
    }
}