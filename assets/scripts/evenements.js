/*                                               */
/* Post Events (evenements) source handler class */
/*                                               */

const regexpLat = /^-?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)$/;
const regexpLng = /^-?(?:(?:1[0-7]|[1-9])?\d(?:\.\d+)?|180(?:\.0+)?)$/;
const regexpDate = /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|20)\d\d$)|(^29[\/]02[\/](19|20)(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/;

/***** required implementation ******/

function Evenements() {}

Evenements.prototype.formatData = function(data) {
	const lthis = this,
		jsonData = tryParseJson(data),
		returnData = [];
	let eventPostData = {},
		place = {},
		categoryId,
		excerpt,
		endDate,
		formatedEndDate,
		contact;

	if(!jsonData || !Array.isArray(jsonData)) {
		return false;
	}
	//console.log("Raw data : \n",jsonData);
	jsonData.filter(this.filter.bind(this)).forEach(e => {
		place = lthis.parsePlace(e.acf.place);
		categoryId = e.categories[0];
		formatedEndDate = formatDates(e.acf['date_end']);
		endDate = formatedEndDate ? e.acf['date_end'] : null;
		excerpt = !!e?.excerpt?.rendered ? new DOMParser().parseFromString(e.excerpt.rendered,"text/html").documentElement.textContent : null;
		contact = e.acf.contact[0] ?? null;

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
			contact: contact,
			contactImage: contact?.image?.url ?? contact?.image?.sizes?.thumbnail ?? null,
			excerpt: excerpt
		};
		returnData.push(eventPostData);
	});

	return returnData;
};

Evenements.prototype.popupTpl = function(data) {
	return (
		`<div id="events" style="overflow:auto;">
			<a class="events-category-label" href="${data.categoryURL}/" rel="category" title="${data.category}">${data.category}</a>
			<h2 id="events-title">
				<a href="${data.link}" target="_blank">${data.title}</a>
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
					<dd class="events-info-item-text">${!!data.price ? new DOMParser().parseFromString(data.price,"text/html").documentElement.textContent: 'Gratuit'}</dd>
				</dl>
			</div>
			<div class="events-contact">
				<div class="events-contact-image" style="background-image: url(${data.contactImage ?? `${imagesURL}mail-icon.svg`});background-size:${data.contactImage ? 'cover':'30%'}"></div>
				<div class="events-contact-text">
					<div class="events-contact-name">${data.contact.name}</div>
					<div class="events-contact-description">${data.contact.description}</div>
					<ul class="events-contact-details">
						<li><a href="tel:${data.contact.phone}" class="events-contact-phone">${data.contact.phone}</a></li>
						<li><a href="mailto:${data.contact.email}" class="events-contact-email">${data.contact.email}</a></li>
						<li><a href="${data.contact.website}" target="_blank" rel="noopener noreferrer" class="events-contact-website">${data.contact.website}</a></li>
					</ul>
				</div>
			</div>
			<div id="events-footer">
				<a class="website-button" target="_blank" href="${data.link}">Consulter l'évènement</a>
			</div>
		</div>`
	);
};

Evenements.prototype.filter = function(eventPostData) {
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

/***** optionnal implementation ******/

Evenements.prototype.parsePlace = function(placeData) {
	return( !!placeData && 'object' === typeof placeData ) ? placeData : tryParseJson(placeData);
};

Evenements.prototype.validatePostsEventsDates = function(acf) {
	if(!acf.date || !regexpDate.test(acf.date)) {
		return false;
	}

	const hasEndDateValue = !!acf['date_end'] && 'string' === typeof(acf['date_end']);

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
