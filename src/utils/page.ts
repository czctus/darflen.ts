export class Page<DataType> {
    *[Symbol.iterator]() {
        for (const item of this._data) {
            yield item;
        }
    }

    public get data() { return this._data };
    public getPage(id: number) {
        return this.get(id).then((d) => {
            this._data = d;
            this._currentPage = id;
            return this._data;
        });
    }
    public next(): Promise<DataType[]> {
        return this.getPage(this._currentPage + 1); 
    }

    constructor(
        private readonly get: (page: number) => Promise<DataType[]>,
        private _data: DataType[] = [],
        private _currentPage = 0,
    ) { }
}