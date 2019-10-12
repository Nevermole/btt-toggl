#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
function saveCurrent(current) {
    fs.writeFileSync(currentFileName, JSON.stringify(current, null, 2));
}
function getCurrentTimeEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = requestConfig('https://www.toggl.com/api/v8/time_entries/current');
        const result = yield axios_1.default(config);
        if (!result.data && !result.data.data) {
            return null;
        }
        else {
            saveCurrent(result.data.data);
            return result.data.data;
        }
    });
}
function getLastMeaningfulTimeEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = requestConfig('https://www.toggl.com/api/v8/time_entries');
        const result = yield axios_1.default(config);
        let entries = result.data;
        let meaningfulEntries = entries.filter((entry) => Boolean(entry.description)
            && entry.description != "Pomodoro Break");
        return meaningfulEntries[meaningfulEntries.length - 1];
    });
}
function startATimeEntry() {
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
            entry.time_entry.pid = current.pid;
            entry.time_entry.wid = current.wid;
            entry.time_entry.description = current.description;
        }
        let config = requestConfig('https://www.toggl.com/api/v8/time_entries/start', 'POST', jsonHeader);
        config["data"] = entry;
        const result = yield axios_1.default(config);
        if (!result.data && !result.data.data) {
            return null;
        }
        else {
            return result.data.data;
        }
    });
}
function stopATimeEntry(current) {
    return __awaiter(this, void 0, void 0, function* () {
        yield axios_1.default(requestConfig(`https://www.toggl.com/api/v8/time_entries/${current.id}/stop`, 'PUT', jsonHeader));
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
        let current;
        if (entry == null) {
            current = yield getCurrentTimeEntry();
        }
        else {
            current = entry;
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
            return yield generateStatus();
        }
        else {
            let entry = yield getLastMeaningfulTimeEntry();
            saveCurrent(entry);
            const timeEntry = yield startATimeEntry();
            return yield generateStatus(timeEntry);
        }
    });
}
let outputResult = (status) => console.log(JSON.stringify(status));
if (process.argv.indexOf('toggle') !== -1) {
    toggle().then(outputResult);
}
else {
    generateStatus().then(outputResult);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxrREFBK0M7QUFDL0MsdUNBQXdCO0FBQ3hCLGFBQWE7QUFDYixvREFBcUM7QUFDckMsK0NBQWlDO0FBQ2pDLGtDQUFnQztBQUVoQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFBO0FBQzlCLE1BQU0sZUFBZSxHQUFHLFNBQVMsR0FBRyxlQUFlLENBQUE7QUFFbkQsTUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLGVBQWUsQ0FBQTtBQUNoRCxNQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsYUFBYSxDQUFBO0FBRTVDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQTtBQVdoQixJQUFJLFVBQVUsR0FBRztJQUNiLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxXQUFXO0NBQ3hCLENBQUE7QUFFRCxJQUFJLFVBQVUsR0FBRyxFQUFDLGtCQUFrQixFQUFFLGtCQUFrQixFQUFDLENBQUE7QUFFekQsU0FBUyxhQUFhLENBQ2xCLEdBQVcsRUFDWCxTQUFpQixLQUFLLEVBQ3RCLG9CQUF5QixFQUFFO0lBRTNCLE9BQU87UUFDSCxNQUFNLEVBQUUsTUFBTTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLGlCQUFpQjtLQUM3QixDQUFBO0FBQ0wsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLE9BQWtCO0lBQ25DLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUFFRCxTQUFlLG1CQUFtQjs7UUFDOUIsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLG1EQUFtRCxDQUFDLENBQUE7UUFFL0UsTUFBTSxNQUFN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