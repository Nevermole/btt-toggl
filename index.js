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
const moment = require("moment");
const fs = __importStar(require("fs"));
const token = __importStar(require("./token.json"));
const apiKey = token.api_token;
const currentFileName = __dirname + '/current.json';
function getCurrentTimeEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        var config = {
            method: 'GET',
            url: 'https://www.toggl.com/api/v8/time_entries/current',
            auth: {
                username: apiKey,
                password: 'api_token'
            }
        };
        const result = yield axios_1.default(config);
        if (!result.data && !result.data.data) {
            return null;
        }
        else {
            fs.writeFileSync(currentFileName, JSON.stringify(result.data.data, null, 2));
            return result.data.data;
        }
    });
}
function startATimeEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        const current = JSON.parse(fs.readFileSync(currentFileName).toString());
        const entry = { time_entry: {
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
        var config = {
            method: 'POST',
            url: 'https://www.toggl.com/api/v8/time_entries/start',
            auth: {
                username: apiKey,
                password: 'api_token'
            },
            headers: {
                'Content-encoding': 'application/json'
            },
            data: entry
        };
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
        var config = {
            method: 'PUT',
            url: `https://www.toggl.com/api/v8/time_entries/${current.id}/stop`,
            auth: {
                username: apiKey,
                password: 'api_token'
            },
            headers: {
                'Content-encoding': 'application/json'
            }
        };
        const result = yield axios_1.default(config);
        if (!result.data && !result.data.data) {
            return null;
        }
        else {
            return result.data.data;
        }
    });
}
function generateStatus(entry = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        let current;
        if (entry == undefined) {
            current = yield getCurrentTimeEntry();
        }
        else {
            current = entry;
        }
        let statusText = '--:--';
        let icon = __dirname + '/inactive.png';
        if (current) {
            icon = __dirname + '/active.png';
            const duration = moment.duration(new Date().valueOf() / 1000 + current.duration, 'seconds');
            statusText = `${moment(duration._data).format("H:mm")} ${current.description}`;
        }
        const status = {
            text: statusText,
            background_color: '0, 0, 0, 0',
            icon_path: icon
        };
        return status;
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
            const timeEntry = yield startATimeEntry();
            return yield generateStatus(timeEntry);
        }
    });
}
if (process.argv.indexOf('toggle') !== -1) {
    toggle().then(status => {
        console.log(JSON.stringify(status));
    });
}
else {
    generateStatus().then(status => {
        console.log(JSON.stringify(status));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxrREFBaUQ7QUFDakQsaUNBQWlDO0FBQ2pDLHVDQUF3QjtBQUN4QixvREFBcUM7QUFFckMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQTtBQUM5QixNQUFNLGVBQWUsR0FBRyxTQUFTLEdBQUUsZUFBZSxDQUFBO0FBVWxEOztRQUNJLElBQUksTUFBTSxHQUF1QjtZQUM3QixNQUFNLEVBQUUsS0FBSztZQUNiLEdBQUcsRUFBRSxtREFBbUQ7WUFDeEQsSUFBSSxFQUFFO2dCQUNGLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixRQUFRLEVBQUUsV0FBVzthQUN4QjtTQUNKLENBQUE7UUFFRCxNQUFNLE1BQU0sR0FBUSxNQUFNLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFBO1NBQ2Q7YUFBTTtZQUNILEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDNUUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtTQUMxQjtJQUNMLENBQUM7Q0FBQTtBQUVEOztRQUNJLE1BQU0sT0FBTyxHQUFjLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ2xGLE1BQU0sS0FBSyxHQUFRLEVBQUMsVUFBVSxFQUFFO2dCQUM1QixJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFD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