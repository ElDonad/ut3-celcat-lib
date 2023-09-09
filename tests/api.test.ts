import { CelcatApi, Ut3Credentials } from "../src/CelcatApi";
import { Group } from "../src/models/Group";

beforeAll(async () => {
    const credentials = await import("./ut3_credentials.json");
    const api = new CelcatApi(new Ut3Credentials(credentials.username, credentials.password));
    await api.authenticate();
    global.API = api;

})


test("full api", async () => {
    let api: CelcatApi = global.API;
    let rooms = await api.fetchRooms();
    expect(rooms.ok && rooms.val.length > 0).toBeTruthy();
    let groups = await api.fetchGroups();
    expect(groups.ok && groups.val.length > 0).toBeTruthy();
    let courses = await api.fetchCourses();
    expect(courses.ok && courses.val.length > 0).toBeTruthy();

    const myFormation = groups.unwrap().find(c => c.name = "KPFP9CMA");
    expect(myFormation).toBeTruthy();
    console.log(myFormation);
    let events = await api.fetchEvents([myFormation as Group], { rooms: rooms.unwrap(), courses: courses.unwrap() })
    console.log(events.unwrap());
    expect(events.ok && events.unwrap().length > 0).toBeTruthy();
});