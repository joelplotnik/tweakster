const fs = require('fs')
const path = require('path')

const directoryPath = './' // Change this to your project directory if needed

function addReactImportToFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err)
      return
    }

    let modifiedData = data
      .split('\n')
      .map((line) => {
        if (line.includes("from 'react'") && !line.includes('import React')) {
          return line.replace('import {', 'import React, {')
        }
        return line
      })
      .join('\n')

    if (!data.includes('import React') && !data.includes("from 'react'")) {
      modifiedData = "import React from 'react';\n" + modifiedData
    }

    if (modifiedData !== data) {
      fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err)
          return
        }
        console.log(`Updated file: ${filePath}`)
      })
    }
  })
}

function walkDir(dir, callback) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err)
      return
    }

    files.forEach((file) => {
      const fullPath = path.join(dir, file.name)
      if (file.isDirectory()) {
        walkDir(fullPath, callback)
      } else if (file.isFile() && path.extname(fullPath) === '.jsx') {
        callback(fullPath)
      }
    })
  })
}

walkDir(directoryPath, addReactImportToFile)
