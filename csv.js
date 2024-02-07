const ROW_NAMES = [
  'release_id'
 ,'artist'
 ,'format'
 ,'qty'
 ,'format descriptions'
 ,'label'
 ,'catno'
 ,'country'
 ,'year'
 ,'genres'
 ,'styles'
 ,'barcode'
 ,'tracklist'
];

let allRows = [];
let idFiltered;

async function fileToLines(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const parsedLines = e.target.result.split(/\r|\n|\r\n/);
      resolve(parsedLines);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

document.getElementById('fileInput').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (file) {
      fileToLines(file).then(async releaseId => {
        idFiltered = releaseId.filter(function (v) { return v !== '' });
        if (file != undefined) {
          allRows = [];
        }

        for (let releaseId of idFiltered) {
          const row = await getRelease(releaseId);
          allRows.push(row);
        }
        download();
      });
    }
  });

function throttledQueue(maxRequestsPerInterval, interval, evenlySpaced) {
  if (evenlySpaced === void 0) { evenlySpaced = false; } // If all requests should be evenly spaced, adjust to suit.
  if (evenlySpaced) { interval = interval / maxRequestsPerInterval; maxRequestsPerInterval = 1; }
  const queue = [];
  let lastIntervalStart = 0;
  let numRequestsPerInterval = 0;
  let timeout;
  const dequeue = function () {
    const intervalEnd = lastIntervalStart + interval;
    let now = Date.now();
    if (now < intervalEnd) { 
      timeout = setTimeout(dequeue, intervalEnd - now);
      return;
    }
    lastIntervalStart = now;
    numRequestsPerInterval = 0;
    for (const _i = 0, _a = queue.splice(0, maxRequestsPerInterval); _i < _a.length; _i++) {
      const callback = _a[_i]; numRequestsPerInterval++; void callback();
    }
    if (queue.length) {
      timeout = setTimeout(dequeue, interval);
    }
    else { timeout = undefined; }
  };
  
  return function (fn) {
    return new Promise(function (resolve, reject) {
      const callback = function () {
        return Promise.resolve().then(fn).then(resolve).catch(reject);
      };
      let now = Date.now(); 
      if (timeout === undefined && (now - lastIntervalStart) > interval) { lastIntervalStart = now; numRequestsPerInterval = 0; }
      if (numRequestsPerInterval++ < maxRequestsPerInterval) { void callback(); }
      else {
        queue.push(callback);
        if (timeout === undefined) { timeout = setTimeout(dequeue, lastIntervalStart + interval - now); }
      }
    });
  };
}

const throttle = throttledQueue(1, 1000);

throttle(() => getRelease(idFiltered));

async function getRelease(idFiltered) {
  return fetch(`https://api.discogs.com/releases/${idFiltered}`, {
    headers: {
      'User-Agent': 'DiscogsCSV/0.1'
      ,'Authorization': `Discogs key=${KEY}, secret=${SECRET}`
      ,'Access-Control-Allow-Origin': '*'
      ,'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS'
      ,'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    },
  }).then(response => response.json())
    .then(data => {
      if (data.message === 'Release not found.') {
        return { error: `Release with ID ${idFiltered} does not exist` };
      } else {
        const { country = 'Unknown', genres = [], styles = [], year = 'Unknown' } = data;
        const artists = data.artists?.map?.(artist => artist.name);
        const barcode = data.identifiers.filter(id => id.type === 'Barcode').map(barcode => barcode.value);
        const catno = data.labels.map(catno => catno.catno);
        let uniqueCatno = [...new Set(catno)];
        const descriptions = data.formats.map(descriptions => descriptions.descriptions);
        const format = data.formats.map(format => format.name);
        const labels = data.labels.map(label => label.name);
        let uniqueLabels = [...new Set(labels)];
        const qty = data.formats.map(format => format.qty);
        const tracklist = data.tracklist.map(track => track.title);
        // const delimiter = document.getElementById('delimiter').value || '|';
        const delimiter = '|';
        const formattedBarcode = barcode.join(delimiter);
        const formattedCatNo = uniqueCatno.join(delimiter);
        const formattedGenres = genres.join(delimiter);
        const formattedLabels = uniqueLabels.join(delimiter);
        const formattedStyles = styles.join(delimiter);
        const formattedTracklist = tracklist.join(delimiter);
        const preformattedDescriptions = descriptions.toString()
          .replace('"', '""').replace(/,/g, ', ');
        const formattedDescriptions = '"' + preformattedDescriptions + '"';
        console.log(data);
        console.log(labels);
        console.log(formattedLabels);

        return [idFiltered,
           artists
          ,format
          ,qty
          ,formattedDescriptions
          ,formattedLabels
          ,formattedCatNo
          ,country
          ,year
          ,formattedGenres
          ,formattedStyles
          ,formattedBarcode
          ,formattedTracklist
        ];
      }
    });
}

function download() {
  const csvContent = 'data:text/csv;charset=utf-8,' + ROW_NAMES + '\n' + allRows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'my_data.csv');
  document.body.appendChild(link); // Required for Firefox
  link.click();
}
