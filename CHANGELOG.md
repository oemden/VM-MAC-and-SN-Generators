# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Web App

- Saved Results: delete button per row with custom confirm modal
- Saved Results: sortable column headers (ID, Type, Value, VM, Created); server-side sort

### Added - API

- DELETE /api/results/:id — 204 on success, 404 if not found
- GET /api/results: sort and order params (`?sort=id|type|value|vm_name|created_at&order=asc|desc`)

### Fixed - API

- SQLite: run migrations automatically on API startup; no manual `db:migrate` required. `bun run dev` is sufficient for dev and prod.

### Documentation

- CLAUDE.md: added Database (SQLite) section with auto-init rule for new code
- README.md: removed db:migrate step from run instructions; added Saved Results delete and sort usage

## [0.6.0] - 2026-02-17

### Fixed - Web App

- SavedResults.test.tsx: wrap async state updates in waitFor to eliminate React act() warning

### Added - Web App

- Save UI: VM combobox (select or create-on-fly), comment field, Save to Virtual Machine button
- Saved Results page: table view with type filter (All / SN / MAC)
- Two-column layout: Options left, Generated results right (per mockups)
- react-router-dom: routes `/` (Generate) and `/saved` (Saved Results)
- Vitest + React Testing Library for web app tests

### Added - API

- SQLite: create data directory automatically if missing (fixes CANTOPEN in worktrees/fresh clones)

### Changed

- MacGenerator and SnGenerator: two-column layout with SaveResultsForm in results panel

### Documentation

- UserStories (in .local/userstories): added [x] to completed user stories (landing page, Generate, theme, copy, save with comments, VM combobox, business rules, etc.)

## [0.4.0] - 2026-02-04

### Added - generate_mac.sh

- Added `-T, --target TYPE` option to specify vendor/target type (currently supports `vmware`, default behavior)
- Added `-R, --random` option to generate random unicast, locally-administered MAC addresses for lab use
- Added validation to ensure all generated MACs are unicast (never multicast)
- Added validation to prevent combining incompatible `-T` and `-R` options

### Documentation

- Created `mac-unicast.md` explaining unicast vs multicast MAC addresses and why scripts only generate unicast MACs
- Updated `generate_mac.sh` help text with `-T` and `-R` option descriptions and examples
- Updated `README.md` to document `-T` and `-R` options with usage examples
- Added "Unicast vs Random Lab MACs" section in README with link to `mac-unicast.md`
- Updated `TODOs.md` to mark `-T` and `-R` features as completed and added vendor data/app planning section

## [0.3.0] - 2026-02-04

### Added - install.sh

- Added `install.sh` script to install project utilities into `/usr/local/bin`
- `generate_mac.sh` is installed as `/usr/local/bin/genmac`
- `generate_sn.sh` is installed as `/usr/local/bin/gensn`
- Existing `genmac` and `gensn` binaries are overwritten with a clear notice

### Changed

- Bumped `generate_mac.sh` and `generate_sn.sh` script versions to `0.3.0`

### Documentation

- Updated `README.md` with installation instructions and usage of `genmac` and `gensn`
- Updated `TODOs.md` to mark the install script task as completed

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
