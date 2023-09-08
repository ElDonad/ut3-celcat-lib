import fetchCookie from "fetch-cookie";
import ToughCookie from "tough-cookie";


export class Ut3Credentials {
    username: string;
    password: string;
    constructor(username: string = "", password: string = "") {
        this.username = username;
        this.password = password;
    }
};

export enum AuthenticationErrorKind {
    NO_TOKEN_FOUND = "No token found",
    AUTHENTICATION_FAILED = "Authentication failed, likely due to bad credentials."
}

export class AuthenticationError extends Error {
    errorkind: AuthenticationErrorKind;
    constructor(kind: AuthenticationErrorKind) {
        super();
        this.errorkind = kind;
    }
};

export class CelcatApi {
    baseUrl: string;
    credentials: Ut3Credentials;
    token: string | null = null;
    cookieJar: ToughCookie.CookieJar = new ToughCookie.CookieJar();
    fetch = null;
    constructor(credentials: Ut3Credentials, baseUrl: string = "https://edt.univ-tlse3.fr/calendar2") {
        this.baseUrl = baseUrl;
        this.credentials = credentials
        this.fetch = fetchCookie(fetch, this.cookieJar);
    }

    public async authenticate(forceReconnection = false) {
        if (this.token != null && !forceReconnection) {
            return true;
        }


        const res = await this.fetch(this.baseUrl + "/LdapLogin", {
            credentials: "include"
        });
        if (res.ok) {
            const page = await res.text();
            const token = this.getTokenFromPage(page);
            if (!token) throw new AuthenticationError(AuthenticationErrorKind.NO_TOKEN_FOUND);

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
                throw new AuthenticationError(AuthenticationErrorKind.AUTHENTICATION_FAILED);
            }
            const cookies = await this.cookieJar.getCookies(this.baseUrl);
            const cookiesNames = cookies.map(c => c.key);
            if (!cookiesNames.includes(".Celcat.Calendar.Session")) {
                throw new AuthenticationError(AuthenticationErrorKind.AUTHENTICATION_FAILED);
            }

        }
        return true;
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