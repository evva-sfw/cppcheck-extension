# Change Log
All notable changes to the "cppcheck" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.1] - 2017-07-30
- Changed the 'Read the manual' command to go to the HTML manual instead of PDF.
- Fixed improper 'inconclusive' and 'verbose' parameter handling.
- Added 'allowInlineSuppressions' as an option, enabled by default.
- Brand new linting engine, with support for inline suppressions.
- Issue #13 (project support).

## [0.1.3] - 2017-06-03
- Reverted pull #10 via pull #11.
- Merged in pull #12 (paths with spaces and special characters) (thanks to Roelof).
- Fix for issues #7 via pull #12.

## [0.1.2] - 2017-06-01 (internal version)
- Cleaned up the README.
- Merged in pull #10.

## [0.1.1] - 2017-05-21
- Feature request #9 (language parameter).
- Added the '--inconclusive' parameter.

## [0.0.9] - 2017-05-17
- Merged in pull #6 (configurable severity levels) (thanks to Andreas Pazureck).
- Merged in pull #8 (force option) (thanks to Joseph Benden).

## [0.0.8] - 2017-05-13
- Fix for issue #5 (environment variables).
- Fixed the linter not working when 'cppcheck.verbose' is true.

## [0.0.7] - 2017-04-30
- Windows 64-bit executable detection (always looks in '%sytemdrive%\Program Files\Cppcheck').

## [0.0.6] - 2017-04-27
- Actually changed 'cppcheck.enabled' to true instead of just saying it.

## [0.0.5] - 2017-04-27
- macOS executable detection (thanks to Jason Dreyzehner).
- Changed 'cppcheck.enabled' to true.
- Better documentation about installation (thanks to Jason Dreyzehner).
- Documentation about enabling the linter.

## [0.0.4] - 2017-04-22
- Added linting directly to the code editor (thanks to Andreas Pazureck).
- Linting is listed in the Problems view for all files in the workspace.

## [0.0.3] - 2017-02-26
- Added a new setting to automatically show the output channel after running cppcheck (true by default).
- Fix for issue #1 (Doesn't do anything).

## [0.0.2] - 2017-01-29
- Updated to use the logo from cppcheck (as generously provided by Daniel Marjamäki), instead of blue on white.
- Added links to the cppcheck website and manual.
- Added a command for opening the cppcheck manual on the web.

## [0.0.1] - 2017-01-22
- Initial release
