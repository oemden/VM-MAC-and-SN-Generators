#!/bin/bash
# Generate valid VMware static MAC addresses
# Valid range: 00:50:56:00:00:00 to 00:50:56:3F:FF:FF
# v0.1.0: Added CLI options (-h, -c, -n) to generate_mac.sh

version="0.1.0"

# Display help and usage information
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Generate valid VMware static MAC addresses within the allowed range.

OPTIONS:
    -h, --help            Show this help message
    -c, --case TYPE       Character case: upper, lower, both (default: lower)
                         - upper: Uppercase format (00:50:56:XX:XX:XX)
                         - lower: Lowercase format (00:50:56:xx:xx:xx) [cloudinit compatible]
                         - both: Output MAC in both lowercase and uppercase
    -n, --count NUM       Number of MAC addresses to generate (default: 1)

EXAMPLES:
    $0
    # Output: 00:50:56:28:6e:35 (lowercase, default)

    $0 -n 3
    # Output: 3 MAC addresses in lowercase

    $0 -c upper -n 2
    # Output: 2 MAC addresses in uppercase

    $0 -c both
    # Output: MAC address in both lowercase and uppercase

    $0 --case lower --count 5
    # Output: 5 MAC addresses in lowercase

EOF
}

# Default values
CASE="lower"
COUNT=1

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--case)
            CASE="$2"
            shift 2
            ;;
        -n|--count)
            COUNT="$2"
            shift 2
            ;;
        *)
            echo "Error: Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Validate case option
if [[ "$CASE" != "upper" && "$CASE" != "lower" && "$CASE" != "both" ]]; then
    echo "Error: Case must be 'upper', 'lower', or 'both'"
    exit 1
fi

# Validate count option
if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive number"
    exit 1
fi

# Generate VMware MAC address with specified case format
generate_mac() {
    local case_type=$1
    
    # Generate random octets within VMware valid range
    # Fourth octet: 00-3F (0-63)
    local fourth=$(printf '%02X' $((RANDOM % 64)))
    
    # Fifth and sixth octets: 00-FF (0-255)
    local fifth=$(printf '%02X' $((RANDOM % 256)))
    local sixth=$(printf '%02X' $((RANDOM % 256)))
    
    # Build MAC address with VMware prefix
    local mac="00:50:56:${fourth}:${fifth}:${sixth}"
    
    # Format output based on case type
    case "$case_type" in
        upper)
            # Output in uppercase
            echo "$mac" | tr '[:lower:]' '[:upper:]'
            ;;
        lower)
            # Output in lowercase (cloudinit compatible)
            echo "$mac" | tr '[:upper:]' '[:lower:]'
            ;;
        both)
            # Output in both lowercase and uppercase
            echo "$mac" | tr '[:upper:]' '[:lower:]'
            echo "$mac" | tr '[:lower:]' '[:upper:]'
            ;;
    esac
}

# Generate the requested number of MAC addresses
for ((i=1; i<=COUNT; i++)); do
    generate_mac "$CASE"
done
