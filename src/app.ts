import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  unlinkSync,
} from 'fs'
import * as ncp from 'ncp'
import { promises as fsp } from 'fs'
import * as del from 'del'
const fsExtra = require('fs-extra')
import { exec } from 'child_process'
import { promisify } from 'util'
const ora = require('ora')
const promiseExec = promisify(exec)

const frontendSrcPath = process.env.frontendPath
const extensionPath = `${__dirname.replace('/dist', '')}/extension`
const extensionPathSrc = `${__dirname.replace('/dist', '')}/extension/src`

const dirsToScan: string[] = []
const filesToScan: string[] = []

const imports = new Set<string>()

interface Path {
  importPath: string
  package: boolean
  absPath?: string
  indexDir?: boolean
}

async function main() {
  const publish = process.env.publish === 'true'
  const spinner = ora(
    `${publish ? 'Building and publishing...' : 'Building'}`
  ).start()
  // Create dir for our extension
  await createDir()
  // Copy base of our extension
  await copyBase()

  // Execute loop while imports are changing
  let sizeOfScannedImports = imports.size
  while (true) {
    parseAndCopyFiles()
    if (sizeOfScannedImports === imports.size) {
      break
    }
    sizeOfScannedImports = imports.size
  }
  // Rewrite overlaped files that was added from frontend
  await copyBase()
  removeBrokenFiles()
  // Copy env file to extension directory
  await promiseExec('cp .env extension/')
  // Copy styles for todo form *Hardcoded
  await promiseExec(
    `cp ${frontendSrcPath}/components/TodoForm/TodoForm.scss extension/src/components/TodoForm/`
  )
  // Download all packages and build our app
  // We're building our app here, instead of direct yarn script due problems with yarn/npm
  await promiseExec(
    `cd extension && yarn && yarn ${publish ? 'build-and-publish' : 'build'}`
  )
  spinner.stop()
}

main()

function getMissingImports(directoryPath: string) {
  // Read given directory
  const files = readdirSync(directoryPath, { withFileTypes: true })
  files.forEach((file) => {
    // Getting abs path of every file in given directory
    const fileAbsPath = `${directoryPath}/${file.name}`
    if (file.isDirectory()) {
      dirsToScan.push(fileAbsPath)
    } else {
      filesToScan.push(fileAbsPath)
    }
  })
}

function copyBase() {
  return new Promise<void>((res) => {
    const extensionBasePath = `${__dirname.replace('/dist', '')}/extension-base`
    // Recursivly copy all files from base
    ncp(extensionBasePath, extensionPath, () => res())
  })
}

async function createDir() {
  const dirPath = extensionPath
  // Recursivly remove given directory
  await del(dirPath)
  // Create an empty one
  await fsp.mkdir(dirPath)
}

function getTextOfFile(path: string) {
  return readFileSync(path, 'utf-8')
}

function writeFile(dest: string, file: string) {
  return writeFileSync(dest, file, 'utf-8')
}

function parseImports(text: string) {
  // Splitting our text by newline and then filtering by import statements
  const linesOfText = text
    .split('\n')
    .filter(
      (line) =>
        (line.includes('from') ||
          line.includes('require(') ||
          line.includes("import './")) &&
        !line.includes('required') &&
        !line.includes('"from"')
    )
  return linesOfText
}

function getPath(importLine: string) {
  // Check if require import
  const requireImport = importLine.includes('require')
  // Check if import statement without from i.e. const foo = import(bar)
  const withoutFrom = importLine.includes("import '")
  if (requireImport) {
    importLine = importLine.split("require('")[1].split("'")[0]
  } else if (withoutFrom) {
    importLine = importLine.split('import ')[1].split("'")[1]
  } else {
    importLine = importLine.split('from')[1].split("'").join('').substring(1)
  }
  return {
    importPath: importLine,
    package: !importLine.startsWith('@/') && !importLine.startsWith('./'),
  } as Path
}

function getPaths(imports: Set<string>) {
  return [...imports].map((importString) => {
    return getPath(importString)
  })
}

function extractFilesAndDirs() {
  if (!dirsToScan.length) dirsToScan.push(extensionPathSrc)
  // Here we're getting our files and dirs we need to scan
  while (dirsToScan.length) {
    const dir = dirsToScan.pop()
    getMissingImports(dir)
  }
}

function extractImports() {
  // Here we're getting our imports from files
  while (filesToScan.length) {
    const file = filesToScan.pop()
    const parsedImports = parseImports(getTextOfFile(file))
    parsedImports.forEach((parsedImport) => imports.add(parsedImport))
  }
}

function parseAndCopyFiles() {
  extractFilesAndDirs()
  extractImports()
  // Here we're getting our paths of imports
  const importsInBase = getPaths(imports)
  // Here we're filterting imports that is not a npm packages
  const localImports = importsInBase.filter((importPath) => !importPath.package)
  // Here we're adding abs paths to our import-objects
  const pathsToImports = localImports.map((localImport) => {
    const pathCopy = localImport.importPath
    return Object.assign(localImport, {
      absPath: pathCopy.replace(
        `${pathCopy.startsWith('@') ? '@' : '.'}`,
        `${frontendSrcPath}`
      ),
    })
  })
  pathsToImports.forEach((path) => {
    const isDirectory =
      existsSync(path.absPath) && lstatSync(path.absPath).isDirectory()
    const isVueFile = path.absPath.endsWith('.vue') && existsSync(path.absPath)
    const isTsFile =
      !isDirectory && !isVueFile && existsSync((path.absPath += '.ts'))

    if (!isDirectory && !isVueFile && !isTsFile) {
      console.warn('Skipping file', path.absPath)
      return
    }

    let replacedPath = path.importPath.replace(
      `${path.importPath.startsWith('@') ? '@' : '.'}`,
      ''
    )
    if (isTsFile) replacedPath += '.ts'
    if (isTsFile && !path.absPath.endsWith('.ts')) replacedPath += '.ts'
    // Recursivly copy files
    fsExtra.copySync(path.absPath, `${extensionPathSrc}${replacedPath}`)
  })
}

function removeBrokenFiles() {
  // Completly remove router from our extension
  unlinkSync(`${extensionPath}/src/plugins/router.ts`)
  // Get text of main file
  let mainFile = getTextOfFile(`${extensionPath}/src/main.ts`)
  // Remove importing router
  mainFile = mainFile.replace(
    new RegExp("import router from './plugins/router'"),
    ''
  )
  // Remove using router in vue
  mainFile = mainFile.replace(new RegExp('router,'), '')
  // Write changed file back
  writeFile(`${extensionPath}/src/main.ts`, mainFile)
  // Rescan all folders to get all files
  extractFilesAndDirs()
  // Extract everything and remove from filesToScan
  const allFiles = filesToScan.splice(0, filesToScan.length)
  // Going thorugh all files to find strings that contain "router" word
  const filesWithRouter = allFiles.filter((filePath) => {
    return getTextOfFile(filePath).includes('router')
  })
  // Going through files where router in use
  filesWithRouter.forEach((filePath) => {
    // Get text of file
    const fileText = getTextOfFile(filePath)
    // Remove everything related to router from our file
    const textWithoutRouter = fileText
      .replace(new RegExp(/.*router.*/gm), '')
      .replace(new RegExp(/.*hashArr.*/gm), '')
      .replace(new RegExp(/\(extensionText\)/gm), '(false)')
      .replace(new RegExp(/= extensionText/gm), '= ""')
    // Write changed file
    writeFile(filePath, textWithoutRouter)
  })
}
