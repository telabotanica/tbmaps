# Tela Botanica Maps

## Description

Displays data from given sources on a leaflet map with multiple map layers.  
Allows filtering on sources, and categories, from each source.  
Displays related information in (responsive) popup from each marker.  
Designed for integration in an iframe.  

## Install

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3, updated to version 20.3.15.

- `npm i`

# Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build --configuration production --base-href=/tbmaps/` to build the project on production server. The build artifacts will be stored in the `dist/` directory.

You will need to copy the content of the `dist/tbmaps-angular/browser` on your server

Or authorize ssh connection and create a script `./deploy.sh production` (`./deploy.sh beta` for test server)

## Usage

**You can use some parameters to customize the map** :
- `sources` : the main source to display (`evenements` by default, the other options are `sentiers` and `observations`)
- `logo` : an image url for your logo to be displayed on bottom left of the map
- `titre` : a title for your map
- `url_site` : the link on your logo to your website
- `zoom` : an integer between 2 and 18  (the default zoom is `7`)

To add some more custom parameters you will have to extend the app see **Extend** section below.

## Extend for Observations

Display public observations with pictures on the map

**List of parameters you can use to filter observations** :

- `referentiel` : filter by taxon referentiel
- `projet` : filter by project
- `taxon` : filter by taxon selected name (default navigation.limite of 15000)
- `num_nom_ret` : filter by taxon id number (default navigation.limite of 15000)
- `auteur` : filter by user (id or user e-mail)
- `standard` : `0` for all data, including non_standard data (`1` by default if parameter is missing)
- `famille` : filter by taxon family
- `projet` : filter by project
- `auteur` : filter by author pseudo, email or id
- `annee` : filter by observation modification date (default navigation.limite of 15000)
- `masque` : filter by taxon, family, user email, or user pseudo
- `navigation.limite` : setup the maximum number of observations to display (1000 by default)

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Default source for events

Default source is Tela-botanica (geolocated) post events called ***evenements*** (Évènements): 
* Page :  [https://www.tela-botanica.org/evenements/](https://www.tela-botanica.org/evenements/).
* Service called (wp rest api) for 1000 results :  [http://localhost/site_tela/wp-json/wp/v2/posts?status=publish&categories=26,27,28,29&per_page=1000&order_by=modified&order=desc](http://localhost/site_tela/wp-json/wp/v2/posts?status=publish&categories=26,27,28,29&per_page=1000&order_by=modified&order=desc).

### Post Events source Requirements (wordpress Tela Botanica website)

[_telabotanica/wp-theme-telabotanica_](https://github.com/telabotanica/wp-theme-telabotanica)

1. Check that requested categories ids in query string are all the children of category ***evenements*** (currently category evenement id is "25", requested categories are "26" to "29").

2. **Loading 1000 post events can be long** :turtle: **and may fail** so :
- make sure that [_wp-content/themes/telabotanica/inc/rest-api-posts-per-page.php_](https://github.com/telabotanica/wp-theme-telabotanica/inc/rest-api-posts-per-page.php) exists and registered in [_functions.php_](https://github.com/telabotanica/wp-theme-telabotanica/functions.php) (alows param `per_page` to request more than 100 results)
- Make sure the [***WP REST Cache***](https://wordpress.org/plugins/wp-rest-cache/) plugin is installed, active and properly configured
- To load 1000 post events it may be necessary to prime the cash by runing the request separately in a browser several times or try to load less data (800 or 500 seems to work). And roll the dice :game_die:.  
	Note that :  
		* you may have to delete some cash records during the process : unsuccessful requests may have been cashed  
		* after the request succeeds, delete all other request from the cash  
		* sometimes when the cash times out you have to repeat this operation from the beginning  

3. **Some custom fields are required in the returned data** :
- A field ***category*** listing category id, name and slug : make sure that [_wp-content/themes/telabotanica/inc/rest-api-posts-category-hierarchy.php_](https://github.com/telabotanica/wp-theme-telabotanica/inc/rest-api-posts-category-hierarchy.php) exists and registered in [_functions.php_](https://github.com/telabotanica/wp-theme-telabotanica/functions.php)
- A field ***acf*** Advanced Custom Fields, acf meta data object of the post :  make sure that [_wp-content/themes/telabotanica/inc/rest-api-posts-acf.php_ ](https://github.com/telabotanica/wp-theme-telabotanica/inc/rest-api-posts-acf.php) exists and registered in [_functions.php_](https://github.com/telabotanica/wp-theme-telabotanica/functions.php)
