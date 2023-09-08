import { CelcatApi, Ut3Credentials } from "../src/CelcatApi";

describe("CelcatAPI", () => {

    test.skip("authenticate", async () => {
        const api = new CelcatApi(new Ut3Credentials(globalThis.__UT3_CREDENTIALS.username, globalThis.__UT3_CREDENTIALS.password));
        expect(await api.authenticate());
    })
})