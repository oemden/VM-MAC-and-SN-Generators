#!/bin/bash
# Generate custom serial numbers for VMware VMs
# v0.1.0: Added CLI options (-h, -c, -n) to generate_mac.sh

version="0.1.0"

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Generate custom serial numbers with configurable format.

OPTIONS:
    -l, --length NUM      Length of random part (default: 6)
    -p, --prefix STR      Prefix string (default: "VM")
    -s, --suffix STR      Suffix string (default: none)
    -c, --case TYPE       Character case: upper, lower, mixed (default: upper)
    -n, --count NUM       Number of serial numbers to generate (default: 1)
    -d, --delimiter CHAR  Delimiter between parts (default: "-")
    --no-prefix           Don't add prefix
    --no-delimiter        Don't use delimiter
    -h, --help            Show this help

EXAMPLES:
    $0 -l 9 -c mixed
    # Output: VM-aB3cD4eF5

    $0 -p "DEB" -l 6 -s "PROD" -c upper
    # Output: DEB-A1B2C3-PROD

    $0 -p "VM" -l 4 -s "DEBIAN13" --no-delimiter -n 3
    # Output: VM1234DEBIAN13 (3 times)

    $0 --no-prefix -l 8 -c lower -n 2
    # Output: ab12cd34 (2 times)

EOF
}

# Defaults
LENGTH=6
PREFIX="VM"
SUFFIX="SRV"
CASE="upper"
COUNT=1
DELIMITER="-"
USE_PREFIX=1
USE_DELIMITER=1

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--length)
            LENGTH="$2"
            shift 2
            ;;
        -p|--prefix)
            PREFIX="$2"
            shift 2
            ;;
        -s|--suffix)
            SUFFIX="$2"
            shift 2
            ;;
        -c|--case)
            CASE="$2"
            shift 2
            ;;
        -n|--count)
            COUNT="$2"
            shift 2
            ;;
        -d|--delimiter)
            DELIMITER="$2"
            shift 2
            ;;
        --no-prefix)
            USE_PREFIX=0
            shift
            ;;
        --no-delimiter)
            USE_DELIMITER=0
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate inputs
if ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" -lt 1 ]; then
    echo "Error: Length must be a positive number"
    exit 1
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive number"
    exit 1
fi

if [[ "$CASE" != "upper" && "$CASE" != "lower" && "$CASE" != "mixed" ]]; then
    echo "Error: Case must be 'upper', 'lower', or 'mixed'"
    exit 1
fi

# Generate random string
generate_random() {
    local length=$1
    local case_type=$2
    local result=""

    for ((i=0; i<length; i++)); do
        # Randomly choose between letter and number
        if [ $((RANDOM % 2)) -eq 0 ]; then
            # Generate letter
            if [ "$case_type" = "upper" ]; then
                result+=$(printf \\$(printf '%03o' $((65 + RANDOM % 26))))
            elif [ "$case_type" = "lower" ]; then
                result+=$(printf \\$(printf '%03o' $((97 + RANDOM % 26))))
            else
                # Mixed case
                if [ $((RANDOM % 2)) -eq 0 ]; then
                    result+=$(printf \\$(printf '%03o' $((65 + RANDOM % 26))))
                else
                    result+=$(printf \\$(printf '%03o' $((97 + RANDOM % 26))))
                fi
            fi
        else
            # Generate number
            result+=$((RANDOM % 10))
        fi
    done

    echo "$result"
}

# Build serial number
build_sn() {
    local random_part=$(generate_random "$LENGTH" "$CASE")
    local sn=""

    # Add prefix
    if [ $USE_PREFIX -eq 1 ] && [ -n "$PREFIX" ]; then
        sn="$PREFIX"
        if [ $USE_DELIMITER -eq 1 ]; then
            sn="${sn}${DELIMITER}"
        fi
    fi

    # Add random part
    sn="${sn}${random_part}"

    # Add suffix
    if [ -n "$SUFFIX" ]; then
        if [ $USE_DELIMITER -eq 1 ]; then
            sn="${sn}${DELIMITER}"
        fi
        sn="${sn}${SUFFIX}"
    fi

    echo "$sn"
}

# Generate serial numbers
for ((i=1; i<=COUNT; i++)); do
    build_sn
done
