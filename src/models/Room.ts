import { plainToInstance } from "class-transformer";
import { Result, Ok } from "ts-results";

export class Room {
    id: string;
    text: string;
    dept: string;
    static fromJson(json: any): Result<Room, void> {
        return Ok(plainToInstance(Room, json));
    }
}