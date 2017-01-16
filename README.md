# cppcheck README

This extension utilizes the cppcheck static code analyzer to provide C and C++ code analysis within Visual Studio Code.

## Features

- Run cppcheck for a single file.
- Run cppcheck for the entire workspace.

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

## Known Issues

Detection of cppcheck is limited to the 32-bit Windows executable. Linux detection does not exist.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of cppcheck extension.
