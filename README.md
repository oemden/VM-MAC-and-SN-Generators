# MAC Address and Serial Number Generators

The scripts directory contains two utility scripts to generate unique identifiers for VMware virtual machines:

- `generate_mac.sh` - Generates valid VMware MAC addresses
- `generate_sn.sh` - Generates customizable serial numbers for VM identification

---

## generate_mac.sh

### Purpose

Generates valid VMware static MAC addresses within the allowed range for manual MAC assignment.

### Valid Range

- VMware static MAC addresses must be in the range: `00:50:56:00:00:00` to `00:50:56:3F:FF:FF`
- The script ensures all generated MACs comply with VMware requirements

### Usage

```bash
# Generate 1 MAC address (default)
./generate_mac.sh

# Generate multiple MAC addresses
./generate_mac.sh 5
```

### Example Output

```bash
$ ./generate_mac.sh 3
00:50:56:28:6E:35
00:50:56:3B:C1:87
00:50:56:0E:14:DA
```

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

```
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

## Integration with Terraform/OpenTofu

### MAC Addresses

Add generated MAC addresses to your `terraform.tfvars`:

```hcl
vms = {
  "debian13-test" = {
    name     = "deb13-test"
    # ... other settings ...
    "mac_address"     = "00:50:56:28:6E:35"  # From generate_mac.sh
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

```
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
# Generate 5 MAC addresses for new VMs
./generate_mac.sh 5

# Generate serial numbers for Debian production VMs
./generate_sn.sh -p "DEB" -l 6 -s "PROD" -c upper -n 5

# Generate serial numbers for test environment (compact format)
./generate_sn.sh -p "TST" -l 8 --no-delimiter -n 3

# View all options
./generate_sn.sh --help
```
