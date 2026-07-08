# TODO

## Project Global

- [x] Create an install script to install scripts in `/usr/local/bin/`
  - `genmac` target alias `/usr/local/bin/genmac`
  - `gensn` target alias  `/usr/local/bin/gensn`
  - `genvm.sh` target alias `/usr/local/bin/genvm`

## Scripts Unification (Phase 1 - COMPLETE)

### genmac
- [x] Add: versioning to scripts
- [x] Add: Options to scripts
- [x] Add: `-h` Show help and usage
- [x] Add: `-c`, --case TYPE Character case: upper, lower, both (default: lower for cloudinit compatibility)
- [x] Add: `-n`, --count NUM Number of MAC addresses to generate (default: 1)
- [x] Add: `-d` MAC Address delimiter (separator `;`, `:`, `.`, `-`, `<none>`)
- [x] Add: `-T` Target "VMware" (defaults) or other Vendors MAC Addresses option
- [x] Add: `-R` Random "Non-VMware" MAC Addresses option (unicast, locally-administered lab MACs)
- [x] Add: `--no-delimiter` flag for consistency with SN script
- [x] Enhanced all error messages with standardized format
- [x] Added conflict detection for `-T` + `-R`

### gensn
- [x] Add: versioning to scripts
- [x] Add: `-h` Show help and usage
- [x] Add: `-c`, --case TYPE Character case: upper, lower, mixed (default: upper)
- [x] Add: `-n`, --count NUM Number of serial numbers to generate (default: 1)
- [x] Add: `-l` Length of random part (default: 6)
- [x] Add: `-p` Prefix string (default: "VM")
- [x] Add: `-s` Suffix string (default: "SRV")
- [x] Add: `-d` Delimiter between parts (default: "-")
- [x] Add: `--no-prefix` Don't add prefix
- [x] Add: `--no-delimiter` Don't use delimiter
- [x] Changed: `-l` → `-L`, `-p` → `-P`, `-s` → `-S` (uppercase for type-specific)
- [x] Add: `--no-suffix` Don't add suffix
- [x] Fixed: `-d` with no value = `--no-delimiter`
- [x] Fixed: `-p` with no value = `--no-prefix`
- [x] Fixed: `-s` with no value = `--no-suffix`
- [x] Enhanced all error messages with standardized format
- [x] Added conflict detection for `-P value` + `--no-prefix`, `-S value` + `--no-suffix`, `-d char` + `--no-delimiter`
- [x] Added delimiter length validation
- [x] Removed deprecated options from help text (still work with warnings)

### genvm.sh (Unified Wrapper)
- [x] Created unified wrapper script
- [x] Auto-detects type from arguments (-T/-R for MAC, -L/-P/-S for SN)
- [x] Can generate MAC only, SN only, or both in one command
- [x] Passes common options to both scripts
- [x] Provides unified help and error messages

### install.sh
- [x] Updated to install genvm
- [x] Updated version to 0.5.0

## Web App Phase 4 (Saved Results CRUD)

- [x] Phase 4A: VM toggle (Assign to VM ON/OFF in MacGenerator and SnGenerator)
- [x] SQLite auto-init on API startup (no manual db:migrate)
- [x] Phase 4B: DELETE /api/results/:id
- [x] Phase 4B: Delete button per row + custom confirm modal
- [x] Phase 4B: Server-side sort (?sort=&order=) + sortable column headers
- [x] Phase 4C: DELETE /api/vms/:id (cascade vs orphan)
- [x] Phase 4C: VM page (list VMs, delete with warning modal)

## Documentation

- [x] Update README.md with genvm.sh section
- [x] Update README.md genmac options
- [x] Update README.md gensn options
- [x] Update README.md examples
- [x] Update README.md Installation section
- [x] Add README.md Deprecation Notices section
- [x] Update CHANGELOG.md with unification changes
- [x] Update TODOs.md

## Backlog

### genmac
- [ ] Add: .env / $ENV / config file `~/.genvmmacsn/{genmac.cfg,gensn.cfg}` options to set custom user defaults
  - [ ] User `$ENV` (used when calling script from /usr/local/bin/*.sh)
  - [ ] `.env` for App project (to come)
- [ ] Add: `-C` "Custom 3 first bits" MAC Addresses option (POSTPONED, to be reassessed later)

### Vendor data and future app
- [ ] Define mac-vendor data file format and initial vendor list (e.g. vmware, apple, dell)
- [ ] Add script or process to refresh mac-vendor data from public OUI sources

### Generate IP addresses script
- [ ] Common Private ranges
- [ ] Specific Cloud provider Subnets (AWS, Azure, linode, Scaleway, Google Cloud, ...)
- [ ] Specific CIDR range (/32, /24, /16)
- [ ] Number of IPs to generate
- [ ] Possibility to generate for multiple Cloud providers
