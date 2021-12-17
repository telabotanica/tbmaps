/*                                        */
/*  Default javascript configuration file */
/*                                        */

// e.g. http://localhost/tbmaps/assets/images/
const imagesURL = assetsURL +'images/';

// to add new source respect example in comments
const sources = {
	evenements: {
		selector: 'events',
		sourceInfosURL: 'https://beta.tela-botanica.org/test/evenements/',
		sourceName: 'évènements',
		serviceURL: `https://beta.tela-botanica.org/test/wp-json/wp/v2/posts?status=publish&categories=26,27,28,29&per_page=1000&order_by=modified&order=desc`,
		categories: {
			'26': {
				title: 'Congrès et conférences',
				icon: imagesURL+'marker-icon-bleu.svg'
			},
			'27': {
				title: 'Expositions',
				icon: imagesURL+'marker-icon-mauve.svg'
			},
			'28': {
				title: 'Sorties de terrain',
				icon: imagesURL+'marker-icon-vert.svg'
			},
			'29': {
				title: 'Stages et ateliers',
				icon: imagesURL+'marker-icon-orange.svg'
			}
		}
	},
	// e.g. other sources, optional and to implement
	/*observations: {
		selector: '',
		sourceInfosURL: '',
		sourceName: '',
		serviceURL: '',
		categories: {
			'[category id]': {// Important : typeof [category id] is string
				title: '[title]',
				icon: '[file name]'
			}
		}// optional
	},
	stations: {
		selector: '',
		sourceInfosURL: '',
		sourceName: '',
		serviceURL: ''
	}*/
};

// List sources (string lowercase) separated by comas
const sourceList = 'evenements';

// List Sources handlers classes (/!\ typeof these is not string) separated by comas, e.g. {Evenements,Observations,Stations}
const sourceClasses = {Evenements};

const osmFrTilesURL = 'https://osm.tela-botanica.org/tuiles/osmfr/{z}/{x}/{y}.png';
const googleTilesURL = 'https://mt1.google.com/vt/lyrs=y@12345&hl=fr&src=app&x={x}&y={y}&z={z}';
const reliefTilesURL = 'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png';
const profileURL = 'https://beta.tela-botanica.org/test/wp-content/plugins/tela-botanica/profil-par-id.php?id=';

const defaultCoord = [46,2];
const layerAttributions = {
	osm: `Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors,
	 <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>`,
	google:`Map data &copy;${new Date().getFullYear()} <a href="https://maps.google.com">Google</a>`
};
