# TODO

## Generate MAC addresses script

### Next steps

- [x] Add: versioning to scripts
- [x] Add: Options to scripts
- [x] Add: `-h` Show help and usage
- [x] Add: `-c`, --case TYPE Character case: upper, lower, both "lower and upper ouput" (default: lower for cloudinit compatibility -> [https://cloudinit.readthedocs.io/en/latest/reference/network-config-format-v2.html#macaddress-scalar])
- [x] Add: `-n`, --count NUM Number of mac addresses to generate (default: 1)

### For later

- [ ] Add: multiple Mac addresses option
- [ ] Add: .env / $ENV / config file `~/.genvmmacsn/{genmac.cfg,gensn.cfg}` options
- [ ] Add: `-R` Random "Non-VMware" MAC Addresses option
- [ ] Add: `-C` "Custom 3 first bits" MAC Addresses option
- [ ] Add: `-V` "Specific vendor 3 first bits" MAC Addresses option
