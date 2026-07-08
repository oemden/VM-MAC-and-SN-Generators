# TODO

## Project Global

- [x] Create an install script to install scripts in `/usr/local/bin/`
  - `generate_mac.sh` target alias `/usr/local/bin/genmac`
  - `generate_sn.sh` target alias  `/usr/local/bin/gensn`

## Generate MAC addresses script

### Next steps

- [x] Add: versioning to scripts
- [x] Add: Options to scripts
- [x] Add: `-h` Show help and usage
- [x] Add: `-c`, --case TYPE Character case: upper, lower, both "lower and upper ouput" (default: lower for cloudinit compatibility -> [https://cloudinit.readthedocs.io/en/latest/reference/network-config-format-v2.html#macaddress-scalar])
- [x] Add: `-n`, --count NUM Number of mac addresses to generate (default: 1)

### For later

- [x] Add: `-d` MAC Addressess delimiter ( separator `;`,`:`,`.`,`-`,`<none>` )
- [x] Add: `-R` Random "Non-VMware" MAC Addresses option (unicast, locally-administered lab MACs)
- [x] Add: `-T` Target "VMware" (defaults) or other Vendors MAC Addresses option (using vendor data file later)
- [ ] Add: .env / $ENV / config file `~/.genvmmacsn/{genmac.cfg,gensn.cfg}` options to set custom user defaults
  - [ ] User `$ENV` ( used when calling script from /usr/local/bin/*.sh )
  - [ ] `.env` for App project ( to come )
- [ ] Add: `-C` "Custom 3 first bits" MAC Addresses option (POSTPONED, to be reassessed later)

## Web App Phase 4 (Saved Results CRUD)

- [x] Phase 4A: VM toggle (Assign to VM ON/OFF in MacGenerator and SnGenerator)
- [x] SQLite auto-init on API startup (no manual db:migrate)
- [x] Phase 4B: DELETE /api/results/:id
- [x] Phase 4B: Delete button per row + custom confirm modal
- [x] Phase 4B: Server-side sort (?sort=&order=) + sortable column headers
- [x] Phase 4C: DELETE /api/vms/:id (cascade vs orphan)
- [x] Phase 4C: VM page (list VMs, delete with warning modal)

## Vendor data and future app

- [ ] Define mac-vendor data file format and initial vendor list (e.g. vmware, apple, dell)
- [ ] Add script or process to refresh mac-vendor data from public OUI sources
- [ ] Plan simple frontend/app to wrap MAC/SN generators (expose -T, -R, -d, -n, etc. via UI)

## Generate IP addresses script

### New script to generate IP addresses

- [ ] common Private ranges
- [ ] Specific Cloud provider Subnets (AWS, Azure, linode, Scaleway, Google CLoud, ...)
- [ ] specific CIDR range (/32, /24, /16)
- [ ] Number of IPs to generate
- [ ] Possibilty to generate for multiple Cloud providers ?
