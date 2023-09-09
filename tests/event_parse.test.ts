import { Event, formatDescription } from "../src/models/Event"

const example_event = {
    "id": "-1690272824:-431005734:8:1626087:3",
    "start": "2023-09-04T10:15:00",
    "end": "2023-09-04T12:00:00",
    "allDay": false,
    "description": "REUNION / RENCONTRE\r\n\r\n<br />\r\n\r\nFSI / U2-115\r\n\r\n<br />\r\n\r\nGUERY-ODELIN DAVID\r\n\r\n<br />\r\n\r\nK5PFPPROMO\r\n",
    "backgroundColor": "#FFFF80",
    "textColor": "#000000",
    "department": "FSI - Pole Master",
    "faculty": null,
    "eventCategory": "REUNION / RENCONTRE",
    "sites": [
        "Bât. U2"
    ],
    "modules": null,
    "registerStatus": 0,
    "studentMark": 0,
    "custom1": null,
    "custom2": null,
    "custom3": null
}


describe("event_parsing", () => {
    it("format description", () => {
        const exemple_description = "COURS/TD\r\n\r\n<br />\r\n\r\nKPFP9AA2 - Physique des nouveaux mat&#233;riaux fonctionnels\r\n\r\n<br />\r\n\r\nFSI / U2-115\r\n\r\n<br />\r\n\r\nK5PFPPROMO\r\n";
        const exemple_formatted_description = "COURS/TD\nKPFP9AA2 - Physique des nouveaux matériaux fonctionnels\nFSI / U2-115\nK5PFPPROMO"
        expect(formatDescription(exemple_description) === exemple_formatted_description).toBeTruthy();
    });
    it("parse event", () => {
        expect(Event.fromJson(example_event).ok).toBeTruthy();
    });
});

