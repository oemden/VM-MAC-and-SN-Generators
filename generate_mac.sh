#!/bin/bash
# Generate valid VMware static MAC addresses by default
# Valid range for VMware static MACs: 00:50:56:00:00:00 to 00:50:56:3F:FF:FF
# v0.4.0: Added -T/--target and -R/--random options. See CHANGELOG.md for details

version="0.4.0"

# Display help and usage information
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Generate MAC addresses for VMware and lab environments version ${version}.

OPTIONS:
    -h, --help            Show this help message
    -c, --case TYPE       Character case: upper, lower, both (default: lower)
                         - upper: Uppercase format (00:50:56:XX:XX:XX)
                         - lower: Lowercase format (00:50:56:xx:xx:xx) [cloudinit compatible]
                         - both: Output MAC in both lowercase and uppercase
    -n, --count NUM       Number of MAC addresses to generate (default: 1)
    -d, --delimiter DELIM Delimiter between MAC octets (single character or 'none', default: ':')
    -T, --target TYPE     Vendor/target type (currently: vmware; default: vmware)
    -R, --random          Random unicast, locally-administered MACs (lab-safe, non-vendor)

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

    $0 -d '-'
    # Output: 00-50-56-28-6e-35 (dash delimiter)

    $0 -d '.' -n 2
    # Output: 2 MAC addresses using '.' as delimiter

    $0 -d none
    # Output: 005056286e35 (no delimiters between octets)

    $0 -T vmware
    # Output: VMware-compatible MAC address (default behavior)

    $0 -R
    # Output: random unicast, locally-administered MAC address for lab use (non-vendor)

EOF
}

# Default values
CASE="lower"
COUNT=1
DELIM=":"
TARGET="vmware"   # vendor/target type (currently only vmware)
RANDOM_LAB=0      # when set to 1, generate random local/lab MACs

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
        -d|--delimiter)
            DELIM="$2"
            shift 2
            ;;
        -T|--target)
            TARGET="$2"
            shift 2
            ;;
        -R|--random)
            RANDOM_LAB=1
            shift
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

# Validate delimiter option
# - allow a single-character delimiter like ':', '-', '.', ';'
# - allow special keyword 'none' to disable delimiters between octets
if [[ "$DELIM" == "none" ]]; then
    DELIM=""
elif [[ ${#DELIM} -ne 1 ]]; then
    echo "Error: Delimiter must be a single character or 'none'"
    exit 1
fi

# Validate target option (for now only vmware is supported)
if [[ "$TARGET" != "vmware" ]]; then
    echo "Error: Unsupported target type '$TARGET' (supported: vmware)"
    exit 1
fi

# Do not allow combining -T and -R to keep behavior explicit
if [[ "$RANDOM_LAB" -eq 1 && "$TARGET" != "vmware" ]]; then
    echo "Error: Cannot combine -T/--target with -R/--random"
    exit 1
fi

# Validate count option
if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive number"
    exit 1
fi

# Generate MAC address with specified case format
generate_mac() {
    local case_type=$1
    local mac

    if [[ "$RANDOM_LAB" -eq 1 ]]; then
        # Random lab mode: generate a locally-administered unicast MAC
        # First octet bits:
        # - I/G (bit 0) = 0 -> unicast
        # - U/L (bit 1) = 1 -> locally administered
        local first_byte=$((RANDOM % 256))
        first_byte=$(( (first_byte & 0xFC) | 0x02 ))

        # Remaining octets: fully random 0-255
        local second=$(printf '%02X' $((RANDOM % 256)))
        local third=$(printf '%02X' $((RANDOM % 256)))
        local fourth=$(printf '%02X' $((RANDOM % 256)))
        local fifth=$(printf '%02X' $((RANDOM % 256)))
        local sixth=$(printf '%02X' $((RANDOM % 256)))

        local first=$(printf '%02X' "$first_byte")

        # Build MAC address using the configured delimiter
        if [[ -z "$DELIM" ]]; then
            mac="${first}${second}${third}${fourth}${fifth}${sixth}"
        else
            mac="${first}${DELIM}${second}${DELIM}${third}${DELIM}${fourth}${DELIM}${fifth}${DELIM}${sixth}"
        fi
    else
        # Target mode: currently only VMware static MACs
        # VMware static MACs use prefix 00:50:56 and a fourth octet range 00-3F
        local prefix1="00"
        local prefix2="50"
        local prefix3="56"

        # Generate random octets within VMware valid range
        # Fourth octet: 00-3F (0-63)
        local fourth=$(printf '%02X' $((RANDOM % 64)))
        # Fifth and sixth octets: 00-FF (0-255)
        local fifth=$(printf '%02X' $((RANDOM % 256)))
        local sixth=$(printf '%02X' $((RANDOM % 256)))

        # Build MAC address with VMware prefix using the configured delimiter
        # If DELIM is empty (when user passed 'none'), octets are concatenated without separators.
        if [[ -z "$DELIM" ]]; then
            mac="${prefix1}${prefix2}${prefix3}${fourth}${fifth}${sixth}"
        else
            mac="${prefix1}${DELIM}${prefix2}${DELIM}${prefix3}${DELIM}${fourth}${DELIM}${fifth}${DELIM}${sixth}"
        fi
    fi
    
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
