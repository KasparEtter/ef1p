# Explained from First Principles

This repository contains the website [explained-from-first-principles.com](https://explained-from-first-principles.com), which is built with [Jekyll](https://jekyllrb.com) and published with [GitHub Pages](https://pages.github.com).

## Setup

### Instructions for macOS

#### Install Homebrew

Paste the following in a macOS Terminal prompt in order to install [Homebrew](https://brew.sh):

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Install Ruby

Install (or upgrade) [Ruby](https://www.ruby-lang.org) with Homebrew in order to avoid [file permission issues](https://stackoverflow.com/questions/14607193/installing-gem-or-updating-rubygems-fails-with-permissions-error):

```bash
brew install ruby
```

Add the paths indicated by the Ruby install script to your `~/.bash_login`:

```bash
export PATH="/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/2.6.0/bin:$PATH"
```

Reload your shell for the changes to take effect by opening a new window/tab or by [entering](https://stackoverflow.com/questions/2518127/how-do-i-reload-bashrc-without-logging-out-and-back-in) `. ~/.bash_login`.

#### Install Bundler

Install [Bundler](https://bundler.io) and replace a potentially existing installation:

```bash
gem install bundler
```

#### Install Dependencies

Navigate to the root directory of this repository and install all dependencies:

```bash
bundle install
```

In order to run the same versions as the [GitHub Pages](https://pages.github.com) server, update the dependencies from time to time:

```bash
bundle update
```

#### Serve Website

Serve the website from the root directory of this repository:

```bash
bundle exec jekyll serve
```

If you did not get any errors, you can now open the website at [http://localhost:4000](http://localhost:4000).

## Contributions

Please [open an issue](https://github.com/KasparEtter/ef1p/issues/new) if you found a typographical error, a factual inaccuracy or a logical fallacy.
Please also let me know if an explanation is difficult to follow.
You are welcome to suggest interesting topics for me to write about.
However, unless I explicitly asked for it, I will not accept any pull requests.

## Dependencies

- [Ruby](https://www.ruby-lang.org)
- [Jekyll](https://jekyllrb.com)
- [Bootstrap](https://getbootstrap.com)
- [Flatly Theme](https://bootswatch.com/flatly/)

## Copyright

The copyright for the content of this repository, excluding the aforementioned dependencies, belongs to [Kaspar Etter](https://www.kasparetter.com).

## License

![Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)

The content of this repository, excluding the aforementioned dependencies, is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

## Contact

Please [contact me](mailto:contact@ef1p.com) if you have a suggestion or need permissions beyond the scope of the above license.
