import { parse } from '@babel/parser'
import generate from '@babel/generator'
import * as t from '@babel/types'

const parserOptions = { sourceType: 'module', plugins: ['jsx'] }

function literalValue(node) {
  if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node)) return node.value
  if (t.isArrayExpression(node) && node.elements.every(t.isStringLiteral)) return node.elements.map(item => item.value)
  return undefined
}

export function readMdx(source) {
  const exports = {}
  const lines = source.split(/\r?\n/)
  const body = lines.map(line => {
    if (!/^export\s+(const|let|var)\s+/.test(line.trim())) return line
    const ast = parse(line, parserOptions)
    const statement = ast.program.body[0]
    if (!t.isExportNamedDeclaration(statement) || !t.isVariableDeclaration(statement.declaration)) return line
    for (const declaration of statement.declaration.declarations) {
      if (t.isIdentifier(declaration.id)) {
        const value = literalValue(declaration.init)
        if (value !== undefined) exports[declaration.id.name] = value
      }
    }
    return ''
  }).join('\n').trim()
  return { exports, body }
}

function exportDeclaration(name, value) {
  const expression = Array.isArray(value)
    ? t.arrayExpression(value.filter(Boolean).map(item => t.stringLiteral(item)))
    : t.stringLiteral(value || '')
  return t.exportNamedDeclaration(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), expression)]))
}

export function writeMdx(metadata, body) {
  const fields = ['title', 'description', 'date', 'status', 'authors', 'categories', 'tags', 'series', 'cover']
  const program = t.program(fields.map(field => exportDeclaration(field, metadata[field])))
  return `${generate(program, { retainLines: false }).code}\n\n${body.trim()}\n`
}
