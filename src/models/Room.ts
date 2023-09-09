import { plainToInstance } from "class-transformer";
import { Result, Ok } from "ts-results";

export class Room {
    constructor(public id: string, public text: string, public dept: string) { }
    static fromJson(json: any): Result<Room, void> {
        return Ok(plainToInstance(Room, json));
    }
}