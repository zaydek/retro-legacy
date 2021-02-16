package create_svetlana_app

import "github.com/zaydek/svetlana/pkg/term"

var usage = `
  ` + term.Bold("create-svetlana-app app-name") + `

    Creates a new Svetlana app at directory app-name.

  ` + term.Bold("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/svetlana") + `
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
