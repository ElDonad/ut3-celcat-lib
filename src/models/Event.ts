import { Ok, Err, Result } from "ts-results";
import { CelcatDate } from "../utils";
import { decode } from "he";
import { Room } from "./Room";
import { Course } from "./Course";

type EventParseError = { error: "PARSING_FAILED" };

export function formatDescription(desc: string) {
    return decode(desc).replace(/[\r\n]*/g, "").replace(/<br \/>/g, "\n");
}

export class Event {
    constructor(
        public id: string | null,
        public category: string | null,
        public description: string | null,
        public course: Course | null,
        public rooms: Room[],
        public sites: string[],
        public start: CelcatDate,
        public end: CelcatDate,
        public allDay: boolean,
        public backgroundColor: string,
        public textColor: string
    ) { }

    isIdenticalTo(other: Event): boolean {
        return this.id == other.id &&
            this.description == other.description &&
            this.start == other.start &&
            this.end == other.end &&
            this.allDay == other.allDay &&
            this.backgroundColor == other.backgroundColor &&
            this.textColor == other.textColor &&
            this.course.id == other.course.id &&
            this.rooms.every((r) => other.rooms.some((o) => o.id == r.id)) &&
            this.sites.every((s) => other.sites.some((o) => o == s)) &&
            this.category == other.category;
    }

    // The courses and rooms are assumed to be be cached elsewhere, because it's certainly not useful
    // to query them every time we need to check for new events
    static fromJson(json: any, rooms: Room[] = [], courses: Course[] = []): Result<Event, void> {
        let description: string = null;

        let course = null;
        let locations: Room[] = [];

        if (json.description) {
            description = formatDescription(json.description);
            // The room of the course if often found within the description.
            for (let descLine of description.split("\n")) {
                descLine = descLine.trim()
                for (let c of courses) {
                    if (descLine.includes(c.id)) {
                        course = c;
                    }
                }
                for (let r of rooms) {
                    if (descLine.includes(r.id)) {
                        locations.push(r);
                    }
                }

            }
            let sites = [];
            if (json.sites) {
                sites = json.sites;
            }

            let start = null;
            if (json.start) {
                start = Date.parse(json.start);
            }
            let end = null;
            if (json.end) {
                end = Date.parse(json.end);
            }
            let allDay = json.allDay ? json.allDay : false;
            let backgroundColor = json.backgroundColor ? json.backgroundColor : null;
            let textColor = json.textColor ? json.textColor : null;
            let category = json.eventCategory ? json.eventCategory : null;
            let id = json.id;


            return Ok(new Event(
                id,
                category,
                description,
                course,
                locations,
                sites,
                start,
                end,
                allDay,
                backgroundColor,
                textColor
            ));
        }
    }
}