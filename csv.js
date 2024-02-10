"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discogs_client_1 = require("@lionralfs/discogs-client");
let db = new discogs_client_1.DiscogsClient().database();
const ROW_NAMES = [
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
function fileToLines(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    const parsedLines = e.target.result.split(/\r|\n|\r\n/);
                    resolve(parsedLines);
                }
                else {
                    reject();
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    });
}
const fileInputElement = document.getElementById("fileInput");
if (fileInputElement) {
    fileInputElement.addEventListener("change", function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = e.target.files;
            if (files) {
                const file = files[0];
                try {
                    const idFiltered = (yield fileToLines(file)).filter((v) => v !== "");
                    const allRows = yield Promise.all(idFiltered.map(getRelease));
                    download(allRows);
                }
                catch (error) {
                    console.error("Error processing file:", error);
                }
            }
        });
    });
}
function getRelease(releaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield fetchRelease(releaseId);
            return processReleaseData(releaseId, data);
        }
        catch (error) {
            return {
                error: `Release with ID ${releaseId} does not exist`
            };
        }
    });
}
function fetchRelease(releaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://api.discogs.com//releases/${releaseId}`, {
            headers: {
                'User-Agent': 'DiscogsCSV/0.1',
                'Authorization': `Bearer ${process.env.API_KEY}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch release');
        }
        return response.json();
    });
}
function processReleaseData(releaseId, data) {
    var _a, _b;
    const { country = 'Unknown', genres = [], styles = [], year = 'Unknown' } = data;
    const artists = (_b = (_a = data.artists) === null || _a === void 0 ? void 0 : _a.map) === null || _b === void 0 ? void 0 : _b.call(_a, artist => artist.name);
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
    let formattedData = [
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
function download(data) {
    const csvContent = "data:text/csv;charset=utf-8," + ROW_NAMES.join(",") + "\n" + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
}
