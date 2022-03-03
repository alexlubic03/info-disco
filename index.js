const https = require('https')
const http = require('http')
const ipRangeCheck = require("ip-range-check")

// get https://ip-ranges.amazonaws.com/ip-ranges.json
// get public IP for service being tested
// cross reference aws CIDRs and public IP

const sendRequest = (url) => {
  return new Promise((resolve) => {
    http.get(`http://${url}`, (res) => {
      resolve(res)
    })
  })
}

const printHeaders = (res) => {
  console.log(res.headers)
  return Promise.resolve(res)
}

const getPublicIp = (res) => {
  return Promise.resolve(res.socket.remoteAddress)
}

const checkAwsRanges = (ip) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ip-ranges.amazonaws.com',
      port: 443,
      path: '/ip-ranges.json',
      method: 'GET'
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        response = JSON.parse(data);
        const matches = []
        for (let i = 0; i < response.prefixes.length; i++) {
          if (ipRangeCheck(ip, response.prefixes[i].ip_prefix)) {
            matches.push(response.prefixes[i])
          }
        }
        resolve(matches)
      })
    })
    req.on('error', reject)
    req.end()
  })
}

const printResults = (matches) => {
  console.log(matches)
}

const url = process.argv.slice(2, 3)

sendRequest(url)
  .then(printHeaders)
  .then(getPublicIp)
  .then(checkAwsRanges)
  .then(printResults)
