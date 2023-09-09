import { CelcatDate } from "../src/utils"

test("format date", () => {
    const date = new CelcatDate(2001, 5, 15);
    expect(date.toCelcatStr() == "2001-06-15").toBeTruthy();
})