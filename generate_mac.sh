#!/bin/bash
# Generate valid VMware static MAC addresses
# Valid range: 00:50:56:00:00:00 to 00:50:56:3F:FF:FF

generate_mac() {
    # Fourth octet: 00-3F (0-63)
    fourth=$(printf '%02X' $((RANDOM % 64)))

    # Fifth and sixth octets: 00-FF (0-255)
    fifth=$(printf '%02X' $((RANDOM % 256)))
    sixth=$(printf '%02X' $((RANDOM % 256)))

    echo "00:50:56:${fourth}:${fifth}:${sixth}"
}

# Check if a number is specified
count=${1:-1}

if ! [[ "$count" =~ ^[0-9]+$ ]]; then
    echo "Usage: $0 [number_of_macs]"
    echo "Example: $0 5"
    exit 1
fi

for ((i=1; i<=count; i++)); do
    generate_mac
done
