import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { getDirectoryContent, walkDirectoryContent } from 'dr-js/library/node/file/Directory'

import { runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { createExportParser } from 'dev-dep-tool/library/ExportIndex/parseExport'
import { generateExportInfo } from 'dev-dep-tool/library/ExportIndex/generateInfo'
import { renderMarkdownExportPath } from 'dev-dep-tool/library/ExportIndex/renderMarkdown'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const BABYLON_PLUGIN_LIST = [
  'objectRestSpread',
  'classProperties',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'jsx'
]

const collectSourceRouteMap = async ({ logger }) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ babylonPluginList: BABYLON_PLUGIN_LIST, logger })
  const parseWalkExport = (path, name) => parseExport(resolve(path, name))
  await walkDirectoryContent(await getDirectoryContent(fromRoot('source')), parseWalkExport)
  return getSourceRouteMap()
}

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    '* [Export Path](#export-path)',
    '',
    '#### Export Path',
    ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT })
  ].join('\n'))
}, getLogger('generate-export'))