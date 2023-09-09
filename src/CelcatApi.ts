import { plainToInstance } from "class-transformer";
import fetchCookie from "fetch-cookie";
import ToughCookie from "tough-cookie";
import { Result, Ok, Err } from "ts-results";
import { Group } from "./models/Group";
import { CelcatDate, dataUrlBuilder } from "./utils";
import { ResourceType } from "./ResourceType";
import { Event } from "./models/Event";
import { Course } from "./models/Course";
import { Room } from "./models/Room";

export class Ut3Credentials {
    username: string;
    password: string;
    constructor(username: string = "", password: string = "") {
        this.username = username;
        this.password = password;
    }
};

export type AuthenticationError = { error: "NO_TOKEN_FOUND" } | { error: "AUTHENTICATION_FAILED" };

export type DataFetchError = { error: "REQUEST_FAILED" } | { error: "INVALID_DATA", data: Object } | { error: "UNAUTHENTIFIED" };

export class CelcatApi {
    baseUrl: string;
    private credentials: Ut3Credentials;
    authenticated = false;
    private cookieJar: ToughCookie.CookieJar = new ToughCookie.CookieJar();
    private fetch: (url: URL | RequestInfo, init?: RequestInit) => Promise<Response> = null;
    constructor(credentials: Ut3Credentials, baseUrl: string = "https://edt.univ-tlse3.fr/calendar2") {
        this.baseUrl = baseUrl;
        this.credentials = credentials
        this.fetch = fetchCookie(fetch, this.cookieJar);
    }

    public async authenticate(forceReconnection = false): Promise<Result<void, AuthenticationError>> {
        if (this.authenticated && !forceReconnection) {
            return Ok.EMPTY;
        }


        const res = await this.fetch(this.baseUrl + "/LdapLogin", {
            credentials: "include"
        });
        if (res.ok) {
            const page = await res.text();
            const token = this.getTokenFromPage(page);
            if (!token) return Err({ error: "NO_TOKEN_FOUND" });

            const formData = new FormData();
            formData.append("__RequestVerificationToken", token);
            formData.append("Password", this.credentials.password);
            formData.append("Name", this.credentials.username);
            const connectRes = await this.fetch(this.baseUrl + "/LdapLogin/Logon", {
                method: "POST",
                body: formData,
                mode: "no-cors",

            });
            if (!connectRes.ok) {
                console.log(connectRes);
                return Err({ error: "AUTHENTICATION_FAILED" });
            }
            const cookies = await this.cookieJar.getCookies(this.baseUrl);
            const cookiesNames = cookies.map(c => c.key);
            if (!cookiesNames.includes(".Celcat.Calendar.Session")) {
                return Err({ error: "AUTHENTICATION_FAILED" });
            }

        }
        return Ok.EMPTY;
    }

    async isSessionExpired() {
        const NEEDED_COOKIES = [".AspNetCore.Antiforgery", ".Calendar.Cookies", ".Celcat.Calendar.Session"];
        const cookies = await this.cookieJar.getCookies(this.baseUrl);
        // Un utilisateut authentifié possède 3 cookies minimum (NEEDED_COOKIES)
        if (cookies.length < 3) {
            return true;
        }
        for (let cookie_name of NEEDED_COOKIES) {
            let cookie = cookies.find(c => c.key.includes(cookie_name));
            if (cookie && cookie.TTL() > 0) {
                continue;
            }
            // cookie not found, session expired
            return true;
        }
        return false;
    }

    private async fetchData<T>(type: ResourceType, converter: (any) => Result<T, void>): Promise<Result<T[], DataFetchError>> {
        const url = this.baseUrl + "/Home/ReadResourceListItems";

        if (await this.isSessionExpired()) {
            return Err({ error: "UNAUTHENTIFIED" });
        }
        const fullUrl = dataUrlBuilder(url, type);
        const res = await this.fetch(fullUrl);
        if (!res.ok) {
            return Err({ error: "REQUEST_FAILED" });
        }
        const json = await res.json();
        const results = json.results as Object[];
        return Ok(results.map(v => converter(v).unwrap()));


    }

    public async fetchGroups(): Promise<Result<Group[], DataFetchError>> {
        return this.fetchData<Group>(ResourceType.GROUP, Group.fromJson);

    }

    public async fetchCourses(): Promise<Result<Course[], DataFetchError>> {
        return this.fetchData<Course>(ResourceType.COURSE, Course.fromJson);
    }

    public async fetchRooms(): Promise<Result<Room[], DataFetchError>> {
        return this.fetchData<Room>(ResourceType.ROOM, Room.fromJson);
    }
    public async fetchEvents(
        formations: Group[],
        options: {
            resourceType?: ResourceType,
            startDate?: CelcatDate,
            endDate?: CelcatDate,
            rooms?: Room[],
            courses?: Course[]
        }
    ): Promise<Result<Event[], DataFetchError>> {
        options = {
            ...{
                resourceType: ResourceType.GROUP,
                startDate: new CelcatDate(),
                endDate: new CelcatDate(new CelcatDate().setFullYear(new CelcatDate().getFullYear() + 1)),
                courses: [],
                rooms: []
            }, ...options
        };
        if (await this.isSessionExpired()) {
            return Err({ error: "UNAUTHENTIFIED" });
        }
        let formData = new FormData();
        formData.append("start", options.startDate.toCelcatStr());
        formData.append("end", options.endDate.toCelcatStr());
        formData.append("resType", options.resourceType.toString());
        formData.append("colourScheme", "3");
        formData.append("calView", "month");

        formations.forEach((f) => formData.append("federationIds[]", f.id));


        //const res = await this.fetch("https://ut3edt.requestcatcher.com/test", {
        const res = await this.fetch(this.baseUrl + "/Home/GetCalendarData", {
            method: "POST",
            body: formData
        });
        if (!res.ok) {
            return Err({ error: "REQUEST_FAILED" });
        }
        let data = await res.text();
        console.log(data);
        let jsonData = JSON.parse(data) as Object[];
        //const data = await res.json() as Array<any>;
        return Ok(jsonData.map(d => Event.fromJson(d, options.rooms, options.courses).unwrap()));
    }


    private getTokenFromPage(page: string) {
        const reg = /<input name=\"__RequestVerificationToken\" type=\"hidden\" value=\"(.*)\" \/>/
        const matches = page.match(reg);
        if (matches && matches.length >= 1) {
            return matches[1].trim();
        }
        return null;
    }
};