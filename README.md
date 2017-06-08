# cppcheck README

This extension utilizes the cppcheck static code analyzer to provide C and C++ code analysis within Visual Studio Code.

## Features

- Run cppcheck for a single file.
- Run cppcheck for the entire workspace.
- On the fly linting within the code editor.

![cppcheck linting](https://raw.githubusercontent.com/matthewferreira/cppcheck-extension/master/example.png)

## Requirements

Cppcheck must be installed. Any version may be used. The extension will try to locate the `cppcheck` executable if
possible. On Windows, it will search the 32-bit and 64-bit Program Files directories. On Linux and macOS, several
bin directories will be searched.

If `cppcheck` is not found, `cppcheck.cppcheckPath` must be set to the correct location of the executable.

### Windows Installation

Cppcheck is available for download at [`cppcheck.sourceforge.net`](http://cppcheck.sourceforge.net/).

### Ubuntu Installation

For Ubuntu users, Cppcheck is available via `apt-get`.

```sh
sudo apt-get install cppcheck
```

### macOS Installation

For macOS users, Cppcheck can most easily be installed using [Homebrew](https://brew.sh/).

```sh
brew install cppcheck
```

### Linting

The linter can be enabled by setting 'cppcheck.lintingEnabled' to true. This can be done either globally in user
settings, or per-workspace in workspace settings. The current recommendation is to enable linting per-workspace.

## Extension Settings

* `cppcheck.enable`: Enable/disable the analyzer.
* `cppcheck.cppcheckPath`: The path to the cppcheck executable.
* `cppcheck.includePaths`: The paths to any include directories.
* `cppcheck.platform`: The compilation platform. This determines data types and sizes (e.g. sizeof(int)).
* `cppcheck.standard`: The language standard to use (e.g. c++11).
* `cppcheck.define`: Symbols to define for the preprocessor.
* `cppcheck.undefine`: Symbols to undefine for the preprocessor.
* `cppcheck.suppressions`: Any cppcheck rules to suppress (see the cppcheck manual).
* `cppcheck.verbose`: Enable verbose output from cppcheck.
* `cppcheck.force`: Enable forcefully analyzing all possible configurations through cppcheck.
* `cppcheck.showStatusBarItem`: Show/hide the status bar item for displaying analyzer commands.
* `cppcheck.lintingEnabled`: Whether to enable automatic linting for C/C++ code. Linting runs on workspace changes and file saves.
* `cppcheck.outputCommandLine`: Whether to output the command line used to invoke Cppcheck.
* `cppcheck.language`: Force 'cppcheck' to check all files as the given language.
* `cppcheck.inconclusive`: Allow reporting even though analysis is inconclusive. May lead to false positives.
* `cppcheck.severityLevels`: Maps the severity levels of cppcheck to VSCode severity levels (Error, Warning, Information, Hint). Setting to 'None' will not show the severity type at all.

### A quick note on paths

When using the `includePaths` setting, variables will be expanded once. Anything embedded will be used as is.
In addition to any environment variable being expanded, `${workspaceRoot}` will also be expanded.

## Release Notes

### 0.2.1

- Changed the 'Read the manual' command to go to the HTML manual instead of PDF.
- Fixed improper 'inconclusive' and 'verbose' parameter handling.
- Added 'allowInlineSuppressions' as an option, enabled by default.
- Brand new linting engine, with support for inline suppressions.

### 0.1.3

- Reverted pull #10 via pull #11.
- Merged in pull #12 (paths with spaces and special characters) (thanks to Roelof).
- Fix for issues #7 via pull #12.

### 0.1.2

- Cleaned up the README.
- Merged in pull #10.

### 0.1.1

- Feature request #9 (language parameter).
- Added the '--inconclusive' parameter.

### 0.0.9

- Merged in pull #6 (configurable severity levels) (thanks to Andreas Pazureck).
- Merged in pull #8 (force option) (thanks to Joseph Benden).

### 0.0.8

- Fix for issue #5 (environment variables).
- Fixed the linter not working when 'cppcheck.verbose' is true.

### 0.0.7

- Windows 64-bit executable detection (always looks in '%sytemdrive%\Program Files\Cppcheck').

### 0.0.6

- Actually changed 'cppcheck.enabled' to true instead of just saying it.

### 0.0.5

- macOS executable detection (thanks to Jason Dreyzehner).
- Changed 'cppcheck.enabled' to true.
- Better documentation about installation (thanks to Jason Dreyzehner).
- Documentation about enabling the linter.

### 0.0.4

- Added linting directly to the code editor (thanks to Andreas Pazureck).
- Linting is listed in the Problems view for all files in the workspace.

### 0.0.3

- Added a new setting to automatically show the output channel after running cppcheck (true by default).
- Fix for issue #1 (Doesn't do anything).

### 0.0.2

- Updated to use the logo from cppcheck (as generously provided by Daniel Marjamäki), instead of blue on white.
- Added links to the cppcheck website and manual.
- Added a command for opening the cppcheck manual on the web.

### 0.0.1

- Initial release of cppcheck extension.
