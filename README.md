# MAC Address and Serial Number Generators

The scripts directory contains two utility scripts to generate unique identifiers for VMware virtual machines:

**version**: `0.7.0`

- `genmac` `genmac` - Generates valid VMware MAC addresses
- `gensn` `gensn` - Generates customizable serial numbers for VM identification
- **Web App** - React + API: generate MAC/SN, save to VMs, view saved results

---

## Web App (Save UI and Saved Results)

The web app provides a UI to generate MAC addresses and Serial Numbers, save them to VMs, and view saved results.

### Run the app

```bash
bun install
bun run dev          # Starts API (port 3000) and web (port 5173)
```

SQLite DB and migrations run automatically on first API startup. No manual setup required.

### Save to Virtual Machine

- Generate MAC or SN, then use the **Save to Virtual Machine** form
- Select or type a VM name (create-on-fly supported)
- Add an optional comment
- One SN per VM; multiple MACs per VM allowed

### Assign to VM toggle

- In the **Options** panel, use the **Assign to VM** checkbox
- **ON (default):** Shows VM combobox, Comment field, and Save button
- **OFF:** Hides the save form; only Copy All and per-row Copy buttons are shown (copy-only mode)

### VMs page

- Navigate to **VMs** in the header
- Table shows id, name, created_at
- **Delete:** Click Delete per row. If VM has no associated results, a simple confirm appears. If VM has results (SN/MAC), a modal offers: Keep results (orphan), Delete all (cascade), or Cancel

### Saved Results page

- Navigate to **Saved** in the header
- Filter by type (All / SN / MAC)
- Table shows id, type, value, vm_name, comment, created_at
- **Sort:** Click column headers (ID, Type, Value, VM, Created) to sort ascending/descending
- **Delete:** Click Delete per row; confirm in modal before removal

### API base URL

Set `VITE_API_URL` in `.env` if the API runs on a different host (default: `http://localhost:3000`).

### Docker (dev, live reload)

Run the same stack as local `bun run dev` inside a container with the repo bind-mounted so edits reload. SQLite data uses the `vmgen-data` volume. Hostname inside the container is `vmgen`.

```bash
docker compose build
docker compose up
```

From the repository root.

- Web UI: `http://127.0.0.1:5560` (Vite in the container, port 5173)
- API: `http://127.0.0.1:3060` (in-container port 3000)

After changing `package.json` or `bun.lock`, rebuild the image (`docker compose build`) so dependencies stay in sync.

---

## Context

Even when using Fixed IPs, I like to set DHCP reservations, to ease my life.

I also like to control and manage VMs Serial Numbers and avoid ugly VMWare built random SN. `VMware-42 15 6d ab c8 9f 7e 00-11 22 33 44 55 66 77 88`.
Using custom Serial Numbers for the VM also Helps defining what usage or stage ( DEV, PROD, TESTS, etc...) in inventory

You can find two utility scripts to generate unique identifiers for VMware virtual machines:

- `genmac` `genmac` - Generates valid VMware MAC addresses

This allows me to define and control what IP a VM will have from start and even before setting up a fixed IP. Usefull to know in advance the IP assigned and manage DNS upward too.
This script has some options to output MAC addresses in uppper or lowercase, and to set the count of MAC addresses to generate.
Defaults to VMWare compatible MACs for now, but I plan to add custom/random generation in the future.

- `gensn` `gensn` - Generates customizable serial numbers for VM identification

This script has some options to generate different nomenclatures of SNs.
You can Set Prefixes or Suffixes like `DEV` or `PROD` in the *Serial Number*, which happens to be most usefull for VM Inventory or Monitoring

Refer below to basic usage and Options of both scripts.

## genmac

### Purpose

Generates valid VMware static MAC addresses within the allowed range for manual MAC assignment.

### Valid Range

- VMware static MAC addresses must be in the range: `00:50:56:00:00:00` to `00:50:56:3F:FF:FF`
- The script ensures all generated MACs comply with VMware requirements

### Options

```bash
-h, --help            Show help and usage information
-c, --case TYPE       Character case: upper, lower, both (default: lower)
                      - upper: Uppercase format (00:50:56:XX:XX:XX)
                      - lower: Lowercase format (00:50:56:xx:xx:xx) [cloudinit compatible]
                      - both: Output MAC in both lowercase and uppercase
-n, --count NUM       Number of MAC addresses to generate (default: 1)
-d, --delimiter DELIM Delimiter between MAC octets (single character or 'none', default: ':')
--no-delimiter        Disable delimiter (equivalent to -d none)
-T, --target TYPE     Vendor/target type (currently: vmware; default: vmware)
-R, --random          Random unicast, locally-administered MACs (lab-safe, non-vendor)
```

### Usage

```bash
# Generate 1 MAC address (default, lowercase for cloudinit compatibility)
./genmac

# Generate multiple MAC addresses
./genmac -n 5

# Generate MAC addresses in uppercase
./genmac -c upper -n 3

# Generate MAC address in both lowercase and uppercase
./genmac -c both

# Generate MAC addresses with a custom delimiter between octets
./genmac -d '-'

# Generate MAC addresses without delimiters between octets
./genmac -d none

# Generate explicit VMware-targeted MAC address (same as default behavior)
./genmac -T vmware

# Generate random unicast, locally-administered MAC address for lab use
./genmac -R

# Show help
./genmac -h
```

### Examples

#### Basic Usage (Default Settings)

```bash
$ ./genmac
00:50:56:28:6e:35
```

#### Generate Multiple MAC Addresses

```bash
$ ./genmac -n 3
00:50:56:28:6e:35
00:50:56:3b:c1:87
00:50:56:0e:14:da
```

#### Generate Uppercase MAC Addresses

```bash
$ ./genmac -c upper -n 2
00:50:56:28:6E:35
00:50:56:3B:C1:87
```

#### Generate MAC Address in Both Cases

```bash
$ ./genmac -c both
00:50:56:28:6e:35
00:50:56:28:6E:35
```

#### Generate Lowercase MAC Addresses (Cloudinit Compatible)

```bash
$ ./genmac -c lower --count 5
00:50:56:28:6e:35
00:50:56:3b:c1:87
00:50:56:0e:14:da
00:50:56:1a:2b:3c
00:50:56:4d:5e:6f
```

#### Custom Delimiter Between MAC Octets

```bash
# Use dash '-' as delimiter between MAC octets
$ ./genmac -d '-'
00-50-56-28-6e-35

# Use dot '.' as delimiter between MAC octets
$ ./genmac -d '.' -n 2
00.50.56.28.6E.35
00.50.56.3B.C1.87

# No delimiters between MAC octets (compact format)
$ ./genmac -d none
005056286e35
```

### Unicast vs Random Lab MACs

- `genmac` always generates **unicast** MAC addresses and never produces multicast addresses, because multicast-style MACs are not suitable as normal VM NIC identifiers.
- When you use `-T vmware` (or omit `-T`), MACs follow VMware’s vendor-style prefix. When you use `-R`, MACs are **random, unicast, locally-administered** and intended for lab/test environments without mimicking any real hardware vendor.

For a short overview of these concepts, see [docs/mac-unicast.md](docs/mac-unicast.md).

### Use Cases

- Assigning consistent MAC addresses to VMs
- Creating DHCP reservations based on MAC addresses
- Ensuring MAC addresses don't conflict across your infrastructure

---

## gensn

### Purpose

Generates customizable serial numbers for VMware VMs. These serial numbers can be used for:

- Automatic hostname/FQDN assignment
- VM identification and inventory management
- Correlation with configuration management systems

### Features

- **Configurable length**: Set the length of the random part
- **Prefix**: Optional prefix (e.g., "VM", "DEB", "SRV")
- **Suffix**: Optional suffix (e.g., "PROD", "DEBIAN13", "HQ")
- **Case control**: Upper, lower, or mixed case characters
- **Custom delimiter**: Choose delimiter between parts (default: "-")
- **Batch generation**: Generate multiple serial numbers at once

### Options

```bash
-L, --length NUM      Length of random part (default: 6)
-P, --prefix STR      Prefix string (default: "VM")
-S, --suffix STR      Suffix string (default: "SRV")
-c, --case TYPE       Character case: upper, lower, mixed (default: upper)
-n, --count NUM       Number of serial numbers to generate (default: 1)
-d, --delimiter CHAR  Delimiter between parts (default: "-")
--no-prefix           Don't add prefix
--no-suffix           Don't add suffix
--no-delimiter        Disable delimiter
-h, --help            Show help
```

### Examples

#### Basic Usage (Default Settings)

```bash
$ ./gensn
VM-A1B2C3
```

#### Generate VM Serial Numbers with Mixed Case

```bash
$ ./gensn -L 9 -c mixed
VM-aB3cD4eF5
```

#### Generate Debian VM Serial Numbers

```bash
$ ./gensn -P "VM" -L 4 -S "DEBIAN13" -n 3
VM-1234-DEBIAN13
VM-5A6B-DEBIAN13
VM-7C8D-DEBIAN13
```

#### Generate Production Environment Serial Numbers

```bash
$ ./gensn -P "DEB" -L 6 -S "PROD" -c mixed -n 2
DEB-F71Cn8-PROD
DEB-B5cz88-PROD
```

#### Generate Server Serial Numbers (Compact Format)

```bash
$ ./gensn -P "SRV" -L 10 --no-delimiter -c upper -n 2
SRVD4730MB0WY
SRVJ7V1V5CSX5
```

#### Generate Random Identifiers (No Prefix)

```bash
$ ./gensn --no-prefix -L 8 -c lower -n 2
1ct61x80
8n4d29n4
```

#### Generate Multiple Serial Numbers for Bulk Deployment

```bash
$ ./gensn -P "HQ" -L 8 -S "LAB" -n 5
HQ-A1B2C3D4-LAB
HQ-E5F6G7H8-LAB
HQ-I9J0K1L2-LAB
HQ-M3N4O5P6-LAB
HQ-Q7R8S9T0-LAB
```

#### Custom Delimiter

```bash
$ ./gensn -P "VM" -L 6 -d "_" -S "TEST"
VM_A1B2C3_TEST
```

---

## genvm - Unified Wrapper

A single command that can generate MAC addresses, serial numbers, or both.
Type is automatically detected from the arguments provided.

### Quick Start

```bash
# Generate MAC addresses
genvm -n 3 -T vmware

# Generate serial numbers  
genvm -n 2 -P DEB -L 6 -S PROD

# Generate both MAC and SN in one command
genvm -n 2 -T vmware -P VM -L 6
```

### Type Detection

The wrapper automatically detects what to generate based on the arguments:

| Arguments | Generates |
|-----------|-----------|
| `-T`, `-R` | MAC addresses only |
| `-L`, `-P`, `-S`, `--no-prefix`, `--no-suffix` | Serial numbers only |
| Both types | Both MAC and SN |

**Default behavior:** With no arguments, generates 1 VMware MAC address.

### Options

**MAC-specific:** `-T`, `--target`, `-R`, `--random`  
**SN-specific:** `-L`, `--length`, `-P`, `--prefix`, `-S`, `--suffix`, `--no-prefix`, `--no-suffix`  
**Common:** `-h`, `--help`, `-n`, `--count`, `-c`, `--case`, `-d`, `--delimiter`, `--no-delimiter`

### Examples

```bash
# Generate 1 VMware MAC address (default with no arguments)
genvm

# Generate 3 VMware MAC addresses
genvm -n 3 -T vmware -c lower

# Generate 5 serial numbers for Debian production
genvm -n 5 -P DEB -L 8 -S PROD -c upper

# Generate both for a new VM
genvm -n 1 -T vmware -P VM -L 8 -c lower

# Generate MAC with compact format
genvm -n 1 -T vmware --no-delimiter

# Generate SN without prefix or suffix
genvm -n 1 -L 10 --no-prefix --no-suffix
```

---

## Installation

To install all utilities as convenient commands system-wide:

```bash
cd /path/to/VM-MAC-and-SN-Generators
chmod +x install.sh   # if not already executable
./install.sh
```

This will:

- Copy `genmac` to `/usr/local/bin/genmac`
- Copy `gensn` to `/usr/local/bin/gensn`
- Copy `genvm` to `/usr/local/bin/genvm`
- Overwrite existing commands if they are already present

After installation you can run:

```bash
genmac --help
gensn --help
genvm --help
```

If the commands are not immediately available in your current shell, either:

- Run `rehash` (zsh) or `hash -r` (bash), or
- Open a new terminal session

---

## Integration with Terraform/OpenTofu

### MAC Addresses

Add generated MAC addresses to your `terraform.tfvars`:

```hcl
vms = {
  "debian13-test" = {
    name     = "deb13-test"
    # ... other settings ...
    "mac_address"     = "00:50:56:28:6e:35"  # From genmac (lowercase for cloudinit)
  }
}
```

**Note**: `ethernet0.addressType = "static"` refers to **MAC address assignment**, not IP address. Your VM can still use DHCP for IP addressing.

### Serial Numbers

Add generated serial numbers to your `terraform.tfvars`:

```hcl
vms = {
  "debian13-test" = {
    name     = "deb13-test"
    # ... other settings ...
    serial_number = "VM-1717SA-SRV" # From gensn
  }
}
```

**VMware Serial Number**: 

To be able to use Serial Numbers

```bash
VMware-DEB-B5cz88-PROD
```

You'll to have to set those parameters to your Terraform / Tofu Project ( either in your vsphere-vm modules or root main.tf ).

NB: I ususally used `SMBIOS.use12CharSerialNumber` for my mac VMs.

```hcl
    "serialNumber.reflectHost"       = "FALSE"
    "SMBIOS.use12CharSerialNumber"   = "TRUE"
    "serialNumber"                   = var.serial_number
```

---

## Tips

1. **Save Generated Values**: Keep a record of generated MAC addresses and serial numbers to avoid conflicts
2. **MAC Address Conflicts**: Ensure generated MAC addresses don't conflict with existing VMs
3. **Serial Number Schemes**: Develop a consistent naming scheme for easy VM identification
4. **Bulk Generation**: Generate multiple values at once when deploying several VMs

---

## Quick Reference

```bash
# Generate 5 MAC addresses for new VMs (lowercase, cloudinit compatible)
./genmac -n 5

# Generate uppercase MAC addresses
./genmac -c upper -n 3

# Generate MAC address in both cases
./genmac -c both

# View all MAC generation options
./genmac --help

# Generate serial numbers for Debian production VMs
./gensn -P "DEB" -L 6 -S "PROD" -c upper -n 5

# Generate serial numbers for test environment (compact format)
./gensn -P "TST" -L 8 --no-delimiter -n 3

# View all serial number options
./gensn --help
```

---

## Deprecation Notices

### gensn Argument Changes

The following lowercase options are **deprecated** but still work with a warning message:

| Deprecated | Replacement | Status |
|------------|-------------|--------|
| `-l` | `-L` | Deprecated, prints warning |
| `-p` | `-P` | Deprecated, prints warning |
| `-s` | `-S` | Deprecated, prints warning |

**Migration:** Update your scripts to use uppercase options. The deprecated lowercase options will be removed in a future version.

### Argument Behavior Notes

For `gensn`, using `-L`, `-P`, or `-S` with no value is equivalent to their `--no-*` flags:
- `-L` with no value = `--no-delimiter`
- `-P` with no value = `--no-prefix`
- `-S` with no value = `--no-suffix`

This behavior is intentional and documented.
