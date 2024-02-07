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
            const parsedLines = (e.target.result as string).split(/\r|\n|\r\n/);
            resolve(parsedLines);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

('fileInput').addEventListener('change', async function (e) {
    const file = (e.target as HTMLInputElement).files[0];
    if (file) {
        try {
            const idFiltered = (await fileToLines(file)).filter(v => v !== '');
            const allRows = await Promise.all(idFiltered.map(getRelease));
            download(allRows);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }
});

function getRelease(releaseId: string): Promise<ReleaseData | { error: string }> {
    return fetchRelease(releaseId)
        .then(data => processReleaseData(releaseId, data))
        .catch(error => ({ error: `Release with ID ${releaseId} does not exist` }));
}

async function fetchRelease(releaseId: string): Promise<ReleaseData> {
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

function processReleaseData(releaseId: string, data: ReleaseData): FormattedData {

    // Process and format data here

    return formattedData;
}

function download(data: FormattedData[]) {
    const csvContent = "data:text/csv;charset=utf-8," + ROW_NAMES.join(",") + "\n" + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
}

interface ReleaseData {

    // Define the structure of release data

}

interface FormattedData {

    // Define the structure of formatted data

}