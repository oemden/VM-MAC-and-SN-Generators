# MAC Unicast Basics (Short Notes)

- **Unicast vs multicast**: Ethernet MAC addresses have special bits in the first octet that distinguish **unicast** (normal device addresses) from **multicast** (group or protocol addresses). For VM NICs, switches, DHCP servers, and most tools expect **unicast MACs**.

- **Why this project only generates unicast MACs**: Using multicast-style MAC addresses for VM NICs can confuse network equipment and is almost never desired. The `generate_mac.sh` script therefore always generates **unicast** MAC addresses and avoids multicast ranges by design.

- **Vendor vs lab/random MACs**:
  - `-T vmware` uses a **vendor-style** prefix compatible with VMware requirements.
  - `-R` generates **random, unicast, locally-administered** MACs for lab and test environments, without pretending to be any real hardware vendor.
