# create-retro-app

Retro is a friendly development server and static-site generator (SSG) for React apps.

```

  Usage:

    retro create [dir]      Creates a new Retro app at directory dir
    retro watch [...paths]  Starts the dev server and watches paths for changes
    retro build             Builds the production-ready build
    retro serve             Serves the production-ready build

  retro create [dir]

    Creates a new Retro app at directory dir

      --language=[js|ts]    Programming language (default js)

  retro watch [...dirs]

    Starts a dev server and watches directories dirs for changes (default pages)

      --cached              Reuse cached props (disabled by default)
      --poll=<duration>     Poll duration (default 250ms)
      --port=<number>       Port number (default 8000)

  retro build

    Builds the production-ready build

      --cached              Reuse cached props (disabled by default)

  retro serve

    Serves the production-ready build

      --port=<number>       Port number (default 8000)

  Repository:

    https://github.com/zaydek/retro

```