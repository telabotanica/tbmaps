export class Trail {
  private _id: any;
  private _name: any;
  private _displayName: any;
  private _coord: any;
  private _author: any;
  private _details: any;
  private _image: any;
  private _occurrences_count: any;
  private _path_length: any;
  private _icon: any;
  private _markerType: any;
  private _source: any;


  constructor(id: any, name: any, displayName: any, coord: any, author: any, details: any, image: any, occurrences_count: any, path_length: any, icon: any, markerType: any, source: any) {
    this._id = id;
    this._name = name;
    this._displayName = displayName;
    this._coord = coord;
    this._author = author;
    this._details = details;
    this._image = image;
    this._occurrences_count = occurrences_count;
    this._path_length = path_length;
    this._icon = icon;
    this._markerType = markerType;
    this._source = source;
  }


  get id(): any {
    return this._id;
  }

  set id(value: any) {
    this._id = value;
  }

  get name(): any {
    return this._name;
  }

  set name(value: any) {
    this._name = value;
  }

  get displayName(): any {
    return this._displayName;
  }

  set displayName(value: any) {
    this._displayName = value;
  }

  get coord(): any {
    return this._coord;
  }

  set coord(value: any) {
    this._coord = value;
  }

  get author(): any {
    return this._author;
  }

  set author(value: any) {
    this._author = value;
  }

  get details(): any {
    return this._details;
  }

  set details(value: any) {
    this._details = value;
  }

  get image(): any {
    return this._image;
  }

  set image(value: any) {
    this._image = value;
  }

  get occurrences_count(): any {
    return this._occurrences_count;
  }

  set occurrences_count(value: any) {
    this._occurrences_count = value;
  }

  get path_length(): any {
    return this._path_length;
  }

  set path_length(value: any) {
    this._path_length = value;
  }

  get icon(): any {
    return this._icon;
  }

  set icon(value: any) {
    this._icon = value;
  }

  get markerType(): any {
    return this._markerType;
  }

  set markerType(value: any) {
    this._markerType = value;
  }


  get source(): any {
    return this._source;
  }

  set source(value: any) {
    this._source = value;
  }
}
