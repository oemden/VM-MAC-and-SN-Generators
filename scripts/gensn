#!/bin/bash
# Generate custom serial numbers for VMware VMs
# v0.4.0: See CHANGELOG.md for details
# v0.5.0: Changed -l/-p/-s to -L/-P/-S, added --no-suffix, fixed no-value behavior

version="0.5.0"

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Generate customizable serial numbers with configurable format version ${version}.

SERIAL NUMBER OPTIONS:
    -L, --length NUM      Length of random part (default: 6)
    -P, --prefix STR      Prefix string (default: "VM")
    -S, --suffix STR      Suffix string (default: "SRV")
    --no-prefix           Don't add prefix
    --no-suffix           Don't add suffix

COMMON OPTIONS:
    -c, --case TYPE       Character case: upper, lower, mixed (default: upper)
    -n, --count NUM       Number of serial numbers to generate (default: 1)
    -d, --delimiter CHAR  Delimiter between parts (default: "-")
    --no-delimiter        Disable delimiter
    -h, --help            Show this help

NOTE: Using -L, -P, or -S with no value is equivalent to their --no-* flags:
    -L with no value = --no-delimiter
    -P with no value = --no-prefix
    -S with no value = --no-suffix

EXAMPLES:
    $0 -L 9 -c mixed
    # Output: VM-aB3cD4eF5

    $0 -P "DEB" -L 6 -S "PROD" -c upper
    # Output: DEB-A1B2C3-PROD

    $0 -P "VM" -L 4 -S "DEBIAN13" --no-delimiter -n 3
    # Output: VM1234DEBIAN13 (3 times)

    $0 --no-prefix -L 8 -c lower -n 2
    # Output: ab12cd34 (2 times)

    $0 --no-suffix -L 6 -c upper -n 1
    # Output: VM-ABC123

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
USE_SUFFIX=1

# Track which flags were explicitly used (for conflict detection)
USED_P_WITH_VALUE=0
USED_S_WITH_VALUE=0
USED_D_WITH_VALUE=0
USED_lowercase_p=0
USED_lowercase_s=0
USED_lowercase_l=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        # Uppercase primary options (new)
        -L|--length)
            LENGTH="$2"
            shift 2
            ;;
        -P|--prefix)
            if [[ -z "$2" || "$2" == -* ]]; then
                # -P with no value: treat as --no-prefix (NOT a conflict)
                USE_PREFIX=0
                shift
            else
                PREFIX="$2"
                USED_P_WITH_VALUE=1
                shift 2
            fi
            ;;
        -S|--suffix)
            if [[ -z "$2" || "$2" == -* ]]; then
                # -S with no value: treat as --no-suffix (NOT a conflict)
                USE_SUFFIX=0
                shift
            else
                SUFFIX="$2"
                USED_S_WITH_VALUE=1
                shift 2
            fi
            ;;
        --no-suffix)
            USE_SUFFIX=0
            shift
            ;;
        
        # Common options
        -c|--case)
            CASE="$2"
            shift 2
            ;;
        -n|--count)
            COUNT="$2"
            shift 2
            ;;
        -d|--delimiter)
            if [[ -z "$2" || "$2" == -* ]]; then
                # -d with no value: treat as --no-delimiter (NOT a conflict)
                USE_DELIMITER=0
                shift
            else
                DELIMITER="$2"
                USED_D_WITH_VALUE=1
                shift 2
            fi
            ;;
        --no-prefix)
            USE_PREFIX=0
            shift
            ;;
        --no-delimiter)
            USE_DELIMITER=0
            shift
            ;;
        
        # Lowercase deprecated aliases (backward compatibility)
        -l|--length)
            echo "Warning: -l is deprecated, use -L" >&2
            LENGTH="$2"
            USED_lowercase_l=1
            shift 2
            ;;
        -p|--prefix)
            echo "Warning: -p is deprecated, use -P" >&2
            if [[ -z "$2" || "$2" == -* ]]; then
                # -p with no value: treat as --no-prefix (NOT a conflict)
                USE_PREFIX=0
                shift
            else
                PREFIX="$2"
                USED_lowercase_p=1
                shift 2
            fi
            ;;
        -s|--suffix)
            echo "Warning: -s is deprecated, use -S" >&2
            if [[ -z "$2" || "$2" == -* ]]; then
                # -s with no value: treat as --no-suffix (NOT a conflict)
                USE_SUFFIX=0
                shift
            else
                SUFFIX="$2"
                USED_lowercase_s=1
                shift 2
            fi
            ;;
        
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Error: Unknown option" >&2
            echo "  Input: '$1'" >&2
            echo "  Valid: -h, -L, -P, -S, -c, -n, -d, --no-prefix, --no-suffix, --no-delimiter" >&2
            echo "  Hint: Use -h or --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Check for conflicting options
# Conflict only if explicit value provided WITH --no-* flag
if [[ $USED_P_WITH_VALUE -eq 1 && $USE_PREFIX -eq 0 ]]; then
    echo "Error: Conflicting options -P and --no-prefix" >&2
    echo "  Input: -P <value> with --no-prefix" >&2
    echo "  Valid: Use -P <value> OR --no-prefix, not both" >&2
    echo "  Hint: Choose one prefix approach" >&2
    exit 1
fi

if [[ $USED_S_WITH_VALUE -eq 1 && $USE_SUFFIX -eq 0 ]]; then
    echo "Error: Conflicting options -S and --no-suffix" >&2
    echo "  Input: -S <value> with --no-suffix" >&2
    echo "  Valid: Use -S <value> OR --no-suffix, not both" >&2
    echo "  Hint: Choose one suffix approach" >&2
    exit 1
fi

if [[ $USED_D_WITH_VALUE -eq 1 && $USE_DELIMITER -eq 0 ]]; then
    echo "Error: Conflicting options -d and --no-delimiter" >&2
    echo "  Input: -d <char> with --no-delimiter" >&2
    echo "  Valid: Use -d <char> OR --no-delimiter, not both" >&2
    echo "  Hint: Choose one delimiter approach" >&2
    exit 1
fi

# Also check deprecated lowercase
if [[ $USED_lowercase_p -eq 1 && $USE_PREFIX -eq 0 ]]; then
    echo "Error: Conflicting options -p and --no-prefix" >&2
    echo "  Input: -p <value> with --no-prefix" >&2
    echo "  Valid: Use -p <value> OR --no-prefix, not both" >&2
    echo "  Hint: Choose one prefix approach (note: -p is deprecated, use -P)" >&2
    exit 1
fi

if [[ $USED_lowercase_s -eq 1 && $USE_SUFFIX -eq 0 ]]; then
    echo "Error: Conflicting options -s and --no-suffix" >&2
    echo "  Input: -s <value> with --no-suffix" >&2
    echo "  Valid: Use -s <value> OR --no-suffix, not both" >&2
    echo "  Hint: Choose one suffix approach (note: -s is deprecated, use -S)" >&2
    exit 1
fi

# Validate inputs
if ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" -lt 1 ]; then
    echo "Error: Length must be a positive integer" >&2
    echo "  Input: '$LENGTH'" >&2
    echo "  Valid: 1, 2, 3, ..." >&2
    echo "  Hint: Use -L with a number >= 1" >&2
    exit 1
fi

# Validate delimiter (only if USE_DELIMITER is enabled and DELIMITER is set)
if [[ $USE_DELIMITER -eq 1 && -n "$DELIMITER" && ${#DELIMITER} -ne 1 ]]; then
    echo "Error: Delimiter must be a single character" >&2
    echo "  Input: '$DELIMITER'" >&2
    echo "  Valid: any single character" >&2
    echo "  Hint: Use -d '.' or -d '-'" >&2
    exit 1
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive integer" >&2
    echo "  Input: '$COUNT'" >&2
    echo "  Valid: 1, 2, 3, ..." >&2
    echo "  Hint: Use -n with a number >= 1" >&2
    exit 1
fi

if [[ "$CASE" != "upper" && "$CASE" != "lower" && "$CASE" != "mixed" ]]; then
    echo "Error: Invalid case value for SN generation" >&2
    echo "  Input: '$CASE'" >&2
    echo "  Valid: upper, lower, mixed" >&2
    echo "  Hint: Use -c upper, -c lower, or -c mixed" >&2
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
    if [ $USE_SUFFIX -eq 1 ] && [ -n "$SUFFIX" ]; then
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
