const ROW_NAMES: string[] = [
    "release_id",
    "artist",
    "format",
    "qty",
    "format_descriptions",
    "label",
    "catno",
    "country",
    "year",
    "genres",
    "styles",
    "barcode",
    "tracklist"
];

async function fileToLines(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target) {
                const parsedLines = (e.target.result as string).split(/\r|\n|\r\n/);
                resolve(parsedLines);
            } else {
                reject();
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

const fileInputElement = document.getElementById("fileInput");

if (fileInputElement) {
    fileInputElement.addEventListener("change", async function (e: Event) {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
            const file = files[0];
            try {
                const idFiltered = (await fileToLines(file)).filter((v) => v !== "");
                const allRows = await Promise.all(idFiltered.map(getRelease));
                download(allRows);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        }
    });
}

// function getRelease(releaseId: string): Promise<ReleaseData | { error: string }> {
//     return fetchRelease(releaseId)
//         .then(data => processReleaseData(releaseId, data))
//         .catch(error => ({ error: `Release with ID ${releaseId} does not exist` }));
// }

async function getRelease(releaseId: string): Promise<any[] | { error: string }> {
    try {
        const { data } = await fetchRelease(releaseId);
        return processReleaseData(releaseId, data);
    } catch (error) {
        return {
            error: `Release with ID ${releaseId} does not exist`
        };
    }
}

async function fetchRelease(releaseId: string): Promise<{data: ReleaseData}> {
    const response = await fetch(`https://api.discogs.com//releases/${releaseId}`, {
        headers: {
            'User-Agent': 'DiscogsCSV/0.1',
            'Authorization': `Bearer ${process.env.API_KEY}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch release');
    }
    return response.json();
}

function processReleaseData(releaseId: string, data: ReleaseData) {

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
    const preformattedDescriptions = descriptions.toString().replace('"', '""').replace(/,/g, ', ');
    const formattedDescriptions = '"' + preformattedDescriptions + '"';
    let formattedData: any[] =
        [releaseId,
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
            formattedTracklist];

    return formattedData;
}

function download(data: any[]) {
    const csvContent = "data:text/csv;charset=utf-8," + ROW_NAMES.join(",") + "\n" + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
}

interface ReleaseData {

    artists: Array<any>;
    barcode?: string;
    catno: string;
    country?: string;
    descriptions?: Array<string>;
    format: string;
    formats: Array<any>;
    genres: Array<string>;
    identifiers: Array<any>;
    labels: Array<any>;
    qty: string;
    styles?: Array<string>;
    tracklist: Array<any>;
    year?: string;

}