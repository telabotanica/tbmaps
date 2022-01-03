/*                                      */
/* Tela Botanica maps application class */
/*                                      */

/***** globals *****/

const osmFrTilesURL = 'https://osm.tela-botanica.org/tuiles/osmfr/{z}/{x}/{y}.png',
	googleTilesURL = 'https://mt1.google.com/vt/lyrs=y@12345&hl=fr&src=app&x={x}&y={y}&z={z}',
	profileURL = `${baseUrlSite}wp-content/plugins/tela-botanica/profil-par-id.php?id=`,
	defaultCoord = [46,2],
	layerAttributions = {
		osm: `Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors,
		 <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>`,
		google:`Map data &copy;${new Date().getFullYear()} <a href="https://maps.google.com">Google</a>`
	},
	maxZoom = 18,
	defaultSource = 'evenements',
	generateLayerOptions = layer => {
		return {
			attribution: layerAttributions[layer],
			maxZoom: maxZoom,
			noWrap: true
		};
	},
	osmLayer = new L.TileLayer(osmFrTilesURL, generateLayerOptions('osm')),
	satelliteLayer = new L.TileLayer(googleTilesURL, generateLayerOptions('google')),
	markers = {},
	expectedParams = [
		'titre',
		'logo',
		'sources',
		'zoom',
		'url_site'
	];

var map = null,
	zoom = 6,
	source,
	sourcesIdentifiers = [] ,
	configSource,
	sourceClassInstance,
	isLocated = false,
	markerMe = null,
	positionBeforeLocateMe = null;

/***** App class & methods *****/

function TbMap() {
	this.popup = null;
	this.timer = null;
	this.loadPointsRequest = null;
	this.$loadZone = $('#loading-zone');
	this.url = '';
}

TbMap.prototype.init = function() {
	this.getSourcesIdentifiers();
	if(!!sourcesIdentifiers) {
		this.initPage();
		this.initMap();
		this.initControlPanel();
		this.initSources();
		this.initSourcesFilters();
	}
};

TbMap.prototype.getSourcesIdentifiers = function() {
	if('sources' in urlParams &&  /^\w+(?:,\w+)?$/.test(urlParams.sources)) {
		sourcesIdentifiers = urlParams.sources.split(',').filter(validSource);
	}

	if (!sourcesIdentifiers.length) {
		sourcesIdentifiers = validSource(defaultSource) ? [defaultSource] : null;
	}
}

TbMap.prototype.initPage = function() {
	if ('titre' in urlParams) {
		$('#map-title-infos').html(urlParams.titre);
		$('#title-zone').removeClass('hidden');
	}
	if ('logo' in urlParams) {
		$('#image-logo').prop('src', urlParams.logo);
		// if a logo is requested, always disable default link to Tela Botanica
		let newUrl = 'url_site' in urlParams? urlParams.url_site : '#';
		$('#logo > a').prop('href', newUrl);
	}
};

TbMap.prototype.initMap = function() {
	const lthis = this;

	this.resizeMap();
	$(window).resize(function() {
		lthis.resizeMap();
	});

	zoom = 'zoom' in urlParams && Number.isInteger(zoom) ? urlParams.zoom : 6;

	map = L.map('map', {
		center : new L.LatLng(...defaultCoord),
		zoom : zoom,
		minZoom : 4,
		maxBounds : [[-85.0, -180.0], [85.0, 180.0]],
		maxZoom: maxZoom,
		layers : [osmLayer],
		gestureHandling: true,
		gestureHandlingOptions: {
			text: {
				touch: "Utilisez deux doigts pour déplacer la carte",
				scroll: "Vous pouvez zoomer sur la carte à l'aide de CTRL + Molette de défilement",
				scrollMac: "Vous pouvez zoomer sur la carte à l'aide de \u2318 + Molette de défilement"
			},
			duration: 1000
		}
	});
	satelliteLayer.addTo(map);
	osmLayer.addTo(map);
};

TbMap.prototype.resizeMap = function() {
	$('#map').height($(window).height());
	$('#map').width($(window).width());
};

TbMap.prototype.initControlPanel = function() {
	this.addScaleControl();
	this.addSourceFilters();
	this.addMapLayersControl();
	this.addAroundMeButton();
};

TbMap.prototype.addScaleControl = function() {
	const scaleOptions = {
		maxWidth : 50,
		metric : true,
		imperial : false,
		updateWhenIdle : true
	};

	map.addControl(new L.Control.Scale(scaleOptions));
};

TbMap.prototype.addSourceFilters = function() {
	const lthis = this,
		filterHtml = 1 < sourcesIdentifiers.length ? sourcesIdentifiers.forEach(lthis.addFiltersLayerGroup) : this.addFiltersLayerGroup(sourcesIdentifiers[0]);

	$('#filters-zone .filters-form').append(filterHtml);
	$('#filters-zone .filters-form .category-filter').each((i, filter) => {
		const span = $(filter).find('span'),
			SourceFilter = span.data('source'),
			categoryFilter = span.data('category');

		filter.style.backgroundImage =`url("${sources[SourceFilter].categories[categoryFilter].icon}")`;
	});
};

TbMap.prototype.addFiltersLayerGroup = function(layerSource) {
	source = layerSource;

	let radioOverlayMaps =
		`<h4>Filtrer les ${capitalizeFirstLetter(source)}</h4>
		<label class="source-filter">
			<input type="radio" class="input-filtes filter-${source}-all" name="layers-${source}" data-source="${source}" data-category="all">
			<span class="source-filter-label" data-source="${source}" data-category="all">${capitalizeFirstLetter(source)}</span>
		</label>`;

	if(!!sources[source].categories) {
		const categories = sources[source].categories;

		Object.keys(categories).forEach(id => radioOverlayMaps +=
			`<label class="category-filter">
				<input type="radio" class="input-filtes filter-${source}-${id}" name="layers-${source}" data-source="${source}" data-category="${id}">
				<span class="source-filter-label" data-source="${source}" data-category="${id}">${categories[id].title}</span>
			</label>`
		);
	}
	return `<div class="wrapper-filter">${radioOverlayMaps}</div>`;
};

TbMap.prototype.addMapLayersControl = function() {
	L.control.layers({
		Plan : osmLayer,
		Satellite : satelliteLayer,
	}).addTo(map);
	osmLayer.bringToFront();
	map.removeLayer(satelliteLayer);

	// keep the osm map layer as default and selected
	const basemapsSelector = $('.leaflet-control-layers-base .leaflet-control-layers-selector'),
		last = basemapsSelector.length - 1;

	basemapsSelector[0].checked = true;
	for(let i = 1; last >= i; i++) {
		basemapsSelector[i].checked = false;
	}
};

TbMap.prototype.addAroundMeButton = function() {
	const lthis = this,
		aroundMe = new L.Control({position : 'topleft'}),
		// toggle button locate/forget me
		setArroundMeButton = (button, doLocate = true) => {
			if(doLocate) {
				positionBeforeLocateMe = null;
				button.setAttribute('title','Autour de moi');
				button.innerHTML = '<span class="locate-me">Autour&nbsp;de&nbsp;moi</span>';
				button.classList.remove('warning');
				if(markerMe) {
					map.removeLayer(markerMe);
					markerMe = null;
				}
			} else {
				button.setAttribute('title','Revenir à la position précédente');
				button.innerHTML = '<span class="forget-me">Oublier&nbsp;ma&nbsp;position</span>';
				button.classList.add('warning');
			}
		};
	// set button on map
	aroundMe.onAdd = map => {
		const button = L.DomUtil.create('button', 'button around-me');

		setArroundMeButton(button);
		return button;
	};
	map.addControl(aroundMe);

	aroundMe._container.onclick = function() {
		const button = this;

		if(!positionBeforeLocateMe) {
			if (navigator.geolocation) {
				positionBeforeLocateMe = map.getCenter();

				// ask user and set position on map and switch button to "forget my position"
				navigator.geolocation.getCurrentPosition(position => {
					lthis.addMarker({
						title:'Vous êtes ici!',
						coord: [position.coords.latitude,position.coords.longitude],
						icon: imagesPath+'marker-icon-user.svg',
						markerType: 'me',
						zoom: 12
					});
					setArroundMeButton(button, false);

					// reset button if user moves the map far from his position (around me marker out of view)
					map.on('movestart', function(e) {
						if(isLocated && markerMe && !map.getBounds().contains(markerMe.getLatLng())){
							setArroundMeButton(button);
						}
					})
				});
			} else {
				console.log('Geolocation is not supported by this browser.');
			}
		} else {
			// set user position on map and switch button to "forget my position"
			if(positionBeforeLocateMe) {
				map.panTo(positionBeforeLocateMe);
			}
			map.setZoom(zoom);
			setArroundMeButton(button);
		}
	};
};

TbMap.prototype.initSourcesFilters = function() {
	$('.input-filtes').each((i, input) => {
		input.checked = 0 === i;
		input.onclick = this.filterSource.bind(this);
	});
};

TbMap.prototype.filterSource = function(evt) {
	const lthis = this,
		input = evt.target,
		sourceFilter = input.dataset.source,
		dataFilter = input.dataset.category,
		isChecked = 'on' === input.value;
	let options = {},
		removed = [];

	$.each(markers, (index,v) => {
		v.forEach(markersInfos => {
			if('all' !== dataFilter) {
				if(index !== dataFilter) {
					map.removeLayer(markersInfos.marker);
				} else if(!map.hasLayer(markersInfos.marker)){
					lthis.addMarker(markersInfos.options);
				}
			} else if(markersInfos.source === sourceFilter && !map.hasLayer(markersInfos.marker)){
				lthis.addMarker(markersInfos.options);
			}
		});

	});
};

/*
 * @params {Object} options - object containing arguments
 * @params {String} options.title - marker tooltip or popup title
 * @params {Number[]} options.coord - (array) coordinates
 * @params {Number} options.coord.0 - (float) latitude
 * @params {Number} options.coord.1 - (float) longitude
 * @params {String} options.icon - used to specify marker icon name
 * @params {String} options.markerType - source or marker type
 * @params {Number} [options.zoom] - (integer) map zoom if it has to be refocused on the marker
 *
 * @return {Void}
 */
TbMap.prototype.addMarker = function(options) {
	const lthis = this,
		type = options.markerType || '',
		iconOptions = this.markerIconOptions(options),
		icon = L.Icon.extend(iconOptions),
		zoomFocusBack = (undefined !== options.zoom && Number.isInteger(options.zoom)) ? options.zoom : zoom,
		markerOptions = {
			icon: new icon(),
			feature: options
		},
		latlng = new L.LatLng(options.coord[0], options.coord[1]);

	marker = new L.marker(latlng, markerOptions).addTo(map);
	marker.on('mouseover', function() {
		lthis.displayTooltip(options.title, map.latLngToContainerPoint(latlng));
	});
	marker.on('mouseout', () => $('#tooltip').css('display', 'none'));
	if('me' === type) {
		map.setView(latlng, zoomFocusBack);
		markerMe = marker;
	} else {
		marker.on('click', this.displayPopup.bind(this));
		category = `${options.categoryId}` || options.markerType;
		if(!markers[category]) {
			markers[category] = [];
		}
		options.source = source ?? options.markerType;
		markers[category].push({
			id: marker._leaflet_id,
			source: options.source,
			options: options,
			marker: marker
		});
	}
};

TbMap.prototype.markerIconOptions = function(iconInfos) {
	let returnedOptions = {
		options: {
			shadowUrl: imagesPath +'marker-shadow.png',
			iconAnchor: new L.Point(12, 40),//correctly replaces the dot of the pointer
			iconSize: new L.Point(24,40),
			iconUrl: iconInfos.icon
		}
	},
	classAttr = 'marker-'+iconInfos.markerType;

	if(!!iconInfos.categoryId) {
		classAttr += ` category-${iconInfos.markerType}-${iconInfos.categoryId}`;
	}
	returnedOptions.options.className = classAttr;

	return returnedOptions;
};

TbMap.prototype.initSources = function() {
	this.hidePopup();
	this.programMapRefresh();
};

TbMap.prototype.hidePopup = function() {
	if (!!this.popup && map.hasLayer(this.popup)) {
		map.removeLayer(this.popup);
	}
	this.popup = null;
};

TbMap.prototype.programMapRefresh = function() {
	const lthis = this;

	sourcesIdentifiers.forEach(originSource => {
		source = originSource;
		configSource = sources[source];
		$('#tooltip').css('display', 'none');
		if (null !== lthis.timer) {
			window.clearTimeout(lthis.timer);
		}
		if (!!lthis.loadPointsRequest) {
			lthis.stopAjaxRequest();
		}
		lthis.timer = window.setTimeout(lthis.loadSource(), 100);
	});

};

TbMap.prototype.stopAjaxRequest = function() {
	this.loadPointsRequest.abort();
	this.loadPointsRequest = null;
};

TbMap.prototype.loadSource = function() {
	if (this.inProgressRequest()) {
		this.loadPointsRequest.abort();
	}
	this.displayLoadingMessage(configSource.selector);
	this.url = configSource.serviceURL;
	this.ajaxRequestCallbackFunction = this.processSourceData;
	this.runAjax();
};

TbMap.prototype.inProgressRequest = function() {
	return (!!this.loadPointsRequest && 4 !== this.loadPointsRequest.readyState);
};

TbMap.prototype.displayLoadingMessage = function(element) {
	if ('none' === this.$loadZone.css('display')) {
		this.$loadZone.append(this.tooltipLoadingTpl());
		this.$loadZone.css('display', 'block');
	}
};

TbMap.prototype.tooltipLoadingTpl = function() {
	return (
		`<div id="loading-${configSource.selector}">
			<img src="${imagesPath}loading.gif" alt="Chargement en cours..." style="width:10%;">
			<p>Chargement des ${configSource.sourceName} en cours...</p>
		</div>`
	);
};

TbMap.prototype.hideLoadingMessage = function() {
	this.$loadZone.css('display', 'none');
	this.$loadZone.children().remove();
};

TbMap.prototype.runAjax = function() {
	const lthis = this;

	if (this.inProgressRequest()) {
		this.loadPointsRequest.abort();
	}
	this.loadPointsRequest = $.getJSON(this.url).always(function() {
		lthis.ajaxRequestCallbackFunction();
	});
};

TbMap.prototype.isRequestStatusOK = function() {
	return (
		(200 === this.loadPointsRequest.status || 304 === this.loadPointsRequest.status)
		|| 0 === this.loadPointsRequest.status
	);
};

TbMap.prototype.displayTooltip = function(responseText, point) {
	const $tooltip = $('#tooltip');

	$tooltip.html(responseText);
	if ('none' === $tooltip.css('display')) {
		const x = point.x - 15,
			y = point.y + 10;

		$tooltip.css('display', 'block');
		$tooltip.css('left', x + 'px');
		$tooltip.css('top', y + 'px');
	}
};

TbMap.prototype.displayPopup = function(e) {
	const lthis = this,
		data = e.target,
		removePopupHTML = () => {
			if(0 < $('#marker-embedded-infos-zone #popup').length) {
				$('#marker-embedded-infos-zone #popup').remove();
			}
		},
		latlng = new L.LatLng(data.getLatLng().lat, data.getLatLng().lng);

	removePopupHTML();
	$('#marker-embedded-infos-zone').append(
		`<div id="popup">
			<button class="close-popup">×</button>
			${sourceClassInstance.popupTpl(data.options.feature)}
		</div>`
	);
	$('#marker-embedded-infos-zone').addClass('visible');
	map.panTo(latlng);

	$('#marker-embedded-infos-zone .close-popup').on('click', function() {
		$('#marker-embedded-infos-zone').removeClass('visible');
		removePopupHTML();
		if(!!lthis.popup && map.hasLayer(lthis.popup)) {
			map.removeLayer(lthis.popup);
		}
		lthis.popup = null;
	});
};

TbMap.prototype.processSourceData = function() {
	const lthis = this,
		responseText = this.loadPointsRequest.responseText;

	this.hideLoadingMessage();
	if (!this.isRequestStatusOK()) {
		console.warn("La requête n’a pas abouti: \n", responseText);
	} else {
		const sourceClass = dynamicCallClass(source);

		sourceClassInstance = new sourceClass();

		const jsonData = sourceClassInstance.formatData(responseText);

		if (jsonData) {
			const categoriesCount = {};
			jsonData.forEach(singleSourceData => {
				const categoryId = singleSourceData.categoryId;

				if (!categoriesCount[categoryId]) {
					categoriesCount[categoryId] = 0;
				}
				categoriesCount[categoryId]++

				lthis.addMarker(singleSourceData);
			});
			this.updateFilters(categoriesCount);
		}
	}
};

TbMap.prototype.updateFilters = function(categoriesCount) {
	let $filter;

	$.each(configSource.categories, id => {
		$filter = $(`#filters-zone .filters-form .category-filter .filter-${source}-${id}`);
		if(!!categoriesCount[id]) {
			$filter.closest('.category-filter').removeClass('disabled');
			$filter.prop('disabled',false)
				.next('span').append(` (${categoriesCount[id]})`);
		} else {
			$filter.closest('.category-filter').addClass('disabled');
			$filter.prop('disabled',true)
				.next('span').append(' (0)');
		}
	});
};
