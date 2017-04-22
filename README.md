# cppcheck README

This extension utilizes the cppcheck static code analyzer to provide C and C++ code analysis within Visual Studio Code.
Cppcheck is available at `http://cppcheck.sourceforge.net`.

## Features

- Run cppcheck for a single file.
- Run cppcheck for the entire workspace.
- On the fly linting within the code editor.

![cppcheck linting](https://raw.githubusercontent.com/matthewferreira/cppcheck-extension/master/example.png)

## Requirements

cppcheck must be installed. Any version may be used. The extension will try to locate the cppcheck executable if possible. It will search
the 32-bit Program Files directory on Windows, and several bin directories on Linux. If not found, `cppcheck.cppcheckPath` must be set to
the correct location of the executable.

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
* `cppcheck.showStatusBarItem`: Show/hide the status bar item for displaying analyzer commands.
* `cppcheck.lintingEnabled`: Whether to enable automatic linting for C/C++ code. Linting runs on workspace changes and file saves.

## Known Issues

Detection of cppcheck is limited to the 32-bit Windows executable and Linux. Mac detection does not exist.

## Release Notes

### 0.0.3

- Added a new setting to automatically show the output channel after running cppcheck (true by default).
- Fix for issue #1 (Doesn't do anything).

### 0.0.2

- Updated to use the logo from cppcheck (as generously provided by Daniel Marjamäki), instead of blue on white.
- Added links to the cppcheck website and manual.
- Added a command for opening the cppcheck manual on the web.

### 0.0.1

- Initial release of cppcheck extension.
