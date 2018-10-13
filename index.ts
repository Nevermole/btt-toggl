#!/usr/bin/env node
import axios, { AxiosRequestConfig } from 'axios'
import moment = require('moment')
import * as fs from 'fs'
import * as token from './token.json'

const apiKey = token.api_token
const currentFileName = __dirname +'/current.json'

interface TimeEntry {
    duration: number
    description: string
    id: string
    pid: string
    wid: string
}

async function getCurrentTimeEntry(): Promise<TimeEntry> {
    var config: AxiosRequestConfig = {
        method: 'GET',
        url: 'https://www.toggl.com/api/v8/time_entries/current',
        auth: {
            username: apiKey,
            password: 'api_token'
        }
    }

    const result: any = await axios(config)
    if (!result.data && !result.data.data) {
        return null
    } else {
        fs.writeFileSync(currentFileName, JSON.stringify(result.data.data, null, 2))
        return result.data.data
    }
}

async function startATimeEntry(): Promise<TimeEntry> {
    const current: TimeEntry = JSON.parse(fs.readFileSync(currentFileName).toString())
    const entry: any = {time_entry: {
        tags: ['automated', 'touchbar'],
        created_with: 'curl',
        billable: true
    }
}
    if (current) {
        entry.time_entry.pid = current.pid
        entry.time_entry.wid = current.wid
        entry.time_entry.description = current.description
    }
    var config: AxiosRequestConfig = {
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
    }

    const result: any = await axios(config)
    if (!result.data && !result.data.data) {
        return null
    } else {
        return result.data.data
    }
}

async function stopATimeEntry(current: TimeEntry): Promise<boolean> {
    var config: AxiosRequestConfig = {
        method: 'PUT',
        url: `https://www.toggl.com/api/v8/time_entries/${current.id}/stop`,
        auth: {
            username: apiKey,
            password: 'api_token'
        },
        headers: {
            'Content-encoding': 'application/json'
        }
    }

    const result: any = await axios(config)
    if (!result.data && !result.data.data) {
        return null
    } else {
        return result.data.data
    }
}

async function generateStatus(entry: TimeEntry? = undefined) { 
    let current: TimeEntry
    if (entry == undefined) {
        current = await getCurrentTimeEntry()
    } else {
        current = entry
    }
    
    let statusText = '--:--'
    let icon = __dirname + '/inactive.png'
    if (current) {
        icon = __dirname + '/active.png'
        const duration = moment.duration(
            new Date().valueOf() / 1000 + current.duration,
            'seconds'
        )
        statusText = `${moment(duration._data).format("H:mm")} ${
            current.description
        }`
    }
    const status = {
        text: statusText,
        background_color: '0, 0, 0, 0',
        icon_path: icon
    }
    return status
}

async function toggle() {
    const current = await getCurrentTimeEntry()
    if (current) {
        await stopATimeEntry(current)
        return await generateStatus()
    } else {
        const timeEntry = await startATimeEntry()
        return await generateStatus(timeEntry)
    }
}

if (process.argv.indexOf('toggle') !== -1) {
    toggle().then(status => {
        console.log(JSON.stringify(status))
    })
} else {
    generateStatus().then(status => {
        console.log(JSON.stringify(status))
    })
}
