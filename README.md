# MAC Address and Serial Number Generators

The scripts directory contains two utility scripts to generate unique identifiers for VMware virtual machines:

**version**: `0.4.0`

- `generate_mac.sh` `genmac` - Generates valid VMware MAC addresses
- `generate_sn.sh` `gensn` - Generates customizable serial numbers for VM identification

---

## Context

Even when using Fixed IPs, I like to set DHCP reservations, to ease my life.

I also like to control and manage VMs Serial Numbers and avoid ugly VMWare built random SN. `VMware-42 15 6d ab c8 9f 7e 00-11 22 33 44 55 66 77 88`.
Using custom Serial Numbers for the VM also Helps defining what usage or stage ( DEV, PROD, TESTS, etc...) in inventory

You can find two utility scripts to generate unique identifiers for VMware virtual machines:

- `generate_mac.sh` `genmac` - Generates valid VMware MAC addresses

This allows me to define and control what IP a VM will have from start and even before setting up a fixed IP. Usefull to know in advance the IP assigned and manage DNS upward too.
This script has some options to output MAC addresses in uppper or lowercase, and to set the count of MAC addresses to generate.
Defaults to VMWare compatible MACs for now, but I plan to add custom/random generation in the future.

- `generate_sn.sh` `gensn` - Generates customizable serial numbers for VM identification

This script has some options to generate different nomenclatures of SNs.
You can Set Prefixes or Suffixes like `DEV` or `PROD` in the *Serial Number*, which happens to be most usefull for VM Inventory or Monitoring

Refer below to basic usage and Options of both scripts.

## generate_mac.sh

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
-T, --target TYPE     Vendor/target type (currently: vmware; default: vmware)
-R, --random          Random unicast, locally-administered MACs (lab-safe, non-vendor)
```

### Usage

```bash
# Generate 1 MAC address (default, lowercase for cloudinit compatibility)
./generate_mac.sh

# Generate multiple MAC addresses
./generate_mac.sh -n 5

# Generate MAC addresses in uppercase
./generate_mac.sh -c upper -n 3

# Generate MAC address in both lowercase and uppercase
./generate_mac.sh -c both

# Generate MAC addresses with a custom delimiter between octets
./generate_mac.sh -d '-'

# Generate MAC addresses without delimiters between octets
./generate_mac.sh -d none

# Generate explicit VMware-targeted MAC address (same as default behavior)
./generate_mac.sh -T vmware

# Generate random unicast, locally-administered MAC address for lab use
./generate_mac.sh -R

# Show help
./generate_mac.sh -h
```

### Examples

#### Basic Usage (Default Settings)

```bash
$ ./generate_mac.sh
00:50:56:28:6e:35
```

#### Generate Multiple MAC Addresses

```bash
$ ./generate_mac.sh -n 3
00:50:56:28:6e:35
00:50:56:3b:c1:87
00:50:56:0e:14:da
```

#### Generate Uppercase MAC Addresses

```bash
$ ./generate_mac.sh -c upper -n 2
00:50:56:28:6E:35
00:50:56:3B:C1:87
```

#### Generate MAC Address in Both Cases

```bash
$ ./generate_mac.sh -c both
00:50:56:28:6e:35
00:50:56:28:6E:35
```

#### Generate Lowercase MAC Addresses (Cloudinit Compatible)

```bash
$ ./generate_mac.sh -c lower --count 5
00:50:56:28:6e:35
00:50:56:3b:c1:87
00:50:56:0e:14:da
00:50:56:1a:2b:3c
00:50:56:4d:5e:6f
```

#### Custom Delimiter Between MAC Octets

```bash
# Use dash '-' as delimiter between MAC octets
$ ./generate_mac.sh -d '-'
00-50-56-28-6e-35

# Use dot '.' as delimiter between MAC octets
$ ./generate_mac.sh -d '.' -n 2
00.50.56.28.6E.35
00.50.56.3B.C1.87

# No delimiters between MAC octets (compact format)
$ ./generate_mac.sh -d none
005056286e35
```

### Unicast vs Random Lab MACs

- `generate_mac.sh` always generates **unicast** MAC addresses and never produces multicast addresses, because multicast-style MACs are not suitable as normal VM NIC identifiers.
- When you use `-T vmware` (or omit `-T`), MACs follow VMware’s vendor-style prefix. When you use `-R`, MACs are **random, unicast, locally-administered** and intended for lab/test environments without mimicking any real hardware vendor.

For a short overview of these concepts, see [docs/mac-unicast.md](docs/mac-unicast.md).

### Use Cases

- Assigning consistent MAC addresses to VMs
- Creating DHCP reservations based on MAC addresses
- Ensuring MAC addresses don't conflict across your infrastructure

---

## generate_sn.sh

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
-l, --length NUM      Length of random part (default: 6)
-p, --prefix STR      Prefix string (default: "VM")
-s, --suffix STR      Suffix string (default: none)
-c, --case TYPE       Character case: upper, lower, mixed (default: upper)
-n, --count NUM       Number of serial numbers to generate (default: 1)
-d, --delimiter CHAR  Delimiter between parts (default: "-")
--no-prefix           Don't add prefix
--no-delimiter        Don't use delimiter
-h, --help            Show help
```

### Examples

#### Basic Usage (Default Settings)

```bash
$ ./generate_sn.sh
VM-A1B2C3
```

#### Generate VM Serial Numbers with Mixed Case

```bash
$ ./generate_sn.sh -l 9 -c mixed
VM-aB3cD4eF5
```

#### Generate Debian VM Serial Numbers

```bash
$ ./generate_sn.sh -p "VM" -l 4 -s "DEBIAN13" -n 3
VM-1234-DEBIAN13
VM-5A6B-DEBIAN13
VM-7C8D-DEBIAN13
```

#### Generate Production Environment Serial Numbers

```bash
$ ./generate_sn.sh -p "DEB" -l 6 -s "PROD" -c mixed -n 2
DEB-F71Cn8-PROD
DEB-B5cz88-PROD
```

#### Generate Server Serial Numbers (Compact Format)

```bash
$ ./generate_sn.sh -p "SRV" -l 10 --no-delimiter -c upper -n 2
SRVD4730MB0WY
SRVJ7V1V5CSX5
```

#### Generate Random Identifiers (No Prefix)

```bash
$ ./generate_sn.sh --no-prefix -l 8 -c lower -n 2
1ct61x80
8n4d29n4
```

#### Generate Multiple Serial Numbers for Bulk Deployment

```bash
$ ./generate_sn.sh -p "HQ" -l 8 -s "LAB" -n 5
HQ-A1B2C3D4-LAB
HQ-E5F6G7H8-LAB
HQ-I9J0K1L2-LAB
HQ-M3N4O5P6-LAB
HQ-Q7R8S9T0-LAB
```

#### Custom Delimiter

```bash
$ ./generate_sn.sh -p "VM" -l 6 -d "_" -s "TEST"
VM_A1B2C3_TEST
```

---

## Installation

To install the scripts as convenient commands (`genmac` and `gensn`) available system-wide:

```bash
cd /path/to/VM-MAC-and-SN-Generators
chmod +x install.sh   # if not already executable
./install.sh
```

This will:

- Copy `generate_mac.sh` to `/usr/local/bin/genmac`
- Copy `generate_sn.sh` to `/usr/local/bin/gensn`
- Overwrite existing `/usr/local/bin/genmac` or `/usr/local/bin/gensn` if they are already present

After installation you can run:

```bash
genmac --help
gensn --help
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
    "mac_address"     = "00:50:56:28:6e:35"  # From generate_mac.sh (lowercase for cloudinit)
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
    serial_number = "VM-1717SA-SRV" # From generate_sn.sh
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
./generate_mac.sh -n 5

# Generate uppercase MAC addresses
./generate_mac.sh -c upper -n 3

# Generate MAC address in both cases
./generate_mac.sh -c both

# View all MAC generation options
./generate_mac.sh --help

# Generate serial numbers for Debian production VMs
./generate_sn.sh -p "DEB" -l 6 -s "PROD" -c upper -n 5

# Generate serial numbers for test environment (compact format)
./generate_sn.sh -p "TST" -l 8 --no-delimiter -n 3

# View all serial number options
./generate_sn.sh --help
```
