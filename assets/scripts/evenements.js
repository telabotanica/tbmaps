/*                                               */
/* Post Events (evenements) source handler class */
/*                                               */



/******* required implementation ********/

/* Source */

sourceClasses['Evenements'] = Evenements;// see Class Evenements() below

sources.evenements = {// sources.['source name']
	// required :
	selector: 'events',
	sourceInfosURL: `${baseUrlSite}evenements/`,
	sourceName: 'évènements',// plural
	serviceURL: `${baseUrlSite}wp-json/wp/v2/posts?status=publish&categories=26,27,28,29&per_page=800&order_by=modified&order=desc`,
	// optionnal :
	categories: {
		'26': {
			title: 'Congrès et conférences',
			icon: imagesPath+'marker-icon-bleu.svg'
		},
		'27': {
			title: 'Expositions',
			icon: imagesPath+'marker-icon-mauve.svg'
		},
		'28': {
			title: 'Sorties de terrain',
			icon: imagesPath+'marker-icon-vert.svg'
		},
		'29': {
			title: 'Stages et ateliers',
			icon: imagesPath+'marker-icon-orange.svg'
		}
	}
};

/* Class implementation */

function Evenements() {}

/*
 * A method formating recieved data from source to display markers on map and informations in popups
 * see Tbmaps.processSourceData()
 */
// method name formatData required
Evenements.prototype.formatData = function(data) {
	const lthis = this,
		jsonData = tryParseJson(data),
		returnData = [];
	let eventPostData = {},
		place = {},
		categoryId,
		htmlStringContent,
		endDate,
		formatedEndDate,
		contact;

	if(!jsonData || !Array.isArray(jsonData)) {
		return false;
	}
	//console.log("Raw data : \n",jsonData);
	jsonData.filter(this.filterData.bind(this)).forEach(e => {
		place = lthis.parsePlace(e.acf.place);
		categoryId = e.categories[0];
		formatedEndDate = formatDates(e.acf['date_end']);
		endDate = formatedEndDate ? e.acf['date_end'] : null;
		contact = e.acf.contact[0] ?? null;
		htmlStringContent = !!e.content?.rendered ? e.content.rendered : !!e.acf?.description ? e.acf.description : !!e.excerpt?.rendered ? e.excerpt.rendered : '';

		eventPostData = {
			id: e.id,
			title: e.title.rendered,
			link: e.link,
			place: place,
			coord:[place.latlng.lat,place.latlng.lng],
			formatedStartDate: formatDates(e.acf.date),
			formatedEndDate: formatedEndDate,
			date: e.acf.date,
			endDate: endDate,
			icon: sources.evenements.categories[categoryId].icon,
			categoryId: categoryId,
			categoryURL: sources.evenements.sourceInfosURL+e.category.slug,
			category: e.category.name,
			price: e.acf.prices,
			markerType: 'events',
			source: 'evenements',
			contact: contact,
			contactImage: contact?.image?.url ?? contact?.image?.sizes?.thumbnail ?? null,
			excerpt: generateExcerpt( parseHtmlStringContent(htmlStringContent) )
		};
		returnData.push(eventPostData);
	});

	return returnData;
};

/*
 * A templating method to display informations in popups
 * see Tbmaps.displayPopup()
 */
// method name popupTpl required
Evenements.prototype.popupTpl = function(data) {
	return (
		`<div id="events" style="overflow:auto;">
			<a class="events-category-label" href="${data.categoryURL}/" rel="category" title="${data.category}" target="_parent">${data.category}</a>
			<h2 id="events-title">
				<a href="${data.link}" target="_parent">${data.title}</a>
			</h2>
			<div class="events-dates float-left" title="${data.endDate ?`Du`:`Le`}&nbsp;${data.date}${data.endDate ? `&nbsp;au ${data.endDate}`:""}">
				<time class="events-dates-item" datetime="${data.formatedStartDate.dateString}"><div class="events-dates-day">${data.formatedStartDate.localDateString[0]}</div><div class="events-dates-month">${data.formatedStartDate.localDateString[1]}</div></time>
				${data.formatedEndDate ? `<time class="events-dates-item is-end" datetime="${data.formatedEndDate.dateString}"><div class="events-dates-day">${data.formatedEndDate.localDateString[0]}</div><div class="events-dates-month">${data.formatedEndDate.localDateString[1]}</div></time>` : ''}
			</div>
			${data.excerpt ? `<p id="events-excerpt">${data.excerpt}</p>`:''}
			<div class="events-info">
				<h2 class="events-info-title"><span>Infos pratiques</span></h2>
				<dl class="events-info-items">
					<dt class="events-info-item-title">Adresse</dt>
					<dd class="events-info-item-text">${data.place.value}</dd>
					<dt class="events-info-item-title">Tarif</dt>
					<dd class="events-info-item-text">${!!data.price ? parseHtmlStringContent(data.price) : 'Gratuit'}</dd>
				</dl>
			</div>
			<div class="events-contact">
				${data.contactImage ? `<div class="events-contact-image" style="background-image: url(${data.contactImage});background-size:cover"></div>`:''}
				<div class="events-contact-text">
					<div class="events-contact-name">${data.contact.name}</div>
					<div class="events-contact-description">${data.contact.description}</div>
					<ul class="events-contact-details">
						<li><a href="tel:${data.contact.phone}" class="events-contact-phone" target="_parent">${data.contact.phone}</a></li>
						<li><a href="mailto:${data.contact.email}" class="events-contact-email" target="_parent">${data.contact.email}</a></li>
						<li><a href="${data.contact.website}" rel="noopener noreferrer" class="events-contact-website" target="_parent">${data.contact.website}</a></li>
					</ul>
				</div>
			</div>
		</div>
		<a class="website-button" href="${data.link}" target="_parent">Consulter l'évènement</a>`
	);
};



/******* optionnal implementation ********/

Evenements.prototype.filterData = function(eventPostData) {
	if(
		!eventPostData.acf?.place ||
		1 > eventPostData.acf.place.length ||
		!this.validatePostsEventsDates(eventPostData.acf)
	) {
		return false;
	}

	const place = this.parsePlace(eventPostData.acf.place);

	if(!place?.latlng?.lat || !place.latlng?.lng) {
		return false;
	}

	return (regexpLng.test(place.latlng.lng) && regexpLat.test(place.latlng.lat))
};

Evenements.prototype.parsePlace = function(placeData) {
	return( !!placeData && 'object' === typeof placeData ) ? placeData : tryParseJson(placeData);
};

Evenements.prototype.validatePostsEventsDates = function(acf) {
	if(!acf.date || !regexpDate.test(acf.date)) {
		return false;
	}

	const hasEndDateValue = isString(acf['date_end'], true);

	if(hasEndDateValue && !regexpDate.test(acf['date_end'])) {
		return false
	}

	const postEventDate = hasEndDateValue && regexpDate.test(acf['date_end']) ? acf['date_end'] : acf.date,
		postEventDateArray = postEventDate.split('/').reverse(),
		postEventFormatedDate = postEventDateArray.join('-'),
		postEventDateDateTime = new Date(postEventFormatedDate),
		date = new Date();

	return postEventDateDateTime >= date;
};
