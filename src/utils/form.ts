/** exclusively meant to be used for the profile thing because darflen sux */
export class Form {
    // i am so fed up with darflen
    private data: Array<Array<string>> = [];
    private boundary = `----darflen${Math.random().toString(16).slice(2)}`;

    public async append(key: string, value: string | Blob, props?: Record<string, string> & { filename?: string }) {
        const header = `Content-Disposition: form-data; name="${key}"${props ? Object.entries(props).map(([k, v]) => `; ${k}="${v}"`).join("") : ""}`;
        this.data.push([
            `${header}\r\n`,
            value instanceof Blob ? `Content-Type: ${value.type || "application/octet-stream"}\r\n` : "",
            "\r\n",
            value instanceof Blob ? (await value.bytes()).toString() : value
        ].filter(Boolean));
    }

    public build() {
        return this.data.map(part => `--${this.boundary}\r\n${part.filter(Boolean).join("")}`).join("\r\n") + `\r\n--${this.boundary}--`;
    }

    public headers() {
        return {
            "Content-Type": `multipart/form-data; boundary=${this.boundary}`
        };
    }
}