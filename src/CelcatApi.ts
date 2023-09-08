export class Ut3Credentials {
    username: string;
    password: string;
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

    constructor(credentials: Ut3Credentials, baseUrl: string = "https://edt.univ-tlse3.fr/calendar2") {
        this.baseUrl = baseUrl;
        this.credentials = credentials;
    }

    public async authenticate(forceReconnection = false) {
        if (this.token != null && !forceReconnection) {
            return true;
        }
        const res = await fetch(this.baseUrl + "/LdapLogin");
        if (res.ok) {
            const page = await res.text();
            const token = this.getTokenFromPage(page);
            if (!token) throw new AuthenticationError(AuthenticationErrorKind.NO_TOKEN_FOUND);

            const formData = new FormData();
            formData.append("Name", this.credentials.username);
            formData.append("Password", this.credentials.password);
            formData.append("__RequestVerificationToken", token);
            const connectRes = await fetch(this.baseUrl + "/LdapLogin/Logon", {
                method: "POST",
                body: formData
            });
            const cookies: Record<string, string> = Object.fromEntries(connectRes.headers.getSetCookie().map(c => c.split("=")));
            if (!cookies[".Celcat.Calendar.Session"]) {
                throw new AuthenticationError(AuthenticationErrorKind.AUTHENTICATION_FAILED);
            }

        }
        return true;
    }

    private getTokenFromPage(page: string) {
        const reg = /<input name=\"__RequestVerificationToken\" type=\"hidden\" value=\"(.*)\" \/>/
        const matches = page.match(reg);
        if (matches && matches.length >= 1) {
            return matches[1];
        }
        return null;
    }
};