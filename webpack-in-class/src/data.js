import {
	parseMigrationData,
	parseMetadata,
	parseCountryCode
} from './utils';

import {csv} from 'd3';

const migrationDataPromise = csv('./data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = csv('./data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = csv('./data/country-metadata.csv', parseMetadata)
	.then(metadata => {
		//Convert metadata to a map
		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);

		return metadataMap;
	});

export {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise
}