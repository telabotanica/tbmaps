export class Event {
  private _id : any;
  private _title : any;
  private _place: any;
  private _coord: any;
  private _formatedStartDate: any;
  private _formatedEndDate: any;
  private _date: any;
  private _endDate: any;
  private _icon: any;
  private _categoryId: any;
  private _categoryURL: any;
  private _category: any;
  private _price: any;
  private _markerType: any;
  private _source: any;
  private _contact: any;
  private _contactImage: any;
  private _excerpt: any;
  private _link: any;


  constructor(id: any, title: any, place: any, coord: any, formatedStartDate: any, formatedEndDate: any, date: any, endDate: any, icon: any, categoryId: any, categoryURL: any, category: any, price: any, markerType: any, source: any, contact: any, contactImage: any, excerpt: any, link: any) {
    this._id = id;
    this._title = title;
    this._place = place;
    this._coord = coord;
    this._formatedStartDate = formatedStartDate;
    this._formatedEndDate = formatedEndDate;
    this._date = date;
    this._endDate = endDate;
    this._icon = icon;
    this._categoryId = categoryId;
    this._categoryURL = categoryURL;
    this._category = category;
    this._price = price;
    this._markerType = markerType;
    this._source = source;
    this._contact = contact;
    this._contactImage = contactImage;
    this._excerpt = excerpt;
    this._link = link;
  }


  get id(): any {
    return this._id;
  }

  set id(value: any) {
    this._id = value;
  }

  get title(): any {
    return this._title;
  }

  set title(value: any) {
    this._title = value;
  }

  get place(): any {
    return this._place;
  }

  set place(value: any) {
    this._place = value;
  }

  get coord(): any {
    return this._coord;
  }

  set coord(value: any) {
    this._coord = value;
  }

  get formatedStartDate(): any {
    return this._formatedStartDate;
  }

  set formatedStartDate(value: any) {
    this._formatedStartDate = value;
  }

  get formatedEndDate(): any {
    return this._formatedEndDate;
  }

  set formatedEndDate(value: any) {
    this._formatedEndDate = value;
  }

  get date(): any {
    return this._date;
  }

  set date(value: any) {
    this._date = value;
  }

  get endDate(): any {
    return this._endDate;
  }

  set endDate(value: any) {
    this._endDate = value;
  }

  get icon(): any {
    return this._icon;
  }

  set icon(value: any) {
    this._icon = value;
  }

  get categoryId(): any {
    return this._categoryId;
  }

  set categoryId(value: any) {
    this._categoryId = value;
  }

  get categoryURL(): any {
    return this._categoryURL;
  }

  set categoryURL(value: any) {
    this._categoryURL = value;
  }

  get category(): any {
    return this._category;
  }

  set category(value: any) {
    this._category = value;
  }

  get price(): any {
    return this._price;
  }

  set price(value: any) {
    this._price = value;
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

  get contact(): any {
    return this._contact;
  }

  set contact(value: any) {
    this._contact = value;
  }

  get contactImage(): any {
    return this._contactImage;
  }

  set contactImage(value: any) {
    this._contactImage = value;
  }

  get excerpt(): any {
    return this._excerpt;
  }

  set excerpt(value: any) {
    this._excerpt = value;
  }


  get link(): any {
    return this._link;
  }

  set link(value: any) {
    this._link = value;
  }
}
