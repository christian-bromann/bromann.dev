My Personal Website
===================

Just my personal website with blog posts. Happy to review and merge any PRs if useful.

# Prerequisites

- [Hugo](https://gohugo.io/) (v0.69.2 or higher)

# File Locations

Important files to edit are:

- `/content` for all content files
- `/data` for module content
- `/static/images` for all images
- `/static/sass` to modify CSS files using Sass
- `/assets/js` to modify JavaScript files
- `/layouts/` to modify templates
- `/static/` other static content

# Setup

First clone the project to a directory:

```sh
$ git clone git@github.com:christian-bromann/bromann.dev.git
$ cd bromann.dev
```

Get the template via:

```sh
$ git submodule init
$ git submodule update
```

# Run

Run page locally via:

```sh
$ hugo serve
```

The page should be available at [`localhost:1313`](http://localhost:1313).
