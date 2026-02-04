# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-04

### Added - generate_mac.sh

- Added `-d, --delimiter` option to control the delimiter between MAC address octets
- Added validation for delimiter values (single character or `none` for no delimiter)

### Documentation

- Updated `generate_mac.sh` help text with delimiter option description and examples
- Updated `README.md` to document the delimiter option and provide usage examples
- Marked the corresponding TODO item for the delimiter feature as completed

## [0.1.0] - 2024-12-19

### Added - generate_mac.sh

- Added command-line options support (`-h`, `-c/--case`, `-n/--count`)
- Added `-h, --help` option to display usage and examples
- Added `-c, --case` option to control MAC address case format:
  - `upper`: Uppercase format (00:50:56:XX:XX:XX)
  - `lower`: Lowercase format (00:50:56:xx:xx:xx) [default, cloudinit compatible]
  - `both`: Output MAC address in both lowercase and uppercase
- Added `-n, --count` option to specify number of MAC addresses to generate (default: 1)
- Added input validation for case and count options
- Added comprehensive help function with usage examples
- Updated script version to 0.1.0

### Changed - generate_mac.sh

- Replaced positional argument parsing with proper option parsing using `while` loop
- Changed default output format to lowercase for cloudinit compatibility
- Improved error handling and user feedback

### Documentation

- Updated README.md with new options section and usage examples
- Added examples demonstrating all new features
- Updated Quick Reference section with new command syntax

## [0.0.1] - Initial Release

- Moved scripts from tofu/terraform Projects to standaloe repo.

### Added

- Initial release of `generate_mac.sh` script
  - Generates valid VMware static MAC addresses
  - Supports positional argument for count
  - Uppercase output format
- Initial release of `generate_sn.sh` script
  - Generates customizable serial numbers for VMware VMs
  - Configurable length, prefix, suffix, case, and delimiter options
- Project documentation in README.md
