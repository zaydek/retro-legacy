package create

import "github.com/zaydek/retro/pkg/term"

var usage = `
  ` + term.Bold("create-retro-app [flags] app-name") + `

    Creates a new Retro app at directory ` + term.Bold("app-name") + `.

      --template=javascript  Use the JavaScript template (default)
      --template=typescript  Use the TypeScript template

  ` + term.Bold("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/retro") + `
`

var successFormat = `Successfully created ` + term.Bold("%[1]s") + `.

` + term.Bold("npm") + `

  1. npm
  2. npm run watch

` + term.Bold("yarn") + `

  1. yarn
  2. yarn watch

Happy hacking!`

var successDirectoryFormat = `Successfully created ` + term.Bold("%[1]s") + `.

` + term.Bold("npm") + `

  1. cd %[1]s
  2. npm
  3. npm run watch

` + term.Bold("yarn") + `

  1. cd %[1]s
  2. yarn
  3. yarn watch

Happy hacking!`
