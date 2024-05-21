import {
  ApplicationRef,
  Component, ComponentFactoryResolver, ComponentRef, ElementRef, inject,
  Inject, Injector, NgZone,
  Renderer2, ViewChild, ViewContainerRef
} from '@angular/core';
import {CommonModule, DOCUMENT, NgComponentOutlet} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import {MarkerClusterGroup, markerClusterGroup } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {DataService} from "./services/data.service";
import {CommonService} from "./services/common.service";
import {Event} from "./models/Event";
import {environment} from "../environments/environment";
import {NgxLeafletFullscreenModule} from "@runette/ngx-leaflet-fullscreen";
import {EventPopupComponent} from "./components/popups/event-popup/event-popup.component";
import {FormsModule} from "@angular/forms";
// import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FilterComponent} from "./forms/filter/filter.component";
import {Source} from "./models/Source";
import {forkJoin, Observable} from "rxjs";
import {Trail} from "./models/Trail";
import {TrailPopupComponent} from "./components/popups/trail-popup/trail-popup.component";
import {Title} from "@angular/platform-browser";
import {LeafletMarkerClusterModule} from "@asymmetrik/ngx-leaflet-markercluster";
import {Obs} from "./models/Obs";
import {ObsPopupComponent} from "./components/popups/obs-popup/obs-popup.component";
import {CookiesService} from "./services/cookies.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LeafletModule,
    NgxLeafletFullscreenModule,
    FormsModule,
    EventPopupComponent,
    NgComponentOutlet,
    FilterComponent,
    CommonModule,
    LeafletMarkerClusterModule,
    TrailPopupComponent,
    ObsPopupComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  baseUrlSite = environment.baseUrlSite;
  map!: L.Map;
  markers: L.Marker[] = [];
  isLoading = true;
  layerGroup = L.layerGroup();
  markerClusterGroup!: L.MarkerClusterGroup;
  markerClusterData: any[] = [];
  markerClusterOptions: L.MarkerClusterGroupOptions;

  options: any;
  osmFrTilesURL = 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
  googleTilesURL = 'https://mt1.google.com/vt/lyrs=y@12345&hl=fr&src=app&x={x}&y={y}&z={z}';

  defaultCoord = { lat: 46, lng: 2 };

  layerAttributions: { [key: string]: string } = {
    osm: `Map data &copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors,
      <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>`,
    google: `Map data &copy;` + new Date().getFullYear() + `<a href="https://maps.google.com" target="_blank">Google</a>`
  };

  osmLayer: any;
  satelliteLayer: any;

  minZoom = 2;
  maxZoom = 18;
  defaultZoom = 7;
  displayedZoom!: number;

  sources: Source[] = [];
  defaultSource = 'evenements';
  sourceName = 'evenements'
  sourceDisplay = '';
  sourceCategories = false;
  categories: any
  markerMe! : any;
  positionBeforeLocateMe: any = null;
  dataToDisplay: any;

  // Url parameters
  logo!: any;
  url_site!: any;
  referentiel!: string;
  annee!: string;
  projet!: string;
  taxon!: string;
  numNomRet!: string;
  auteur!: string;
  standard!: string;
  params: any[] = []

  error!: string;

  events:any[] = [];
  trails:any[] = [];
  observations:any[] = [];
  eventsCategories: any;

  popupIsDisplayed = false;
  popupData!: any;
  popupOccurrences:any[] = [];
  // @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  userName = '';
  userEmail = '';
  userId = '';

  private commonService = inject(CommonService)
  private dataService = inject(DataService)
  // public dialog = inject(MatDialog);
  private renderer = inject(Renderer2);
  private zone = inject(NgZone)
  private titleService = inject(Title)
  private cookiesService = inject(CookiesService)

  constructor(@Inject(DOCUMENT) document: Document) {
    this.eventsCategories = [
      {
        id: 26,
        title: 'Congrès et conférences',
        icon: 'assets/images/marker-icon-bleu.svg'
      },
      {
        id: 27,
        title: 'Expositions',
        icon: 'assets/images/marker-icon-mauve.svg'
      },
      {
        id: 28,
        title: 'Sorties de terrain',
        icon: 'assets/images/marker-icon-vert.svg'
      },
      {
        id: 29,
        title: 'Stages et ateliers',
        icon: 'assets/images/marker-icon-orange.svg'
      }
    ]
    this.osmLayer = new L.TileLayer(this.osmFrTilesURL, this.generateLayerOptions('osm'))
    this.satelliteLayer = new L.TileLayer(this.googleTilesURL, this.generateLayerOptions('google'))
    this.markerClusterOptions = {removeOutsideVisibleBounds: true, showCoverageOnHover: false}
  }

  ngOnInit(): void {
    this.displayedZoom = this.defaultZoom;
    this.logo = 'https://resources.tela-botanica.org/tb/img/128x128/logo_carre_officiel.png';
    this.url_site = 'https://www.tela-botanica.org';
    this.sourceDisplay = 'évènements'

    // URL parameters
    let urlParams = this.commonService.readUrlParameters()
    for (const param of urlParams) {
      switch (param.name) {
        case 'sources':
          this.sourceName = param.value;
          break;
        case 'zoom':
          this.displayedZoom = parseInt(param.value);
          break;
        case 'titre':
          this.titleService.setTitle(param.value)
          break;
        case 'logo':
          this.logo = param.value
          break;
        case 'url_site':
          this.url_site = param.value
          break;
        case 'referentiel': //widget ne marche pas -> renvoie 0 results
          this.referentiel = param.value
          this.sourceName = 'observations'
          break;
        case 'annee':
          this.annee = param.value
          break;
        case 'projet':// widget ne marche pas -> renvoie tout
          this.projet = param.value
          this.sourceName = 'observations'
          this.params.push(param)
          break;
        case 'taxon':
          this.taxon = param.value
          this.sourceName = 'observations'
          this.params.push(param)
          break;
        case 'num_nom_ret': //widget ne marche pas -> renvoie tout
          this.numNomRet = param.value
          this.sourceName = 'observations'
          this.params.push(param)
          break;
        case 'auteur':
          this.auteur = param.value
          this.params.push(param)
          break;
        case 'standard':
          this.standard = param.value
          this.sourceName = 'observations'
          this.params.push(param)
          break;
        default:
          break;
      }
    }

    // Leaflet map options
    this.options = {
      layers: [this.osmLayer],
      zoom: this.displayedZoom,
      minZoom : this.minZoom,
      maxZoom: this.maxZoom,
      maxBounds : [[-85.0, -180.0], [85.0, 180.0]],
      center: this.defaultCoord,
      zoomControl: true,
      controls: {
        fullscreen: {
          position: 'topleft'
        }
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topleft'
      }
    }

    // Décodage du cookie d'auth
    this.userName = this.cookiesService.userInfos()['intitule'];
    this.userEmail = this.cookiesService.userInfos()['sub'];
    this.userId = this.cookiesService.userInfos()['id'];
  }

  mapReady(e: L.Map) {
    this.map = e;

    let baseMaps = {
      "Plan": this.osmLayer,
      "Satellite": this.satelliteLayer
    };

    let layerControl = L.control.layers(baseMaps).addTo(this.map);
    this.aroundMeButton()

    this.markerClusterGroup = new MarkerClusterGroup(this.markerClusterOptions);

    const getEvents = this.dataService.getEvents();
    const getTrails = this.dataService.getTrails();
    const getObservations = this.dataService.getObservations(19000, this.params);

    //Chargement des données
    forkJoin([getEvents, getTrails, getObservations]).subscribe((data: any) => {
      this.fillEvents(data[0])
      this.fillTrails(data[1])

      let obs = data[2].images
      let obsTotal = data[2].total;
      let start = 19000;
      let obsLimit = 100000

      const loadAdditionalObservationsRecursive = (total: number, start: number, obs: any[]) => {
        // Pour charger + d'obs que 19000 et jusqu'a la limite obsLimit
        if (obs.length < obsTotal && obs.length < obsLimit) {
          this.loadAdditionalObservations(total, start).subscribe((additionalData: any) => {
            obs = obs.concat(additionalData.images);
            start += 19000;
            loadAdditionalObservationsRecursive(total, start, obs);
          });
        } else {
          // Toutes les observations ont été chargées, remplir les données, etc.
          this.loadData(obs)
        }
      };

      // Si on a le paramètre observations on va démarrer le chargement récursif
      // des observations supplémentaires afin d'afficher + d'obs
      if (this.sourceName == 'observations' || this.numNomRet || this.referentiel || this.projet){
        loadAdditionalObservationsRecursive(obsTotal, start, obs);
      } else {
        this.loadData(obs)
      }
    })
  }

  // Fonction pour charger des observations supplémentaires
  loadAdditionalObservations(total: number, start: number): Observable<any> {
    if (start < 38000){
      this.params.push({ name: 'start', value: start });
    } else {
      let startIndex = this.params.findIndex((e) => e.name == 'start')
      this.params[startIndex].value = start
    }

    return this.dataService.getObservations(19000, this.params)
  }

  loadData(obs: any[]){
    // On filtre les résultats pour les paramètres qui ne maarchent pas -> TODO a supprimer une fois le widget corrigé ou l'appel à un meilleur widget
    if (this.referentiel){
      obs = obs.filter(entry => entry.obs && entry.obs.nom_referentiel === this.referentiel);
    }

    if (this.numNomRet){
      obs = obs.filter(entry => entry.obs && entry.obs.nom_ret_nn === this.numNomRet);
    }

    if (this.projet){
      obs = obs.filter(entry => entry.obs && entry.obs.projet === this.projet);
    }

    this.fillObservations(obs);
    this.sources.forEach(source => {
      if (source.name === this.sourceName) {
        this.dataToDisplay = source.data;
      }
    });
    this.isLoading = false;
    this.loadMarkers();
  }

  fillEvents(data:any){
    this.sourceCategories = true;
    this.categories = this.eventsCategories;

    let filteredData = data.filter((d: any) => {
      return this.commonService.filterData(d)
    })

    filteredData.forEach((event: any)=>{
      let categoryId = event.categories[0];
      let place = this.commonService.parsePlace(event.acf.place)
      let formatedEndDate = this.commonService.formatDates(event.acf['date_end'])
      let endDate = formatedEndDate ? event.acf['date_end'] : null;
      let contact = event.acf.contact[0] ?? null;
      let htmlStringContent = !!event.content?.rendered ? event.content.rendered : !!event.acf?.description ? event.acf.description : !!event.excerpt?.rendered ? event.excerpt.rendered : '';
      let categoryDetails = this.eventsCategories.find((e: any) => e.id == categoryId)

      let eventPostData = new Event(
        event.id,
        event.title.rendered,
        place,
        [place.latlng.lat,place.latlng.lng],
        this.commonService.formatDates(event.acf.date),
        formatedEndDate,
        event.acf.date,
        endDate,
        categoryDetails.icon,
        // '',
        categoryId,
        this.baseUrlSite + 'evenements/' + event.category.slug,
        event.category.name,
        event.acf.prices,
        'events',
        'evenements',
        contact,
        contact?.image?.url ?? contact?.image?.sizes?.thumbnail ?? null,
        this.commonService.generateExcerpt(this.commonService.parseHtmlStringContent(htmlStringContent)),
        event.link
      );

      this.events.push(eventPostData);
    })

    let newSource = new Source('evenements', 'évènements', this.events,  this.events.length, '');
    this.sources.push(newSource)
    // this.dataToDisplay = this.events;

    // On filtre les évènements par catégorie
    this.categories.map((category: any) => {
      category.data = this.events.filter((e: any) => e.categoryId === category.id);
      category.dataLength = category.data.length || 0;
    });
  }

  fillTrails(data: any){
    this.sourceCategories = false;

    data.forEach((trail: any)=>{
      let trailPostData = new Trail(
        trail.id,
        trail.name,
        trail.display_name,
        [trail.position.start.lat, trail.position.start.lng],
        trail.author,
        trail.details,
        trail.image,
        trail.occurrences_count,
        trail.path_length,
        'assets/images/marker-icon-kaki.svg',
        'trails',
        'sentiers'
      )

      this.trails.push(trailPostData)
    })

    // Afficher seulement des sentiers validés de l'utilisateur
    if (this.userName && (this.auteur == this.userId || this.auteur == this.userEmail)){
      this.trails = this.trails.filter(trail => trail.author === this.userName);
    }

    let newSource = new Source('sentiers', 'sentiers', this.trails,  this.trails.length, 'assets/images/marker-icon-kaki.svg');
    this.sources.push(newSource)
  }

  fillObservations(data: any){
    this.sourceCategories = false;

    const observationsGrouped = data.reduce((acc: any, image: any) => {
      const idObs = image.obs.id_obs;
      const cleanUrl = image.url_photo.split(',')[0];
      const existingEntry = acc.find((entry: any) => entry.id === idObs);

      // On transforme la liste des tags en array
      let cleanTags = image.tags_photo ? image.tags_photo.split(/\s*,\s*/).filter(Boolean) : null;

      if (existingEntry) {
        existingEntry.images.push({ ...image, url_photo: cleanUrl, tags_photo: cleanTags });
      } else {
        acc.push({
          id: idObs,
          images: [{ ...image, url_photo: cleanUrl, tags_photo: cleanTags }]
        });
      }
      return acc;
    }, []);

    this.observations = observationsGrouped.map((observation: any) => {
      let fiabilite = Number(observation.images[0].obs.fiabilite) // données standard si >= 3

      return new Obs(
        observation.id,
        observation.images[0].obs.nom_referentiel,
        observation.images[0].obs.nom_ret,
        observation.images[0].obs.nom_ret_nn,
        observation.images[0].obs.nom_sel,
        observation.images[0].obs.nom_sel_nn,
        observation.images[0].obs.famille,
        observation.images[0].obs.observateur,
        observation.images[0].obs.date_obs,
        observation.images[0].obs.commentaire,
        observation.images[0].obs.type_donnees,
        observation.images[0].obs.milieu,
        observation.images[0].obs.url_ip,
        [observation.images[0].obs.latitude, observation.images[0].obs.longitude],
        observation.images.map((image: any) => ({ ...image, url_photo: image.url_photo.split(',')[0] })),
        observation.images[0].utilisateur,
        'assets/images/marker-icon-jaune.svg',
        'observations',
        'observations',
        observation.images[0].obs.projet,
        fiabilite
      );
    });

    let newSource = new Source('observations', 'observations', this.observations,  this.observations.length, 'assets/images/marker-icon-jaune.svg');
    this.sources.push(newSource)
  }

  generateLayerOptions(layer: string){
    return {
      attribution: this.layerAttributions[layer],
      maxZoom: this.maxZoom,
      noWrap: true
    };
  }

  loadMarkers(){
    let markers:any = [];
    const clusterData : any[] = []

    // On supprime les markers existant
    if (this.map.hasLayer(this.layerGroup)) {
      this.layerGroup.clearLayers();
    }

    if (this.map.hasLayer(this.markerClusterGroup)) {
      this.markerClusterGroup.clearLayers();
    }

    this.layerGroup = L.layerGroup();

    this.dataToDisplay.forEach((e: any) => {
      const iconOptions = {
        options: {
            iconUrl: e.icon,
            shadowUrl: 'assets/images/marker-shadow.png',
            iconAnchor: new L.Point(12, 40),
            iconSize: new L.Point(24,40)
          }},
        icon = L.Icon.extend(iconOptions),
        markerOptions = {
          icon: new icon()
        };

      let marker = {
        position: { lat: e.coord[0], lng: e.coord[1] },
        icon: new icon(),
        draggable: false,
        data: e
      }
      markers.push(marker)

      const latLng = new L.LatLng(marker.position.lat, marker.position.lng)

      let leafletMarker = L.marker(latLng, markerOptions).on('click', (e: any) => {
        this.displayPopup(e, marker.data)
      })
      this.layerGroup.addLayer(leafletMarker);
      this.markerClusterGroup.addLayer(leafletMarker)
      clusterData.push(leafletMarker)
    })

    this.markerClusterData = clusterData;
    // this.map.addLayer(this.layerGroup)
    this.map.addLayer(this.markerClusterGroup)

    return markers;
  }

  addMarkerMe(options: any){
    const iconOptions = {
        options: {
          iconUrl: options.icon,
          shadowUrl: 'assets/images/marker-shadow.png',
          iconAnchor: new L.Point(12, 40),//correctly replaces the dot of the pointer
          iconSize: new L.Point(24,40)
        }},
      icon = L.Icon.extend(iconOptions),
      markerOptions = {
        icon: new icon(),
        feature: options
      },
      type = options.markerType || '',
      zoomFocusBack = (undefined !== options.zoom && Number.isInteger(options.zoom)) ? options.zoom : this.defaultZoom,
      latLng = new L.LatLng(options.coord[0], options.coord[1]),
      marker = L.marker(latLng, markerOptions);

    marker.addTo(this.map)

     //TODO
    // if('me' !== type) {
    //   markers.push(marker);
    //   spiderfier.addMarker(marker);
    //   spiderfier.addListener('click', this.displayPopup.bind(this));
    // } else {
      this.map.setView(latLng, zoomFocusBack);
      this.markerMe = marker;
    // }
    // marker.on('mouseover', function() {
    //   if (!isTouchScreen()) {
    //     lthis.displayTooltip(options.title, this.map.latLngToContainerPoint(latLng));
    //   }
    // });
    // marker.on('mouseout', () => $('#tooltip').css('display', 'none'));

  }

  closePopup() {
    this.popupIsDisplayed = false;
    this.map.scrollWheelZoom.enable();
  }

  displayPopup(e:any, markerData: any){
    this.zone.run(()=>{
      if (this.sourceName == 'sentiers'){
        this.popupOccurrences = []
        this.dataService.getTrailDetails(markerData.details).subscribe((trailDetails: any) => {
          trailDetails.occurrences.forEach((occurrence: any) => {

            let taxon = {
              "full_scientific_name" : occurrence.taxon.full_scientific_name,
              "scientific_name" : occurrence.taxon.scientific_name,
              "name_id": occurrence.taxon.name_id,
              "referentiel": occurrence.taxon.taxon_repository,
              "position": occurrence.position,
              "images": occurrence.images
            }

            this.popupOccurrences.push(taxon)
            this.popupIsDisplayed = true;
            this.popupData = markerData;
            this.map.scrollWheelZoom.disable();
          })
        })

      } else {
        this.popupIsDisplayed = true;
        this.popupData = markerData;
        this.map.scrollWheelZoom.disable();
      }
    })
  }

  updateDataToDisplay(e: any){
    this.dataToDisplay = e
    this.loadMarkers();
  }

  updateSourceName(e: any){
    this.sourceName = e
  }

  setAroundMeButton(button: any, doLocate = true, aroundMeDiv: any = null){
    if(doLocate) {
      if (aroundMeDiv){
        aroundMeDiv.setAttribute('title','Autour de moi');
        aroundMeDiv.innerHTML = '<span class="locate-me">Autour&nbsp;de&nbsp;moi</span>';
        aroundMeDiv.classList.remove('warning');
      } else {
        button.setAttribute('title','Autour de moi');
        button.innerHTML = '<span class="locate-me">Autour&nbsp;de&nbsp;moi</span>';
        button.classList.remove('warning');
      }
      this.positionBeforeLocateMe = null;

      if(this.markerMe) {
        this.map.removeLayer(this.markerMe);
        this.markerMe = null;
      }

    } else {
      if (aroundMeDiv){
        aroundMeDiv.setAttribute('title','Revenir à la position précédente');
        aroundMeDiv.innerHTML = '<span class="forget-me">Oublier&nbsp;ma&nbsp;position</span>';
        aroundMeDiv.classList.add('warning');
      } else {
        button.setAttribute('title','Revenir à la position précédente');
        button.innerHTML = '<span class="forget-me">Oublier&nbsp;ma&nbsp;position</span>';
        button.classList.add('warning');
      }
    }
  };

  aroundMeButton(){
    let aroundMe = new L.Control({position : 'topleft'});

    aroundMe.onAdd = map => {
      const button = L.DomUtil.create('button', 'button around-me');
      button.setAttribute('id', 'around-me')

      let aroundMeDiv = document.getElementById('around-me') as HTMLElement

      this.setAroundMeButton(button, true, aroundMeDiv);
      return button;
    };

    this.map.addControl(aroundMe);

    let aroundMeDiv = document.getElementById('around-me') as HTMLElement

    this.renderer.listen(aroundMeDiv, 'click', () => {
      const button = this;

      if(!this.positionBeforeLocateMe) {
        if (navigator.geolocation) {
          this.positionBeforeLocateMe = this.map.getCenter();

          // ask user and set position on map and switch button to "forget my position"
          navigator.geolocation.getCurrentPosition(position => {
            this.addMarkerMe({
              title:'Vous êtes ici!',
              coord: [position.coords.latitude,position.coords.longitude],
              icon: 'assets/images/marker-icon-user.svg',
              markerType: 'me',
              zoom: 12
            })
            this.setAroundMeButton(button,  false, aroundMeDiv)
            // TODO reset button if user moves the map far from his position (around me marker out of view)
            // this.map.on('movestart', function(e) {
              // if(this.markerMe && !this.map.getBounds().contains(this.markerMe.getLatLng())){
              //   setAroundMeButton(button);
              // }
              // this.setAroundMeButton(button, true,  aroundMeDiv)
            // })
          });
        } else {
          console.log('Geolocation is not supported by this browser.');
        }

      } else {
        this.map.panTo(this.positionBeforeLocateMe)
        this.map.setZoom(this.defaultZoom)
        this.setAroundMeButton(button, true,  aroundMeDiv)
      }
    })
  }

  mapClicked($event: any) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

}
