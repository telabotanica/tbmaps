import {
  Component,inject,
  Inject, NgZone,
  Renderer2
} from '@angular/core';
import {CommonModule, DOCUMENT, NgComponentOutlet} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as L from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {DataService} from "./services/data.service";
import {CommonService} from "./services/common.service";
import {Event} from "./models/Event";
import {environment} from "../environments/environment";
import {NgxLeafletFullscreenModule} from "@runette/ngx-leaflet-fullscreen";
import {EventPopupComponent} from "./components/popups/event-popup/event-popup.component";
import {FormsModule} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FilterComponent} from "./forms/filter/filter.component";
import {Source} from "./models/Source";
import {forkJoin} from "rxjs";
import {Trail} from "./models/Trail";
import {TrailPopupComponent} from "./components/popups/trail-popup/trail-popup.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LeafletModule, NgxLeafletFullscreenModule, EventPopupComponent, FormsModule, EventPopupComponent, NgComponentOutlet, FilterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  baseUrlSite = environment.baseUrlSite;
  map!: L.Map;
  markers: L.Marker[] = [];
  isLoading = true;
  layerGroup = L.layerGroup();

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

  minZoom = 4;
  maxZoom = 18;
  defaultZoom = 7;

  sources: Source[] = [];
  defaultSource = 'evenements';
  sourceName = 'evenements'
  sourceDisplay = '';
  sourceCategories = false;
  categories: any
  markerMe! : any;
  positionBeforeLocateMe: any = null;
  dataToDisplay: any;

  expectedParams = [
    'titre',
    'logo',
    'sources',
    'zoom',
    'url_site'
  ]

  error!: string;

  events:any[] = [];
  trails:any[] = [];
  eventsCategories: any;

  mapDiv!: HTMLElement;
  popupDiv!: HTMLElement;
  closePopupDiv!: HTMLElement;

  private commonService = inject(CommonService)
  private dataService = inject(DataService)
  public dialog = inject(MatDialog);
  private renderer = inject(Renderer2);
  private zone = inject(NgZone)

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
  }

  ngOnInit(): void {
    this.options = {
      layers: [this.osmLayer],
      zoom: this.defaultZoom,
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

    this.sourceDisplay = 'évènements'

    const getEvents = this.dataService.getEvents();
    const getTrails = this.dataService.getTrails();

    //Chargement des données
    forkJoin([getEvents, getTrails]).subscribe((data: any) => {
      this.fillEvents(data[0])
      this.fillTrails(data[1])
      this.dataToDisplay = this.events;
      this.isLoading = false;

      this.loadMarkers()
    })

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

    let newSource = new Source('sentiers', 'sentiers', this.trails,  this.trails.length, 'assets/images/marker-icon-kaki.svg');
    this.sources.push(newSource)
  }

  ngAfterViewInit() {
    // this.mapDiv = document.getElementById('map') as HTMLElement
    this.mapDiv = document.getElementById('filters-zone') as HTMLElement
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

    // On supprime les markers existant
    if (this.map.hasLayer(this.layerGroup)) {
      this.layerGroup.clearLayers();
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
    })

    this.map.addLayer(this.layerGroup)

    return markers;
  }

  addMarker2(e: any, markers:any = null){

    const iconOptions = {
        options: {
          iconUrl: e.icon,
          shadowUrl: 'assets/images/marker-shadow.png',
          iconAnchor: new L.Point(12, 40),//correctly replaces the dot of the pointer
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

    L.marker(latLng, markerOptions)
      .addTo(this.map)
      .on('click', (e: any) => this.displayPopup(e, marker.data))
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

  displayPopup(e:any, markerData: any){

    // Ajout popup avec angular material
    this.zone.run(()=>{ // A utiliser pour charger les datas on init sinon ça load pas les infos dans le template, je sais pas pourquoi
      if (this.sourceName == 'evenements' || this.sourceName == '26' || this.sourceName == '27' || this.sourceName == '28' || this.sourceName == '29'){
        this.dialog.open(EventPopupComponent, {
          data: {
            data: markerData
          }
        })
          .afterClosed()
      } else if (this.sourceName == 'sentiers'){
        let occurrences:any[] = [];

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

            occurrences.push(taxon)
          })
          this.dialog.open(TrailPopupComponent, {
            data: {
              data: markerData,
              occurrences: occurrences
            }
          })
            .afterClosed()

          console.log(occurrences)
        })
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

  mapReady(e: L.Map) {

    this.map = e;

    let baseMaps = {
      "Plan": this.osmLayer,
      "Satellite": this.satelliteLayer
    };

    let layerControl = L.control.layers(baseMaps).addTo(this.map);
    // let spiderfier = new OverlappingMarkerSpiderfier(this.map, {nearbyDistance:10});
    this.aroundMeButton()

    // Reset the map
    // setTimeout(() => {
    //   e.invalidateSize();
    // }, 0);

    // this.map.setView([46,20], 7)
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
    // console.log($event.latlng.lat, $event.latlng.lng);
  }
  //
  // markerClicked($event: any, index: number) {
  //   console.log($event.latlng.lat, $event.latlng.lng);
  // }
  //
  // markerDragEnd($event: any, index: number) {
  //   console.log($event.target.getLatLng());
  // }

}
