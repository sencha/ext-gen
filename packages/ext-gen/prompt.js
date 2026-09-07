// Thin wrappers over the maintained 'prompts' package, exposing the same
// List/Input/Confirm classes (constructor options + run()) that the
// abandoned prompt-list/prompt-input/prompt-confirm packages provided.
const prompts = require('prompts')

const onCancel = () => process.exit(130)

class Input {
  constructor(options) { this.options = options }
  async run() {
    const { answer } = await prompts({
      type: 'text',
      name: 'answer',
      message: this.options.message,
      initial: this.options.default
    }, { onCancel })
    return answer
  }
}

class Confirm {
  constructor(options) { this.options = options }
  async run() {
    const { answer } = await prompts({
      type: 'confirm',
      name: 'answer',
      message: this.options.message,
      initial: this.options.default === true
    }, { onCancel })
    return answer
  }
}

class List {
  constructor(options) { this.options = options }
  async run() {
    const choices = this.options.choices.map(c => ({ title: c, value: c }))
    const initial = Math.max(0, this.options.choices.indexOf(this.options.default))
    const { answer } = await prompts({
      type: 'select',
      name: 'answer',
      message: this.options.message,
      choices: choices,
      initial: initial
    }, { onCancel })
    return answer
  }
}

module.exports = { List, Input, Confirm }
