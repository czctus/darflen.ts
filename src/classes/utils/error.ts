export class DarflenError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = "DarflenError";
        this.status = status;
    }
}