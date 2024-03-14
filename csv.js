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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var discogs_client_1 = require("@lionralfs/discogs-client");
var db = new discogs_client_1.DiscogsClient().database();
var ROW_NAMES = [
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
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        if (e.target) {
                            var parsedLines = e.target.result.split(/\r|\n|\r\n/);
                            resolve(parsedLines);
                        }
                        else {
                            reject();
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsText(file);
                })];
        });
    });
}
var fileInputElement = document.getElementById("fileInput");
if (fileInputElement) {
    fileInputElement.addEventListener("change", function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var files, file, idFiltered, allRows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = e.target.files;
                        if (!files) return [3 /*break*/, 5];
                        file = files[0];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fileToLines(file)];
                    case 2:
                        idFiltered = (_a.sent()).filter(function (v) { return v !== ""; });
                        return [4 /*yield*/, Promise.all(idFiltered.map(fetchRelease))];
                    case 3:
                        allRows = _a.sent();
                        download(allRows);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error processing file:", error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
}
function fetchRelease(releaseId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.getRelease(releaseId)];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, processReleaseData(releaseId, data)];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, {
                            error: "Release with ID ".concat(releaseId, " does not exist")
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function processReleaseData(releaseId, data) {
    var _a, _b;
    var _c = data.country, country = _c === void 0 ? 'Unknown' : _c, _d = data.genres, genres = _d === void 0 ? [] : _d, _e = data.styles, styles = _e === void 0 ? [] : _e, _f = data.year, year = _f === void 0 ? 'Unknown' : _f;
    var artists = (_b = (_a = data.artists) === null || _a === void 0 ? void 0 : _a.map) === null || _b === void 0 ? void 0 : _b.call(_a, function (artist) { return artist.name; });
    var barcode = data.identifiers.filter(function (id) { return id.type === 'Barcode'; }).map(function (barcode) { return barcode.value; });
    var catno = data.labels.map(function (catno) { return catno.catno; });
    var uniqueCatno = __spreadArray([], new Set(catno), true);
    var descriptions = data.formats.map(function (descriptions) { return descriptions.descriptions; });
    var format = data.formats.map(function (format) { return format.name; });
    var labels = data.labels.map(function (label) { return label.name; });
    var uniqueLabels = __spreadArray([], new Set(labels), true);
    var qty = data.formats.map(function (format) { return format.qty; });
    var tracklist = data.tracklist.map(function (track) { return track.title; });
    // const delimiter = document.getElementById('delimiter').value || '|';
    var delimiter = '|';
    var formattedBarcode = barcode.join(delimiter);
    var formattedCatNo = uniqueCatno.join(delimiter);
    var formattedGenres = genres.join(delimiter);
    var formattedLabels = uniqueLabels.join(delimiter);
    var formattedStyles = styles.join(delimiter);
    var formattedTracklist = tracklist.join(delimiter);
    var preformattedDescriptions = descriptions.toString().replace('"', '""').replace(/,/g, ', ');
    var formattedDescriptions = '"' + preformattedDescriptions + '"';
    var formattedData = [
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
    var csvContent = "data:text/csv;charset=utf-8," + ROW_NAMES.join(",") + "\n" + data.map(function (e) { return e.join(","); }).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
}
