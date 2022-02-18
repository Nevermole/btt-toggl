#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
// @ts-ignore
const token = __importStar(require("./token.json"));
const moment = __importStar(require("moment"));
require("moment-duration-format");
const apiKey = token.api_token;
const currentFileName = __dirname + '/current.json';
const inactiveIcon = __dirname + '/inactive.png';
const activeIcon = __dirname + '/active.png';
const limit = 32;
let authConfig = {
    username: apiKey,
    password: 'api_token'
};
let jsonHeader = { 'Content-encoding': 'application/json' };
function requestConfig(url, method = 'GET', additionalHeaders = {}) {
    return {
        method: method,
        url: url,
        auth: authConfig,
        headers: additionalHeaders
    };
}
function saveEntry(entry) {
    fs.writeFileSync(currentFileName, JSON.stringify(entry, null, 2));
}
function getCurrentTimeEntry() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let config = requestConfig(`${apiV8}/time_entries/current`);
        const result = yield axios_1.default(config);
        let entry = (_b = (_a = result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data;
        saveEntry(entry);
        return entry;
    });
}
const apiV8 = 'https://api.track.toggl.com/api/v8';
function getLastMeaningfulTimeEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = requestConfig(apiV8 + '/time_entries');
        const result = yield axios_1.default(config);
        let entries = result.data;
        let meaningfulEntries = entries.filter((entry) => Boolean(entry.description)
            && entry.description != "Pomodoro Break");
        return meaningfulEntries[meaningfulEntries.length - 1];
    });
}
function startATimeEntry() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const current = JSON.parse(fs.readFileSync(currentFileName).toString());
        const entry = {
            time_entry: {
                tags: ['automated', 'touchbar'],
                created_with: 'curl',
                billable: true
            }
        };
        if (current) {
            let timeEntry = entry.time_entry;
            timeEntry.pid = current.pid;
            timeEntry.wid = current.wid;
            timeEntry.description = current.description;
            timeEntry.tags = current.tags;
        }
        let config = requestConfig(`${apiV8}/time_entries/start`, 'POST', jsonHeader);
        config["data"] = entry;
        const result = yield axios_1.default(config);
        return (_b = (_a = result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data;
    });
}
function stopATimeEntry(current) {
    return __awaiter(this, void 0, void 0, function* () {
        yield axios_1.default(requestConfig(`${apiV8}/time_entries/${current.id}/stop`, 'PUT', jsonHeader));
    });
}
function truncated(str) {
    let dots = "...";
    let prefix = str.substr(0, limit);
    let suffix = str.substr(limit);
    return prefix + (suffix.length > dots.length ? dots : suffix);
}
/**
 * API returns duration but it's not very useful, as it does not represent duration of current entry.
 * In running entry it represents "negative value, denoting the start of the time entry in seconds since epoch"
 * But it also is not kept in sync with start time if that one is updated.
 */
function getDuration(current) {
    let start = Date.parse(current.start);
    const duration = moment.duration(Date.now().valueOf() - start.valueOf());
    return duration.format("h:mm", { trim: false });
}
function generateStatus(entry = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let current = entry;
        if (current == null) {
            current = yield getCurrentTimeEntry();
        }
        let statusText = '-';
        let icon = inactiveIcon;
        if (current) {
            icon = activeIcon;
            statusText = `${getDuration(current)} ${truncated(current.description)}`;
        }
        return {
            text: statusText,
            background_color: '0, 0, 0, 0',
            icon_path: icon
        };
    });
}
function toggle() {
    return __awaiter(this, void 0, void 0, function* () {
        const current = yield getCurrentTimeEntry();
        if (current) {
            yield stopATimeEntry(current);
            return generateStatus();
        }
        else {
            let entry = yield getLastMeaningfulTimeEntry();
            saveEntry(entry);
            const timeEntry = yield startATimeEntry();
            return generateStatus(timeEntry);
        }
    });
}
let outputResult = (status) => console.log(JSON.stringify(status));
if (process.argv.indexOf('toggle') !== -1) {
    toggle().then(outputResult).catch(console.error);
}
else {
    generateStatus().then(outputResult).catch(console.error);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esa0RBQStDO0FBQy9DLHVDQUF3QjtBQUN4QixhQUFhO0FBQ2Isb0RBQXFDO0FBQ3JDLCtDQUFpQztBQUNqQyxrQ0FBZ0M7QUFFaEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQTtBQUM5QixNQUFNLGVBQWUsR0FBRyxTQUFTLEdBQUcsZUFBZSxDQUFBO0FBRW5ELE1BQU0sWUFBWSxHQUFHLFNBQVMsR0FBRyxlQUFlLENBQUE7QUFDaEQsTUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLGFBQWEsQ0FBQTtBQUU1QyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUE7QUFZaEIsSUFBSSxVQUFVLEdBQUc7SUFDYixRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsV0FBVztDQUN4QixDQUFBO0FBRUQsSUFBSSxVQUFVLEdBQUcsRUFBQyxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBQyxDQUFBO0FBRXpELFNBQVMsYUFBYSxDQUNsQixHQUFXLEVBQ1gsU0FBaUIsS0FBSyxFQUN0QixvQkFBeUIsRUFBRTtJQUUzQixPQUFPO1FBQ0gsTUFBTSxFQUFFLE1BQU07UUFDZCxHQUFHLEVBQUUsR0FBRztRQUNSLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxpQkFBaUI7S0FDN0IsQ0FBQTtBQUNMLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxLQUFnQjtJQUMvQixFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNyRSxDQUFDO0FBRUQsU0FBZSxtQkFBbUI7OztRQUM5QixJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxLQUFLLHVCQUF1QixDQUFDLENBQUE7UUFF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