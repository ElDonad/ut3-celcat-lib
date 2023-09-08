import { CelcatApi, Ut3Credentials } from "../src/CelcatApi";

test("authenticate", async () => {
    const api = new CelcatApi(new Ut3Credentials());
    expect(await api.authenticate());
})