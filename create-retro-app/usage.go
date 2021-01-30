package main

import "github.com/zaydek/create-retro-app/term"

var usage = `
  👾 ` + term.Bold("create-retro-app") + ` [flags] ` + term.Bold("app-name") + `

    Creates a new Retro app at directory ` + term.Bold("app-name") + `.

    Flags:

      --template=javascript  Use the JavaScript template (default)
      --template=typescript  Use the TypeScript template

  ` + term.Bold("Documentation:") + `

    ` + term.Underline("https://github.com/zaydek/create-retro-app") + `

  ` + term.Bold("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/create-retro-app") + `
`

var successfmt = `
  👾 Created Retro app ` + term.Bold("%[1]s") + `.

  ` + term.Bold("npm") + `

    1. cd %[1]s
    2. npm
    3. npm run watch

  ` + term.Bold("yarn") + `

    1. cd %[1]s
    2. yarn
    3. yarn watch

  Happy hacking!
`
