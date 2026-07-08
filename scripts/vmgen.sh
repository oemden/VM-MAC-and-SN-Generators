#!/bin/bash
# vmgen.sh - Unified wrapper for generate_mac.sh and generate_sn.sh
# Detects type from arguments and calls appropriate script(s)
# Version: 1.0.0

show_help() {
    cat << EOF
Usage: $0 [MAC_OPTIONS | SN_OPTIONS | COMMON_OPTIONS]

Generate MAC addresses, serial numbers, or both for VMware VMs.
Type is auto-detected from arguments.

MAC-SPECIFIC OPTIONS:
    -T, --target TYPE     Vendor/target type (default: vmware)
    -R, --random          Generate random lab-safe MAC addresses

SN-SPECIFIC OPTIONS:
    -L, --length NUM      Length of random part (default: 6)
    -P, --prefix STR      Prefix string (default: "VM")
    -S, --suffix STR      Suffix string (default: "SRV")
    --no-prefix           Don't add prefix
    --no-suffix           Don't add suffix

COMMON OPTIONS:
    -h, --help            Show this help message
    -n, --count NUM       Number to generate (default: 1)
    -c, --case TYPE       Character case
    -d, --delimiter CHAR  Delimiter between parts
    --no-delimiter        Disable delimiter

TYPE DETECTION:
    MAC: -T, -R
    SN: -L, -P, -S, --no-prefix, --no-suffix
    Both: MAC + SN options

EXAMPLES:
    # Generate 3 VMware MAC addresses
    $0 -n 3 -T vmware

    # Generate 5 serial numbers for Debian production
    $0 -n 5 -P DEB -L 8 -S PROD -c upper

    # Generate 2 MACs and 2 SNs
    $0 -n 2 -T vmware -P VM -L 6

    # Generate MAC with no delimiter
    $0 -n 1 -T vmware --no-delimiter

    # Generate SN with no prefix or suffix
    $0 -n 1 -L 10 --no-prefix --no-suffix

EOF
}

# Check if help requested with no other args
if [[ $# -eq 0 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Track which types to generate
GENERATE_MAC=false
GENERATE_SN=false

# Separate arguments by type
MAC_ONLY_ARGS=("-T" "--target" "-R" "--random")
SN_ONLY_ARGS=("-L" "--length" "-P" "--prefix" "-S" "--suffix" "--no-prefix" "--no-suffix")
COMMON_ARGS=("-h" "--help" "-n" "--count" "-c" "--case" "-d" "--delimiter" "--no-delimiter")

# Collect arguments for each script
MAC_ARGS=()
SN_ARGS=()
COMMON_ARGS_FILTERED=()

while [[ $# -gt 0 ]]; do
    arg="$1"
    is_mac_only=false
    is_sn_only=false
    is_common=false
    
    for m in "${MAC_ONLY_ARGS[@]}"; do
        if [[ "$arg" == "$m" ]]; then
            is_mac_only=true
            break
        fi
    done
    
    for s in "${SN_ONLY_ARGS[@]}"; do
        if [[ "$arg" == "$s" ]]; then
            is_sn_only=true
            break
        fi
    done
    
    for c in "${COMMON_ARGS[@]}"; do
        if [[ "$arg" == "$c" ]]; then
            is_common=true
            break
        fi
    done
    
    # Handle arguments with values
    if [[ "$arg" == "-T" || "$arg" == "--target" || "$arg" == "-L" || "$arg" == "--length" || 
          "$arg" == "-P" || "$arg" == "--prefix" || "$arg" == "-S" || "$arg" == "--suffix" ||
          "$arg" == "-n" || "$arg" == "--count" || "$arg" == "-c" || "$arg" == "--case" ||
          "$arg" == "-d" || "$arg" == "--delimiter" ]]; then
        # This arg takes a value
        if [[ $is_mac_only == true ]]; then
            MAC_ARGS+=("$arg" "$2")
            shift 2
        elif [[ $is_sn_only == true ]]; then
            SN_ARGS+=("$arg" "$2")
            shift 2
        elif [[ $is_common == true ]]; then
            COMMON_ARGS_FILTERED+=("$arg" "$2")
            shift 2
        else
            # Unknown arg, pass through
            COMMON_ARGS_FILTERED+=("$arg" "$2")
            shift 2
        fi
    else
        # Flag without value
        if [[ $is_mac_only == true ]]; then
            MAC_ARGS+=("$arg")
            GENERATE_MAC=true
            shift
        elif [[ $is_sn_only == true ]]; then
            SN_ARGS+=("$arg")
            GENERATE_SN=true
            shift
        elif [[ $is_common == true ]]; then
            COMMON_ARGS_FILTERED+=("$arg")
            shift
        else
            # Unknown arg, pass through
            COMMON_ARGS_FILTERED+=("$arg")
            shift
        fi
    fi
done

# Determine which scripts to run based on collected args
if [[ ${#MAC_ARGS[@]} -gt 0 ]]; then
    GENERATE_MAC=true
fi

if [[ ${#SN_ARGS[@]} -gt 0 ]]; then
    GENERATE_SN=true
fi

# Error if neither type specified
if ! ($GENERATE_MAC || $GENERATE_SN); then
    echo "Error: Must specify type via MAC options (-T, -R) or SN options (-L, -P, -S)" >&2
    echo "  Input: $(echo "$@" | tr '\n' ' ')" >&2
    echo "  Valid: Use -T, -R for MAC; -L, -P, -S for SN" >&2
    echo "  Hint: Use -h or --help for usage information" >&2
    exit 1
fi

# Resolve script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Generate MAC addresses if requested
default_target=""
if $GENERATE_MAC; then
    # Check if -T or -R is in MAC_ARGS, if not add default
    has_target=false
    for arg in "${MAC_ARGS[@]}"; do
        if [[ "$arg" == "-T" || "$arg" == "--target" || "$arg" == "-R" || "$arg" == "--random" ]]; then
            has_target=true
            break
        fi
    done
    
    if ! $has_target; then
        # Add default -T vmware if no MAC-specific args other than flags
        # Actually, just pass as-is and let generate_mac.sh handle defaults
        : # No default needed, generate_mac.sh has its own defaults
    fi
    
    # Execute generate_mac.sh
    cmd=( "$SCRIPT_DIR/generate_mac.sh" "${COMMON_ARGS_FILTERED[@]}" "${MAC_ARGS[@]}" )
    "${cmd[@]}"
fi

# Generate serial numbers if requested
if $GENERATE_SN; then
    # Execute generate_sn.sh
    cmd=( "$SCRIPT_DIR/generate_sn.sh" "${COMMON_ARGS_FILTERED[@]}" "${SN_ARGS[@]}" )
    "${cmd[@]}"
fi
