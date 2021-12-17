/***** init *****/

$(document).ready(function() {
	const tbMap = new TbMap();

	tbMap.init();
});

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
