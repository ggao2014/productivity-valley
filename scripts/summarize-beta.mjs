import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { summarizeBetaRecords } from './beta-summary-lib.mjs'

const inputs = process.argv.slice(2)
if (inputs.length === 0) {
  console.error('用法：npm run beta:summary -- <反馈 JSON 文件或目录> [...]')
  process.exitCode = 1
} else {
  const paths = inputs.flatMap((input) => {
    const path = resolve(input)
    return statSync(path).isDirectory()
      ? readdirSync(path)
          .filter((name) => name.endsWith('.json'))
          .map((name) => resolve(path, name))
      : [path]
  })

  const records = paths.flatMap((path) => {
    try {
      const value = JSON.parse(readFileSync(path, 'utf8'))
      return value?.format === 'productivity-valley-feedback-v1' ? [value] : []
    } catch {
      return []
    }
  })

  console.log(JSON.stringify(summarizeBetaRecords(records), null, 2))
}
