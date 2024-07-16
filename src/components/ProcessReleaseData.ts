import { type GetReleaseResponse } from '@lionralfs/discogs-client/lib/types';

export default  {
  name: 'ProcessReleaseData',
  methods: {
    processReleaseData
  }
}

export function processReleaseData(releaseId: string, data: GetReleaseResponse) {

  const { country = 'Unknown', genres = [], styles = [], year = 'Unknown' } = data;
  const artists = data.artists?.map?.(artist => artist.name);
  const barcode = data.identifiers.filter(id => id.type === 'Barcode').map(barcode => barcode.value);
  const catno = data.labels.map(catno => catno.catno);
  const delimiter = '|';
  const descriptions = data.formats.map(descriptions => descriptions.descriptions);
  const format = data.formats.map(format => format.name);
  const labels = data.labels.map(label => label.name);
  const qty = data.formats.map(format => format.qty);
  const tracklist = data.tracklist.map(track => track.title);
  const uniqueCatno = [...new Set(catno)];
  const uniqueLabels = [...new Set(labels)];
  const formattedBarcode = barcode.join(delimiter);
  const formattedCatNo = uniqueCatno.join(delimiter);
  const formattedGenres = genres.join(delimiter);
  const formattedLabels = uniqueLabels.join(delimiter);
  const formattedStyles = styles.join(delimiter);
  const formattedTracklist = tracklist.join(delimiter);
  const preformattedDescriptions = descriptions.toString().replace('"', '""').replace(/,/g, ', ');
  const formattedDescriptions = '"' + preformattedDescriptions + '"';
  const formattedData: any[] = [
    releaseId,
    artists,
    format,
    qty,
    formattedDescriptions,
    formattedLabels,
    formattedCatNo,
    country,
    year,
    formattedGenres,
    formattedStyles,
    formattedBarcode,
    formattedTracklist
  ];

  return formattedData;
}