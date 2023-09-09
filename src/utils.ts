import { ResourceType } from "./ResourceType";

export class CelcatDate extends Date {
    toCelcatStr() {
        return this.getFullYear().toString() + "-" + (this.getMonth() + 1).toString().padStart(2, "0") + "-" + this.getDay().toString().padStart(2, "0");
    }

}

export function dataUrlBuilder(urlBase: string, resType: ResourceType, searchQuery = null) {
    searchQuery = searchQuery == null ? "___" : searchQuery;
    let url = new URL(urlBase);
    url.searchParams.append("myResources", "false");
    url.searchParams.append("searchTerm", searchQuery);
    url.searchParams.append("pageSize", "100000");
    url.searchParams.append("pageNumber", "1");
    url.searchParams.append("resType", resType.toString());
    url.searchParams.append("_", Math.floor(Date.now() / 1000).toString());
    return url.toString();
}