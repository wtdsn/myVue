import { parser } from './parser'
import { optimizer } from './optimizer'
import { generate } from './codegen/generate'

export function createCompiler(template, options) {
  const ast = parser(template.trim().replace(/<!--(.|\n|\r|\s)*?-->/g, ''), options)
  optimizer(ast)
  console.log("ast", ast);

  const code = generate(ast, options)

  return {
    ast,
    render: new Function(code.render),
    staticRenderFns: code.staticRenderFns.map(code => {
      return new Function(code)
    })
  }
}