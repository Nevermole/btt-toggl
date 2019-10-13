#!/usr/bin/env node
import axios, {AxiosRequestConfig} from 'axios'
import * as fs from 'fs'
// @ts-ignore
import * as token from './token.json'
import * as moment from 'moment';
import 'moment-duration-format';

const apiKey = token.api_token
const currentFileName = __dirname + '/current.json'

const inactiveIcon = __dirname + '/inactive.png'
const activeIcon = __dirname + '/active.png'

const limit = 32

interface TimeEntry {
    duration: number
    description: string
    start: string
    tags: Array<string>
    id: string
    pid: string
    wid: string
}

let authConfig = {
    username: apiKey,
    password: 'api_token'
}

let jsonHeader = {'Content-encoding': 'application/json'}

function requestConfig(
    url: string,
    method: string = 'GET',
    additionalHeaders: any = {}
): AxiosRequestConfig {
    return {
        method: method,
        url: url,
        auth: authConfig,
        headers: additionalHeaders
    }
}

function saveEntry(entry: TimeEntry) {
    fs.writeFileSync(currentFileName, JSON.stringify(entry, null, 2))
}

async function getCurrentTimeEntry(): Promise<TimeEntry | null> {
    let config = requestConfig('https://www.toggl.com/api/v8/time_entries/current')

    const result: any = await axios(config)
    let entry = result?.data?.data;

    saveEntry(entry)
    return entry
}

async function getLastMeaningfulTimeEntry(): Promise<TimeEntry> {
    let config = requestConfig('https://www.toggl.com/api/v8/time_entries')
    const result: any = await axios(config)
    let entries: Array<TimeEntry> = result.data

    let meaningfulEntries = entries.filter(
        (entry) => Boolean(entry.description)
            && entry.description != "Pomodoro Break")

    return meaningfulEntries[meaningfulEntries.length - 1]
}

async function startATimeEntry(): Promise<TimeEntry | null> {
    const current: TimeEntry = JSON.parse(fs.readFileSync(currentFileName).toString())
    const entry: any = {
        time_entry: {
            tags: ['automated', 'touchbar'],
            created_with: 'curl',
            billable: true
        }
    }
    if (current) {
        let timeEntry = entry.time_entry;
        timeEntry.pid = current.pid
        timeEntry.wid = current.wid
        timeEntry.description = current.description
        timeEntry.tags = current.tags
    }

    let config = requestConfig(
        'https://www.toggl.com/api/v8/time_entries/start',
        'POST',
        jsonHeader)
    config["data"] = entry

    const result: any = await axios(config)
    return result?.data?.data
}

async function stopATimeEntry(current: TimeEntry): Promise<void> {
    await axios(requestConfig(
        `https://www.toggl.com/api/v8/time_entries/${current.id}/stop`, 'PUT', jsonHeader))
}

function truncated(str: string) {
    let dots = "..."
    let prefix = str.substr(0, limit)
    let suffix = str.substr(limit)
    return prefix + (suffix.length > dots.length ? dots : suffix)
}

/**
 * API returns duration but it's not very useful, as it does not represent duration of current entry.
 * In running entry it represents "negative value, denoting the start of the time entry in seconds since epoch"
 * But it also is not kept in sync with start time if that one is updated.
 */
function getDuration(current: TimeEntry) {
    let start = Date.parse(current.start)
    const duration = moment.duration(Date.now().valueOf() - start.valueOf())
    return duration.format("h:mm", {trim: false})
}

async function generateStatus(entry: TimeEntry | null = null) {
    let current = entry
    if (current == null) {
        current = await getCurrentTimeEntry()
    }

    let statusText = '-'
    let icon = inactiveIcon
    if (current) {
        icon = activeIcon
        statusText = `${getDuration(current)} ${truncated(current.description)}`
    }
    return {
        text: statusText,
        background_color: '0, 0, 0, 0',
        icon_path: icon
    }
}

async function toggle() {
    const current = await getCurrentTimeEntry()
    if (current) {
        await stopATimeEntry(current)
        return await generateStatus()
    } else {
        let entry = await getLastMeaningfulTimeEntry()
        saveEntry(entry)

        const timeEntry = await startATimeEntry()
        return await generateStatus(timeEntry)
    }
}

let outputResult = (status: any) => console.log(JSON.stringify(status))

if (process.argv.indexOf('toggle') !== -1) {
    toggle().then(outputResult)
} else {
    generateStatus().then(outputResult)
}
