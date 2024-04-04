export class Obs {
  private _id: string;
  private _referentiel: string;
  private _nomRet: string;
  private _nomRetNn: string;
  private _nomSel: string;
  private _nomSelNn: string;
  private _famille: string;
  private _author: string;
  private _dateObs: any;
  private _commentaire: string;
  private _typeDonnees: string;
  private _milieu: string;
  private _urlIp: string;
  private _coord: any;
  private _image: any;
  private _utilisateur: any;
  private _icon: any;
  private _markerType: any;
  private _source: any;
  private _projet: string;
  private _fiabilite: number;

  constructor(id: string, referentiel: string, nomRet: string, nomRetNn: string, nomSel: string, nomSelNn: string, famille: string, author: string, dateObs: any,  commentaire: string, typeDonnees: string, milieu: string, urlIp: string, coord: any, image: any, utilisateur: any, icon: any, markerType: any, source: any, projet: string, fiabilite: number) {
    this._id = id;
    this._referentiel = referentiel;
    this._nomRet = nomRet;
    this._nomRetNn = nomRetNn;
    this._nomSel = nomSel;
    this._nomSelNn = nomSelNn;
    this._famille = famille;
    this._author = author;
    this._dateObs = dateObs;
    this._commentaire = commentaire;
    this._typeDonnees = typeDonnees;
    this._milieu = milieu;
    this._urlIp = urlIp;
    this._coord = coord;
    this._image = image;
    this._utilisateur = utilisateur;
    this._icon = icon;
    this._markerType = markerType;
    this._source = source;
    this._projet = projet;
    this._fiabilite = fiabilite;
  }


  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get referentiel(): string {
    return this._referentiel;
  }

  set referentiel(value: string) {
    this._referentiel = value;
  }

  get nomRet(): string {
    return this._nomRet;
  }

  set nomRet(value: string) {
    this._nomRet = value;
  }

  get nomRetNn(): string {
    return this._nomRetNn;
  }

  set nomRetNn(value: string) {
    this._nomRetNn = value;
  }

  get nomSel(): string {
    return this._nomSel;
  }

  set nomSel(value: string) {
    this._nomSel = value;
  }

  get nomSelNn(): string {
    return this._nomSelNn;
  }

  set nomSelNn(value: string) {
    this._nomSelNn = value;
  }

  get famille(): string {
    return this._famille;
  }

  set famille(value: string) {
    this._famille = value;
  }

  get author(): string {
    return this._author;
  }

  set author(value: string) {
    this._author = value;
  }

  get dateObs(): any {
    return this._dateObs;
  }

  set dateObs(value: any) {
    this._dateObs = value;
  }

  get commentaire(): string {
    return this._commentaire;
  }

  set commentaire(value: string) {
    this._commentaire = value;
  }

  get typeDonnees(): string {
    return this._typeDonnees;
  }

  set typeDonnees(value: string) {
    this._typeDonnees = value;
  }

  get milieu(): string {
    return this._milieu;
  }

  set milieu(value: string) {
    this._milieu = value;
  }

  get urlIp(): string {
    return this._urlIp;
  }

  set urlIp(value: string) {
    this._urlIp = value;
  }

  get coord(): any {
    return this._coord;
  }

  set coord(value: any) {
    this._coord = value;
  }

  get image(): any {
    return this._image;
  }

  set image(value: any) {
    this._image = value;
  }

  get utilisateur(): any {
    return this._utilisateur;
  }

  set utilisateur(value: any) {
    this._utilisateur = value;
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


  get projet(): string {
    return this._projet;
  }

  set projet(value: string) {
    this._projet = value;
  }


  get fiabilite(): number {
    return this._fiabilite;
  }

  set fiabilite(value: number) {
    this._fiabilite = value;
  }
}
