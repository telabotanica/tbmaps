export class Source {
  private _name: string;
  private _displayName: string;
  private _data: any;
  private _entries: number;


  constructor(name: string, displayName: string, data: any, entries: number) {
    this._name = name;
    this._displayName = displayName;
    this._data = data;
    this._entries = entries;
  }


  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get displayName(): string {
    return this._displayName;
  }

  set displayName(value: string) {
    this._displayName = value;
  }

  get data(): any {
    return this._data;
  }

  set data(value: any) {
    this._data = value;
  }

  get entries(): number {
    return this._entries;
  }

  set entries(value: number) {
    this._entries = value;
  }
}
