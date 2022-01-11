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

const isString = (string, checkEmpty = false) => {
	let isString = 'string' === typeof string || string instanceof String;

	if(checkEmpty) {
		isString &= '' != string;
	}
	return isString;
}

const tryParseJson = str => {
	if (!isString(str)) {
		return false;
	}
	try{
		const json = JSON.parse(str);

		if (!!json && 'object' === typeof json) {
			return json;
		} else {
			return false;
		}
	}
	catch (e){
		return false;
	}
};

const formatDates = shortFrDate => {
	const options = {day: 'numeric', month: 'short', year: 'numeric'};
	let formatedDateData = null;

	if (isString(shortFrDate, true)) {
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

const capitalizeFirstLetter = string => (isString(string, true)) ? string[0].toUpperCase()+string.slice(1) : string;

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
	isString(sources[sourceIdentifier].selector) &&
	isString(sources[sourceIdentifier].sourceInfosURL) &&
	isString(sources[sourceIdentifier].sourceName) &&
	isString(sources[sourceIdentifier].serviceURL)
);

const isTouchScreen = () => {
  try{
  	document.createEvent("TouchEvent");
  	return true;
  }
  catch(e){
  	return false;
  }
};

const parseHtmlStringContent = content => {
	if(!isString(content)) {
		return null;
	}
	return new DOMParser().parseFromString(content,"text/html").documentElement.textContent;
};

const generateExcerpt = (string, length = 500, isLengthIncludingEllipsis = false) => {
	if (!isString(string)) {
		return null;
	}
	if (!parseInt(length) || 1 > length) {
		return '';
	}
	if (isLengthIncludingEllipsis && 0 < length - 3) {
		length -= 3;
	}
	return string.length > length ? string.substring(0, length) + '...' : string;
};