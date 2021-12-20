/***** init *****/

$(document).ready(function() {
	const tbMap = new TbMap();

	readUrlParams();
	tbMap.init();
});

/***** globals ****/

const sources = {};
const sourceClasses = {};
const imagesPath = 'assets/images/';
const urlParams = {};
const regexpLat = /^-?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)$/;
const regexpLng = /^-?(?:(?:1[0-7]|[1-9])?\d(?:\.\d+)?|180(?:\.0+)?)$/;
const regexpDate = /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|20)\d\d$)|(^29[\/]02[\/](19|20)(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/;

/***** utils *****/

const tryParseJson = str => {
	if ( 'string' !== typeof str ){
		return false;
	}
	try{
		const json = JSON.parse( str );

		if ( !!json && 'object' === typeof json ) {
			return json;
		} else {
			return false;
		}
	}
	catch ( e ){
		return false;
	}
};

const formatDates = shortFrDate => {
	const options = {day: 'numeric', month: 'short', year: 'numeric'};
	let formatedDateData = null;

	if (undefined !== shortFrDate && 'string' === typeof(shortFrDate) && '' !== shortFrDate) {
		const dateParts = shortFrDate.split('/'),
			dateString = dateParts.reverse().join('-'),
			date = new Date(dateString),
			dateToLocaleDateString = date.toLocaleDateString('fr-FR', options).split(' ');

		formatedDateData = {
			dateString: dateString,
			localDateString : dateToLocaleDateString
		};
	}
	return formatedDateData;
};

const capitalizeFirstLetter = string => ('string' === typeof(string) && '' !== string) ? string[0].toUpperCase()+string.slice(1) : string;

const dynamicCallClass = dataAttrClassName => {
	let nameParts = dataAttrClassName.split('-');

	nameParts = nameParts.map(capitalizeFirstLetter);

	const className = nameParts.join('');

	return sourceClasses[className];
};

const readUrlParams = () => {
	const queryString = decodeURIComponent(window.location.search.substring(1)),
		parts = queryString.split('&');
	let paramPair,
		paramName;

	for (let i = 0; i < parts.length; i++) {
		paramPair = parts[i].split('=');
		paramName = paramPair[0];
		if (expectedParams.indexOf(paramName) >= 0) {
			urlParams[paramName] = paramPair[1];
		}
	}
};

const validSource = sourceIdentifier => (
	!!sources[sourceIdentifier] &&
	'string' === typeof(sources[sourceIdentifier].selector) &&
	'string' === typeof(sources[sourceIdentifier].sourceInfosURL) &&
	'string' === typeof(sources[sourceIdentifier].sourceName) &&
	'string' === typeof(sources[sourceIdentifier].serviceURL)
);
