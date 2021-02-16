package create_retro_app

import "github.com/zaydek/retro/pkg/term"

var usage = `
  ` + term.Bold("create-retro-app app-name") + `

    Creates a new Retro app at directory app-name.

  ` + term.Bold("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/retro") + `
`

var successFormat = `Success!

npm:

  1. npm
  2. npm run start

yarn:

  1. yarn
  2. yarn start

Happy hacking!`

var successDirectoryFormat = `Success!

npm:

  1. cd %[1]s
  2. npm
  3. npm run start

yarn:

  1. cd %[1]s
  2. yarn
  3. yarn start

Happy hacking!`