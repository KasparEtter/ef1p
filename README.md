# Explained from First Principles

This repository contains the website
[explained-from-first-principles.com](https://explained-from-first-principles.com),
which is built with [Jekyll](https://jekyllrb.com)
and published with [GitHub Pages](https://pages.github.com).

## Contents

This document has the following sections:
- [Setup](#setup) with [requirements](#requirements)
  and [instructions](#instructions) to serve this website
- [Development](#development) with [requirements](#requirements-1)
  and [dependencies](#dependencies) to [build](#build), [lint](#lint), and [watch](#watch)
  the source files with instructions to do the same just for:
  - [Articles](#articles) for the Markdown files ending in `.md` using Jekyll
  - [Styles](#styles) for the Sass files ending in `.scss` in the `scss` folder
  - [Scripts](#scripts) for the TypeScript files ending in `.ts` or `.tsx`
  - [Libraries](#libraries) to update the external JavaScript libraries in the `<head>`
  - [Favicons](#favicons) to generate the favicons in `assets/favicons`
- [Documentation](#documentation) of custom features and common patterns:
  - [Articles](#articles-1) lists the available front matter attributes
  - [Preview](#preview) refers to websites to refresh cached previews
  - [Markdown](#markdown) documents various advanced Markdown features
  - [Images](#images) describes how to scale and embed images in articles
  - [Graphics](#graphics) explains how to generate and embed SVG graphics
  - [Math](#math) shows how to write both inline as well as block math
  - [PDF](#pdf) details how to generate a PDF of an article with a script
  - [Timestamps](#timestamps) summarizes how to create and verify timestamps
- [About](#about) section with information on [how to contribute](#contributions),
  [used dependencies](#dependencies-1), [copyright owner](#copyright),
  [chosen license](#license), and how to [contact me](#contact).

## Setup

### Requirements

#### Unix shell

The following instructions assume that you roughly know
how to use a [Unix shell](https://en.wikipedia.org/wiki/Unix_shell).

##### macOS Terminal

If you are using macOS,
open the Terminal located at `/Applications/Utilities/Terminal.app`.

#### Package manager

The required tools are easiest to install, upgrade and remove with
a [package manager](https://en.wikipedia.org/wiki/Package_manager).

##### macOS Homebrew

*Attention:*
You might have to perform some of the following steps with a user
which has administrator rights at the operating system level
but I still need to verify this.

[Homebrew](https://brew.sh) is the most popular package manager for macOS.
To check whether Homebrew is already installed on your system,
run `brew --version`.
If you have not the [newest version](https://github.com/Homebrew/brew/releases),
you can update Homebrew with `brew update`.

If Homebrew is not yet installed,
install it by entering in your Terminal:

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Git

[Git](https://git-scm.com/) is a distributed version control system
designed to track changes in text documents such as source code.

You can run `git --version` to check whether Git is already installed
and [download](https://git-scm.com/downloads) it otherwise.

##### macOS Git

You can also install Git with Homebrew:

```bash
brew install git
```

#### Ruby

Install (or upgrade) [Ruby](https://www.ruby-lang.org).

##### macOS Ruby

In order to avoid [file permission issues](https://stackoverflow.com/questions/14607193/installing-gem-or-updating-rubygems-fails-with-permissions-error),
install Ruby with Homebrew on macOS:

```bash
brew install ruby
```

Add the paths indicated by the Ruby install script to your `~/.bashrc`:

```bash
export PATH="/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/2.6.0/bin:$PATH"
```

Reload your shell for the changes to take effect by opening a new window/tab
or by [entering](https://stackoverflow.com/questions/2518127/how-do-i-reload-bashrc-without-logging-out-and-back-in) `. ~/.bashrc`.

Depending on what shell you use,
your [configuration file](https://en.wikipedia.org/wiki/Unix_shell#Configuration_files) can be different.

### Instructions

#### Clone this repository

Navigate to the directory
in which you would like to store this repository:

```bash
cd path/to/desired/directory
```

Clone this repository
(or a fork thereof)
either using SSH
if you have an account at [GitHub](https://github.com)
with an [SSH key](https://help.github.com/en/articles/connecting-to-github-with-ssh):

```bash
git clone git@github.com:KasparEtter/ef1p.git
```

or using HTTPS otherwise:

```bash
git clone https://github.com/KasparEtter/ef1p.git
```

#### Enter this repository

Navigate to the root directory of this repository:

```bash
cd ef1p
```

Most of the following commands have to be called from this directory.

#### Update this repository

If you already cloned this repository,
you can pull in the newest changes with:

```bash
git pull
```

#### Install Bundler

Install [Bundler](https://bundler.io)
and replace a potentially existing installation:

```bash
gem install bundler
```

#### Install all dependencies

Install all Ruby dependencies with:

```bash
bundle config set path 'vendor/bundle'
bundle install
```

You have to execute the first line only once.
The configuration is then stored in `.bundle/config`.
This file is intentionally not under version control.

In order to run the [same versions](https://pages.github.com/versions/)
as the [GitHub Pages](https://pages.github.com) server,
update the dependencies from time to time:

```bash
bundle update
```

You can check the versions of your local dependencies with:

```bash
gem list
```

#### Serve the website

Serve the website from the root directory of this repository:

```bash
bundle exec jekyll serve --livereload
```

If you got no errors,
you can open the website at [http://localhost:4000](http://localhost:4000).

If you want to serve the website in your local network:

```bash
bundle exec jekyll serve --livereload --host=0.0.0.0
```

Use `npm run watch` as described below
to also watch for changes in scripts and styles.

## Development

The articles, scripts and styles need to be rebuilt after making changes to them.

### Requirements

#### Node.js

Install [Node.js](https://nodejs.org) with [npm](https://www.npmjs.com).

You can check whether Node.js and npm are already installed with:

```bash
node -v
npm -v
```

If they are,
you can update npm with:

```bash
npm install -g npm
```

##### macOS Node.js

You can also install Node.js and npm with Homebrew:

```bash
brew install node
```

### Dependencies

#### Install

Install the npm dependencies as specified in `package.json` with:

```bash
npm install
```

#### Update

Update all dependencies to their latest version
respecting [Semantic Versioning](https://semver.org):

```bash
npm update
```

If you want to update all dependencies to their latest version ignoring the specified versions,
you can use [npm-check-updates](https://www.npmjs.com/package/npm-check-updates):

```bash
npx npm-check-updates # Shows which dependencies can be updated.
npx npm-check-updates -u # Updates the versions in the package file.
npm install # Installs the new versions according to the package file.
```

If vulnerabilities were found,
fix them with:

```bash
npm audit fix
```

#### Check

Show the version of a particular direct or indirect dependency:

```bash
npm show [dependency] version
```

Show the tree of all direct and indirect dependencies:

```bash
npm list
```

### Combined

All the following scripts are defined in `package.json`.

#### Build

Use the following script to build the articles, scripts and styles:

```bash
npm run build
```

#### Lint

Use the following script to lint the articles, scripts and styles in parallel:

```bash
npm run lint
```

#### Watch

Use the following script to watch the articles, scripts and styles simultaneously:

```bash
npm run watch
```

### Articles

#### Build

If you change a [Markdown](https://guides.github.com/features/mastering-markdown/) file,
it needs to be regenerated as HTML
and copied to the `_site` folder:

```bash
npm run md-build
```

#### Lint

All Markdown files have to pass [markdownlint](https://github.com/DavidAnson/markdownlint)
with the rules specified in `.markdownlint.json`.
If you are using [Visual Studio Code](https://code.visualstudio.com/),
you can install this [extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint).

```bash
npm run md-lint
```

#### Newlines

Please start a new line at least for each sentence.
You can also include more line breaks
according to the [Semantic Line Breaks Specification](https://sembr.org).

#### Watch

If you want the website to reload automatically on any changes to Markdown files,
you can run the following script:

```bash
npm run md-watch
```

Please note that all errors by the script `md-watch` are ignored using `2>/dev/null`.
If you run into problems,
don't forget to remove this suppression for debugging.
I decided to do this in order to get rid of the following issues outside of my control:
- `vendor/bundle/ruby/2.7.0/gems/jekyll-3.8.5/lib/jekyll/convertible.rb:41: warning: Using the last argument as keyword parameters is deprecated`
- `ERROR: directory is already being watched!` for directories in `node_modules/puppeteer/` (see [this page](https://github.com/guard/listen/wiki/Duplicate-directory-errors) for more information).

### Styles

#### Build

If you change any of the [Sass](https://sass-lang.com) files in `scss`,
you have to compile, prefix and minify the CSS again with:

```bash
npm run css-build
```

The full and minified CSS for both the dark and the light theme are written to `assets/styles`.
You have to run `npm run md-build` to copy the CSS files to the `_site` directory
from which the website is served
in order for them to take effect.

#### Lint

All Sass files have to pass [stylelint](https://stylelint.io)
with the rules specified in `.stylelintrc`.
If you are using [Visual Studio Code](https://code.visualstudio.com/),
you can install this [extension](https://marketplace.visualstudio.com/items?itemName=shinnn.stylelint).

```bash
npm run css-lint
```

#### Watch

If you want to rebuild the styles automatically when you change a Sass file,
you can run the following script:

```bash
npm run css-watch
```

Please note that
in order for the rebuilt styles to take effect
you also have to run `npm run md-watch`.

### Scripts

#### Build

If you change any of the [TypeScript](https://www.typescriptlang.org) files in `typescript`
or in one of the article folders,
you have to compile and minify them again with:

```bash
npm run ts-build
```

The minified JavaScript is written to `assets/scripts`.
You have to run `npm run md-build` to copy the JavaScript files to the `_site` directory
from which the website is served
in order for them to take effect.

#### Lint

All TypeScript files have to pass [TSLint](https://palantir.github.io/tslint/)
with the rules specified in `tslint.json`.
If you are using [Visual Studio Code](https://code.visualstudio.com/),
you can install this [extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin).

```bash
npm run ts-lint
```

#### Watch

If you want to rebuild the scripts automatically when you change a TypeScript file,
you can run the following script:

```bash
npm run ts-watch
```

Please note that
in order for the rebuilt scripts to take effect
you also have to run `npm run md-watch`.

### Libraries

If you want to update the external JavaScript libraries in `assets/scripts/external/`,
which are imported in `_layouts/head.html`,
you have to download them manually from the following links:

- [jQuery](https://code.jquery.com)
  (and the [map file](https://jquery.com/download/#jquery))
- [Popper.js](https://cdnjs.com/libraries/popper.js)
  (take the [UMD](https://github.com/popperjs/popper.js#dist-targets) target at the bottom)
- [Bootstrap](https://getbootstrap.com/docs/4.3/getting-started/download/#bootstrapcdn)
  (check in the navbar that you are viewing the latest version)
- [Bootstrap TOC](https://afeld.github.io/bootstrap-toc/#usage)
- [React](https://reactjs.org/docs/cdn-links.html)
  (or execute `npm run react-update` to copy the files from `node_modules`)
- [AnchorJS](https://cdnjs.com/libraries/anchor-js)
- [Font Awesome](https://fontawesome.com/download)
  (select "Free for Web" and then replace `assets/fonts/fontawesome`; update the CDN version manually)
- [KaTeX](https://katex.org/docs/browser.html)
  with [copy-tex](https://github.com/KaTeX/KaTeX/tree/master/contrib/copy-tex)
  and [auto-render](https://github.com/KaTeX/KaTeX/tree/master/contrib/auto-render)
  extensions

In order to use the same library versions for local development as for remote production,
you also have to update the [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) links
and the [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hashes,
which you can generate at [www.srihash.org](https://www.srihash.org).

### Favicons

The favicons stored in `assets/favicons` were generated with [RealFaviconGenerator](https://realfavicongenerator.net).

You can convert the logo in `assets/images` from SVG to PNG with:

```bash
npm run logo-convert
```

## Documentation

### Articles

Articles can have the following variables in their [front matter](https://jekyllrb.com/docs/front-matter/):

- `icon`: The name of the [Font Awesome](https://fontawesome.com) icon used in the navigation without the `fa-` prefix.
- `title`: The title of the article as used at the top of the article and in the navigation.
- `script`: The name of the script to be included from `/assets/scripts/internal/{{script}}.min.js`.
- `category`: The name of the [category](_data/categories.yml) to which the article belongs.
- `author`: The author of the article so that this information is included in timestamps of the file.
- `published`: The date when the article was first published as YYYY-MM-DD.
  Omit this variable if the article shall not yet be added to the navigation.
- `modified`: The date when the article was last modified as YYYY-MM-DD.
  Omit this variable if the article has not been modified since its publication.
- `image`: The path from the root of this repository to the image
  that shall be used when the article is shared on social media.
  The image should be 1200 x 630 or larger and less than 1 MB in size.
- `teaser`: A short text that shall be used when the article is shared on social media or indexed by search engines.
- `math`: Set this to `true` if you want to activate KaTeX rendering for the article.

### Preview

You can refresh the cached preview of an article
on [Twitter](https://cards-dev.twitter.com/validator),
[Facebook](https://developers.facebook.com/tools/debug/),
and [LinkedIn](https://www.linkedin.com/post-inspector/inspect/).
In case of Telegram, you need to send the URL to the
[@webpagebot](https://telegram.me/webpagebot).

### Markdown

[Markdown](https://guides.github.com/features/mastering-markdown/)
is converted by [kramdown](https://kramdown.gettalong.org/index.html)
according to [this syntax specification](https://kramdown.gettalong.org/syntax.html).

#### Comments

```markdown
{::comment}
This text is ignored by kramdown.
{:/comment}
```

```liquid
{% comment %}
This text is ignored by Liquid.
{% endcomment %}
```

#### Footnotes

```markdown
This statement requires a source.[^label]

[^label]: This can be written anywhere.
```

#### Abbreviations

```markdown
You can use an abbreviation like HTML anywhere and then provide a definition anywhere.

*[HTML]: Hyper Text Markup Language
```

#### Horizontal rules

```markdown
---
```

#### Description list

You can declare a [description list](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl) like this:

```markdown
Term
: Description
```

This is transformed into:

```html
<dl>
  <dt>Term</dt>
  <dd>Description</dd>
</dl>
```

#### Table

```markdown
| Default aligned | Left aligned | Center aligned | Right aligned
|-|:-|:-:|-:
| First body | Second cell | Third cell | Fourth cell
| Second line | a | b | c
| Third line | 1 | 2 | 3
|---
| Second body
| Second line
|===
| Footer row
```

See [Bootstrap](https://getbootstrap.com/docs/4.5/content/tables/) for styling options.

#### HTML blocks

You can use [HTML blocks](https://kramdown.gettalong.org/syntax.html#html-blocks) in Markdown.
If you want the content of an HTML tag to be processed as Markdown as well,
you have to use `markdown="1"` as an attribute
in order to parse its content with the default mechanism.
You can also use `markdown="block"` or `markdown="span"`
if you want the content of the tag to be parsed explicitly as a block or span level element.

#### Details element

For example, this is how you can declare a collapsed
[details](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) section
with a [summary](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary),
where the content is still rendered using Markdown.

```html
<details markdown="block">
<summary markdown="span" id="appropriate-id">
Summary with *Markdown*.
</summary>
Details with *Markdown*.
</details>
```

If the information box shall be open by default,
then add the `open` attribute to the `details` tag:

```html
<details markdown="block" open>
```

#### Header IDs

You can provide the header ID yourself if you want:

```markdown
## Title {#my-id}
```

#### Attributes

You can use [attribute lists](https://kramdown.gettalong.org/syntax.html#inline-attribute-lists)
to add attributes to the generated HTML elements:

```markdown
{:#my-id .first-class .second-class attribute="value"}
```

Classes are appended to the current value of the `class` attribute.
Attributes provided as name-value pairs,
on the other hand,
replace previous attributes with the same name.

You can apply the attributes to [block elements](https://kramdown.gettalong.org/syntax.html#block-ials)
by putting the list on a separate line directly before or after the block element:

```markdown
This is a paragraph.
{:.class-of-paragraph}
```

You can apply the attributes to [span elements](https://kramdown.gettalong.org/syntax.html#span-ials)
by putting the list directly after the span element with no space in between:

```markdown
A [link](test.html){:rel='something'} and some **tools**{:.tools}.
```

If you want to re-use the same attributes,
you can declare an [attribute list definition](https://kramdown.gettalong.org/syntax.html#attribute-list-definitions):

```markdown
{:ref-name: #my-id .my-class}
{:other: ref-name #id-of-other .another-class title="Example"}
```

#### Table of contents

```markdown
## Potentially very long title
{:data-toc-text="Short title"}

## Title omitted from the table of contents
{:data-toc-skip=""}
```

### Images

#### Simple image

```markdown
![Name of the image](image.png)
```

#### Image with caption

```markdown
{% include figure.md source="source.png" caption="Caption with *Markdown*." %}
```

The `caption` string can span several lines.
You just need to escape all quotation marks in it.
It will be rendered with `markdown="span"` as a single paragraph.

#### Image in various sizes

Images in the `images` subfolder of articles are automatically scaled to 500, 1000 and 2000 pixels
and stored in the subfolder `generated`
when running `npm run build`, `npm run watch`, or `npm start`.
If you only want to build or watch these images,
you can execute `npm run img-build` or `npm run img-watch` instead.

A [`srcset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset)
with the various sizes is generated when you add `scaled="true"` to the `include` statement.

```markdown
{% include figure.md source="source.png" caption="Caption with *Markdown*." scaled="true" %}
```

The `caption` is optional and can be skipped.

### Graphics

#### Generate SVGs

`npm run svg-build` builds all SVGs
which end with `.svg.ts`
in the `graphics` subfolder of articles.
You can also watch all SVG-related TypeScript files with `npm run svg-watch`.
These scripts are also included in `npm run build` and `npm run watch` respectively.

#### Embed SVG directly

```markdown
{% include_relative generated/example.embedded.svg %}
```

#### Embed SVG with caption

```markdown
<figure markdown="block">
{% include_relative generated/example.embedded.svg %}
<figcaption markdown="span">
Caption with *Markdown*.
</figcaption>
</figure>
```

### Math

```markdown
You can write both inline math such as $$f(x) = x^2$$ as well as block math:

$$
e^{i\pi} + 1 = 0
$$
```

Check out the list of [supported functions](https://katex.org/docs/supported.html) with tons of examples.

Don't forget to add the following front matter at the beginning of the article:

```yaml
math: true
```

### PDF

The following command generates a PDF of the given article with [Puppeteer](https://github.com/puppeteer/puppeteer):

```bash
npm run pdf-generate <article>
```

Make sure that you are serving the website (e.g. with `npm start`)
at `http://localhost:4000/` before calling the above script.
Replace `<article>` with the name of the article's directory.
The script runs [headless Chromium](https://developers.google.com/web/updates/2017/04/headless-chrome)
to [generate the PDF](https://chromedevtools.github.io/devtools-protocol/tot/Page#method-printToPDF).

### Timestamps

Generate, verify, and upgrade timestamps using [OpenTimestamps](https://opentimestamps.org/) with the following commands:

```bash
npm run ots-remove <article>
npm run ots-stamp <article>
npm run ots-info <article>
npm run ots-verify <article>
npm run ots-upgrade <article>
npm run ots-remove-bak <article>
```

Make sure that the [PDF](#pdf) has already been generated before calling the second command.

## About

### Contributions

Please [open an issue](https://github.com/KasparEtter/ef1p/issues/new)
if you found a typographical error, a factual inaccuracy or a logical fallacy.
Please also let me know if an explanation is difficult to follow.
You are welcome to suggest interesting topics for me to write about.
However, unless I explicitly asked for it, I will not accept any pull requests.

### Dependencies

The most important third party projects used by this website are:

- [Ruby](https://www.ruby-lang.org)
- [Jekyll](https://jekyllrb.com)
- [Bootstrap](https://getbootstrap.com)
- [Darkly Theme](https://bootswatch.com/darkly/)
- [Flatly Theme](https://bootswatch.com/flatly/)
- [npm](https://www.npmjs.com)
- [React](https://reactjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [webpack](https://webpack.js.org)
- [jQuery](https://jquery.com)
- [AnchorJS](https://www.bryanbraun.com/anchorjs/)
- [Font Awesome](https://fontawesome.com)

More dependencies are listed in [package.json](package.json) and [Gemfile](Gemfile).

### Copyright

The copyright for the content of this repository,
excluding the aforementioned dependencies,
belongs to [Kaspar Etter](https://www.kasparetter.com).

### License

The content of this repository,
excluding the aforementioned dependencies,
is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

### Contact

Please do not hesitate to [contact me](mailto:contact@ef1p.com).
