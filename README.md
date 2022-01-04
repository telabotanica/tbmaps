# Tela Botanica Maps

## Description

Displays data from given sources on a leaflet map with multiple map layers.  
Allows filtering on sources, and categories, from each source.  
Displays related information in (responsive) popup from each marker.  
Designed for integration in an iframe.  

## Install

Copy & paste [_assets/scripts/config.default.js_](assets/scripts/config.default.js) as _config.js_, then change the `baseUrlSite`.

## Usage

**You can use some parameters to customize the map** :
- `sources` : a coma separated list of sources for the map
- `logo` : an image url for your logo to be displayed on bottom left of the map
- `title` : a title for your map
- `website_url` : the link of your logo to your website
- `zoom` : an integer between 4 and 18  

To add some more custom parameters you will have to extend the app see **Extend** section below.

## Extend

### If you added some sources, you will have to:
- Implement your own [Source] js handler classe for each  
I recommend to copy the _evenements.js_ code and adapt, **you have to implement all methods and variables in "_required implementation_" part (see comments), and call the file like the class name (lower case)**.
- Maybe adapt the code in tb-maps.js if necessary
- Add some css in [_asset/css/[your source].css_](assets/css/)

* _If you expect iframe integration of the app, remember that links in `<a>` tags will open inside the iframe, unless you add them `target=""` attribute with `_blank` or `_parent` or `_top` value._

## Default source

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
