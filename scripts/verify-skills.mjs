#!/usr/bin/env node
// verify-skills.mjs - guard against skill drift and CRLF churn.
//
// Two duplication clusters exist in this project. They are NOT the same kind
// of duplication and must not be policed identically:
//
//   1. vendor/skills (committed source of truth) versus
//      node_modules/mulqi-superpowers/vendor/skills (pnpm artifact)
//      The artifact is produced from the source, so the two MUST stay
//      byte-identical. Drift means someone hand-edited node_modules or forgot
//      to rebuild. HARD FAIL.
//
//   2. dsh-custom/plugins/dsh-superpowers/skills (an independent fork of
//      obra/superpowers with its own git remote). It is allowed to move ahead
//      of the bundle. Report it, never fail on it. WARN only.
//
// It also enforces LF on every tracked text file, so a Windows or WSL
// checkout cannot rewrite the tree to CRLF and hide real edits behind dozens
// of phantom modifications. That bug is why this script exists.
//
// Usage:
//   node scripts/verify-skills.mjs           human output
//   node scripts/verify-skills.mjs --json    machine output
//
// Exit codes: 0 = clean, 1 = hard failure.

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = join(REPO_ROOT, 'vendor', 'skills')

const DSH_HOME = process.env.DSH_HOME ?? join(process.env.HOME ?? '', '.dsh')
const WORKSPACE = process.env.MULQI_WORKSPACE ?? join(process.env.HOME ?? '', 'agent-workspace')

const INSTALLED_DIR =
  process.env.MULQI_INSTALLED_SKILLS ??
  join(DSH_HOME, 'profiles', 'web', 'node_modules', 'mulqi-superpowers', 'vendor', 'skills')

const FORK_DIR =
  process.env.MULQI_FORK_SKILLS ??
  join(WORKSPACE, 'dsh-custom', 'plugins', 'dsh-superpowers', 'skills')

const failures = []
const warnings = []
const notes = []

function fail(message) {
  failures.push(message)
}

function warn(message) {
  warnings.push(message)
}

function note(message) {
  notes.push(message)
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

// Skill name to absolute directory, for every child that has a SKILL.md.
function listSkills(root) {
  const map = new Map()
  if (existsSync(root) === false) return map
  const entries = readdirSync(root, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory() === false) continue
    const dir = join(root, entry.name)
    if (existsSync(join(dir, 'SKILL.md'))) map.set(entry.name, dir)
  }
  return map
}

function compareTrees(label, leftRoot, leftName, rightRoot, rightName, mode) {
  const strict = process.argv.includes('--strict')
  const report = mode === 'hard' ? fail : warn
  const left = listSkills(leftRoot)
  const right = listSkills(rightRoot)

  // A missing source tree is always fatal: nothing can be verified.
  if (left.size === 0) {
    fail(label + ': sumber ' + leftRoot + ' tidak ada atau kosong')
    return
  }

  // A missing comparison tree must never pass silently, otherwise deleting the
  // directory would be enough to make drift invisible. Without --strict it is a
  // warning (a fresh clone has no node_modules yet); with --strict it fails.
  if (right.size === 0) {
    const message = label + ': ' + rightRoot + ' tidak ada, perbandingan dilewati'
    if (mode === 'hard' && strict) fail(message)
    else warn(message)
    return
  }

  const leftNames = Array.from(left.keys())
  const rightNames = Array.from(right.keys())

  const onlyLeft = leftNames.filter(function (name) {
    return right.has(name) === false
  }).sort()

  const onlyRight = rightNames.filter(function (name) {
    return left.has(name) === false
  }).sort()

  const shared = leftNames.filter(function (name) {
    return right.has(name)
  }).sort()

  const diverged = shared.filter(function (name) {
    return sha256(join(left.get(name), 'SKILL.md')) !== sha256(join(right.get(name), 'SKILL.md'))
  })

  onlyLeft.forEach(function (name) {
    report(label + ': "' + name + '" hanya ada di ' + leftName)
  })
  onlyRight.forEach(function (name) {
    report(label + ': "' + name + '" hanya ada di ' + rightName)
  })
  diverged.forEach(function (name) {
    report(label + ': "' + name + '" isinya berbeda (' + leftName + ' vs ' + rightName + ')')
  })

  let clean = true
  if (onlyLeft.length !== 0) clean = false
  if (onlyRight.length !== 0) clean = false
  if (diverged.length !== 0) clean = false
  if (clean) note(label + ': OK, ' + shared.length + ' skill identik')
}

function checkGitattributes() {
  const path = join(REPO_ROOT, '.gitattributes')
  if (existsSync(path) === false) {
    fail('.gitattributes tidak ada di root repo, checkout Windows akan mengubah tree ke CRLF')
    return
  }
  const body = readFileSync(path, 'utf8')
  if (/eol=lf/.test(body) === false) {
    fail('.gitattributes ada tetapi tidak menetapkan eol=lf')
  }
  const required = ['*.sh', '*.cjs', '*.mjs', '*.js', '*.ts', '*.json', '*.md', '*.yml', '*.dot']
  const missing = required.filter(function (pattern) {
    return body.includes(pattern) === false
  })
  if (missing.length !== 0) {
    fail('.gitattributes belum mencakup: ' + missing.join(', '))
  }
}

function checkLineEndings() {
  let output = ''
  try {
    output = execFileSync('git', ['ls-files', '--eol'], { cwd: REPO_ROOT, encoding: 'utf8' })
  } catch (error) {
    note('git ls-files --eol gagal: ' + error.message)
    return
  }

  const bad = []
  const lines = output.split('\n')
  for (const line of lines) {
    if (line.trim() === '') continue
    const tab = line.indexOf('\t')
    if (tab === -1) continue
    const meta = line.slice(0, tab)
    const file = line.slice(tab + 1)
    if (meta.includes('w/crlf') || meta.includes('w/mixed')) bad.push(file)
  }

  if (bad.length !== 0) {
    const sample = bad.slice(0, 10).join(', ')
    fail('file tracked masih CRLF atau mixed: ' + sample + ' (total ' + bad.length + ')')
  } else {
    note('line endings: semua tracked text file LF')
  }
}

function main() {
  const asJson = process.argv.includes('--json')

  checkGitattributes()
  checkLineEndings()

  compareTrees(
    'source-vs-installed',
    SOURCE_DIR, 'vendor/skills (repo)',
    INSTALLED_DIR, 'node_modules artifact',
    'hard',
  )

  compareTrees(
    'source-vs-fork',
    SOURCE_DIR, 'vendor/skills (repo)',
    FORK_DIR, 'dsh-custom fork',
    'fork',
  )

  if (asJson) {
    process.stdout.write(JSON.stringify({ failures, warnings, notes }, null, 2) + '\n')
  } else {
    console.log('')
    notes.forEach(function (message) { console.log('  ok    ' + message) })
    warnings.forEach(function (message) { console.log('  warn  ' + message) })
    failures.forEach(function (message) { console.log('  FAIL  ' + message) })
    console.log('')
    console.log('failures=' + failures.length + ' warnings=' + warnings.length)
  }

  if (failures.length !== 0) process.exitCode = 1
}

main()
