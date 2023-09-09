import { plainToInstance } from "class-transformer";
import { Result, Ok } from "ts-results";

export class Group {
    constructor(public id: string,
        public name: string,
        public dept: string | null) { }

    static fromJson(json: any): Result<Group, void> {
        return Ok(new Group(json.id, json.text.split("-")[0].trim(), json.dept));
    }
}