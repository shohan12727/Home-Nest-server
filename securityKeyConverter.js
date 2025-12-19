const fs = require('fs')
const jsonData = fs.readFileSync('./home-nest-firebase-admin-sdk.json')

const base64String = Buffer.from(jsonData, 'utf-8').toString('base64')
console.log(base64String)