package main

import "github.com/zaydek/create-retro-app/term"

var usage = `
  👾 ` + term.Bold("create-retro-app") + ` ` + term.Bold("[app-name]") + ` --template=[javascript|typescript]

    Creates a new Retro app at directory ` + term.Bold("[app-name]") + `.

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
