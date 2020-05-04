const fs = require('fs')
const path = require('path')

function kcdbMake(kanmusu, publicPath) {
  if (!kanmusu) {
    console.log("No ship detected")
    return
  }
  console.log(`Running database creation on [${kanmusu}]`)

  const dirpath = path.join(publicPath, 'ship', kanmusu)
  if (!fs.existsSync(dirpath)) {
    console.log("Unable to find data at ", dirpath)
    return
  }

  const linesPath = path.join(dirpath, 'lines.txt')
  if (!fs.existsSync(linesPath)) {
    console.log("Unable to find lines at ", linesPath)
    return
  }


  const voicePath = path.join(dirpath, 'voices')
  if (!fs.existsSync(voicePath)) {
    console.log("Unable to find voices at ", voicePath)
    return
  }
  const voiceFiles = fs.readdirSync(voicePath)

  const data = fs.readFileSync(linesPath, "utf8")
  const lines = data.replace(/\r/g, '').split('\n')



  const database = {
    events: {},
    commands: {},
  }
  var headers = []
  var length = 0
  lines.map((line, index) => {
    let split = line.split('\t')
    if (index == 0) {
      length = split.length
      headers = split
      return
    }
    
    if (split.length != length) {
      console.log(`This line has something wrong [${line}]`)
      return
    }
    let key = split[0]
    let entry = {}
    headers.map((header, headerIndex) => {
      entry[header] = split[headerIndex]
      if (header == 'Voice' && !voiceFiles.includes(entry[header]) ) {
        console.log(`Cannot find voice for [${key}/${entry[header]}].`, entry)
        entry[header] = null
      }
      if (header == 'Command') {
        if (!database.commands[entry[header]]) { database.commands[entry[header]] = [] }
        database.commands[entry[header]].push(key)
      }
    })

    database.events[key] = entry
  })

  // Create a json file
  let databaseFile = path.join(publicPath, 'database', `${kanmusu}.json`)
  fs.writeFileSync(databaseFile, JSON.stringify(database))

  console.log(`[${kanmusu}.json] created`)
}

function runMakeFromNode() {
  var kanmusu = null
  try {
    if (process.argv != null && process.argv.length > 1) {
      kanmusu = process.argv.slice(1).join(' ')
      kcdbMake(kanmusu, path.join(process.cwd(), 'public'))
    }
  } catch (e) {
    console.log("Unable to run maker from the following: ", process.argv, e)
    return
  }
}

module.exports = {
  runMakeFromNode,
  kcdbMake
}