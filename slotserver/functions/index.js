const functions = require('firebase-functions');
const express = require('express');
const log = require('./log')

// ========================================================
// Memory "database"
// ========================================================
var _history = log.history;

function validateReels(result) {
    if (result.reels && result.reels.length === 5) {
        for (const reel of result.reels) {
            if (reel.length !== 3) {
                return false;
            }
            for (const tile of reel) {
                if (tile < 0 || tile > 29) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}

function validateEqualLines(result) {
    if (result.equalLines) {
        if (result.equalLines.length > 3) {
            return false;
        }
        for (const line of result.equalLines) {
            if (line < 0 || line > 2) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function validateEqualTile(result) {
    return result.equalTile >= -1 && result.equalTile <= 29;
}

function appendResult(result) {
    if (result) {
        if (!validateReels(result))         return { success: false, error: "Invalid reels." }
        if (!validateEqualLines(result))    return { success: false, error: "Invalid equalLines." }
        if (!validateEqualTile(result))     return { success: false, error: "Invalid equalTile." }
        
        _history.push(result);
        return { success: true }
    }
    return { success: false, error: "Result is empty." }
}

// ========================================================
// Express
// ========================================================
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/results', (request, response) => {
    response.set('Cached-Control', 'public, max-age=30, s-maxage=60');
    response.send(_history);
});

app.post('/result', (request, response) => {
    const data = (request) ? request.body : null;
    try {
        response.send(appendResult(data));
    } catch (error) {
        response.send(String(error));
    }
});

exports.app = functions.https.onRequest(app);