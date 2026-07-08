# GenVM Wrapper Design Plan

**Status:** Draft  
**Author:** Mistral Vibe  
**Date:** 2026-07-08  
**Target:** Unified interface for genmac and gensn, then wrapper  
**Branch:** `feature/script-unification`  
**Worktree:** Required for isolated development  

---

## 1. Executive Summary

**Two-phase approach with rigorous testing:**
1. **Phase 1 (REQUIRED FIRST):** Update BOTH existing scripts to have **unified, consistent interfaces**
2. **Phase 2:** Create optional wrapper script (trivial once Phase 1 is complete)

**Core Principles:**
- Think first, code second
- Test ALL combinations before merging
- Anticipate edge cases with clear error outputs
- Use branch + worktree for isolation

---

## 2. Development Environment Strategy

### 2.1 Branch Strategy
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/script-unification
```

### 2.2 Worktree Strategy
```bash
# Create isolated worktree
git worktree add ../worktree-script-unification feature/script-unification
cd ../worktree-script-unification

# After work complete, clean up
git worktree remove ../worktree-script-unification
```

**Why worktree:**
- Isolated testing environment
- No interference with main working directory
- Easy to discard if something goes wrong
- Clean separation from other branches

### 2.3 Testing Strategy
- Develop in worktree
- Run ALL test cases (see Section 5)
- Fix edge cases BEFORE committing
- Only merge to develop when all tests pass

---

## 3. Problem Statement

### Current Issues in Existing Scripts

#### genmac (v0.4.0)
| Issue | Severity | Current Behavior | Fix |
|-------|----------|------------------|-----|
| Missing --no-delimiter | Medium | N/A | Add flag |
| Target validation | Low | Accepts only vmware | Document limitation |

#### gensn (v0.4.0)
| Issue | Severity | Current Behavior | Fix |
|-------|----------|------------------|-----|
| Lowercase type-specific | High | -l, -p, -s | Rename to -L, -P, -S |
| Missing --no-suffix | Medium | N/A | Add flag |
| -d no value | **HIGH** | Sets DELIM="" | Treat as --no-delimiter |
| -p no value | **HIGH** | Sets PREFIX="" | Treat as --no-prefix |
| -s no value | **HIGH** | Sets SUFFIX="" | Treat as --no-suffix |
| Conflicting options | Medium | No check | Validate combinations |

### Goal
- Both scripts have consistent, compatible interfaces
- All bugs fixed with clear error messages
- Comprehensive test coverage
- Backward compatibility maintained
- Only THEN consider wrapper

---

## 4. Phase 1: Update Both Scripts (PRIORITY)

### 4.1 Argument Unification Scheme

**Rule: Lowercase = Common, Uppercase = Type-Specific**

| Category | Option | Current MAC | Current SN | New MAC | New SN | Notes |
|----------|--------|-------------|-------------|---------|---------|-------|
| Help | `-h, --help` | ✓ | ✓ | ✓ | ✓ | Common |
| Count | `-n, --count` | ✓ | ✓ | ✓ | ✓ | Common |
| Case | `-c, --case` | ✓ | ✓ | ✓ | ✓ | Common |
| Delimiter | `-d, --delimiter` | ✓ | ✓ | ✓ | ✓ | Common |
| No-delimiter | `--no-delimiter` | ✗ | ✓ | **✓** | ✓ | Add to MAC |
| Target | `-T, --target` | ✓ | ✗ | ✓ | ✗ | MAC-specific |
| Random | `-R, --random` | ✓ | ✗ | ✓ | ✗ | MAC-specific |
| Length | N/A | ✗ | `-l, --length` | ✗ | **`-L, --length`** | SN → uppercase |
| Prefix | N/A | ✗ | `-p, --prefix` | ✗ | **`-P, --prefix`** | SN → uppercase |
| Suffix | N/A | ✗ | `-s, --suffix` | ✗ | **`-S, --suffix`** | SN → uppercase |
| No-prefix | N/A | ✗ | ✓ | ✗ | ✓ | SN-specific |
| No-suffix | N/A | ✗ | ✗ | ✗ | **`--no-suffix`** | **NEW** |

### 4.2 genmac - Changes

#### Change 1: Add --no-delimiter
```bash
# In case statement (after --delimiter)
--no-delimiter)
    DELIM=""
    shift
    ;;
```

#### Change 2: Update help text
Add `--no-delimiter` to options list with description.

#### Change 3: Enhance validation (optional improvement)
```bash
# After parsing, validate combinations
if [[ "$RANDOM_LAB" -eq 1 && "$TARGET" != "vmware" ]]; then
    echo "Error: Cannot combine -T/--target with -R/--random" >&2
    exit 1
fi
```

### 4.3 gensn - Changes

#### Change 1: Add USE_SUFFIX variable
```bash
# In defaults section
USE_SUFFIX=1  # NEW
```

#### Change 2: Rename options to uppercase (primary)
```bash
-L|--length)
    LENGTH="$2"
    shift 2
    ;;
-P|--prefix)
    if [[ -z "$2" || "$2" == -* ]]; then
        USE_PREFIX=0
        shift
    else
        PREFIX="$2"
        shift 2
    fi
    ;;
-S|--suffix)
    if [[ -z "$2" || "$2" == -* ]]; then
        USE_SUFFIX=0
        shift
    else
        SUFFIX="$2"
        shift 2
    fi
    ;;
```

#### Change 3: Add --no-suffix
```bash
--no-suffix)
    USE_SUFFIX=0
    shift
    ;;
```

#### Change 4: Fix -d no-value behavior
```bash
-d|--delimiter)
    if [[ -z "$2" || "$2" == -* ]]; then
        USE_DELIMITER=0
        shift
    else
        DELIMITER="$2"
        shift 2
    fi
    ;;
```

#### Change 5: Keep backward compatibility (deprecated aliases)
```bash
-l|--length)
    echo "Warning: -l is deprecated, use -L" >&2
    LENGTH="$2"
    shift 2
    ;;
-p|--prefix)
    echo "Warning: -p is deprecated, use -P" >&2
    if [[ -z "$2" || "$2" == -* ]]; then
        USE_PREFIX=0
        shift
    else
        PREFIX="$2"
        shift 2
    fi
    ;;
-s|--suffix)
    echo "Warning: -s is deprecated, use -S" >&2
    if [[ -z "$2" || "$2" == -* ]]; then
        USE_SUFFIX=0
        shift
    else
        SUFFIX="$2"
        shift 2
    fi
    ;;
```

#### Change 6: Update build_sn function to use USE_SUFFIX
```bash
# In build_sn function, update suffix logic
# Add suffix
if [ $USE_SUFFIX -eq 1 ] && [ -n "$SUFFIX" ]; then
    if [ $USE_DELIMITER -eq 1 ]; then
        sn="${sn}${DELIMITER}"
    fi
    sn="${sn}${SUFFIX}"
fi
```

#### Change 7: Update help text
- List `-L, -P, -S` as primary options
- Add `--no-suffix` 
- Document deprecated `-l, -p, -s` with warnings
- Document no-value behavior

---

## 5. Comprehensive Test Matrix

### 5.1 Edge Case Categories

#### Category A: Argument Validation
| # | Test | Script | Input | Expected | Error Type |
|---|------|--------|-------|----------|------------|
| A1 | Invalid case | MAC | `-c foo` | Error with valid values | Invalid Value |
| A2 | Invalid case | SN | `-c invalid` | Error with valid values | Invalid Value |
| A3 | Zero count | MAC | `-n 0` | Error: count must be >= 1 | Invalid Value |
| A4 | Zero count | SN | `-n 0` | Error: count must be >= 1 | Invalid Value |
| A5 | Negative count | MAC | `-n -5` | Error: count must be >= 1 | Invalid Value |
| A6 | Negative count | SN | `-n -5` | Error: count must be >= 1 | Invalid Value |
| A7 | Non-numeric count | MAC | `-n abc` | Error: count must be number | Invalid Value |
| A8 | Non-numeric count | SN | `-n abc` | Error: count must be number | Invalid Value |
| A9 | Zero length | SN | `-L 0` | Error: length must be >= 1 | Invalid Value |
| A10 | Negative length | SN | `-L -5` | Error: length must be >= 1 | Invalid Value |
| A11 | Non-numeric length | SN | `-L abc` | Error: length must be number | Invalid Value |
| A12 | Multi-char delimiter | MAC | `-d ::` | Error: delimiter must be 1 char or 'none' | Invalid Value |
| A13 | Multi-char delimiter | SN | `-d ::` | Error: delimiter must be 1 char | Invalid Value |
| A14 | Invalid target | MAC | `-T dell` | Error: unsupported target | Invalid Value |

#### Category B: No-Value Argument Behavior
| # | Test | Script | Input | Expected | Error Type |
|---|------|--------|-------|----------|------------|
| B1 | -d no value | MAC | `-d` | Error or default? | Behavior |
| B2 | -d no value | SN | `-d` | Treated as --no-delimiter | Behavior |
| B3 | -d empty string | SN | `-d ""` | Treated as --no-delimiter | Behavior |
| B4 | -p no value | SN | `-p` | Treated as --no-prefix | Behavior |
| B5 | -p empty string | SN | `-p ""` | Treated as --no-prefix | Behavior |
| B6 | -s no value | SN | `-s` | Treated as --no-suffix | Behavior |
| B7 | -s empty string | SN | `-s ""` | Treated as --no-suffix | Behavior |
| B8 | -L no value | SN | `-L` | Treated as --no-delimiter | Behavior |

#### Category C: Conflicting Options
| # | Test | Script | Input | Expected | Error Type |
|---|------|--------|-------|----------|------------|
| C1 | -T + -R | MAC | `-T vmware -R` | Error: cannot combine | Conflict |
| C2 | -P + --no-prefix | SN | `-P DEB --no-prefix` | Error: conflicting options | Conflict |
| C3 | -S + --no-suffix | SN | `-S PROD --no-suffix` | Error: conflicting options | Conflict |
| C4 | -d . + --no-delimiter | MAC | `-d . --no-delimiter` | Error: conflicting options | Conflict |
| C5 | -d . + --no-delimiter | SN | `-d . --no-delimiter` | Error: conflicting options | Conflict |

#### Category D: Backward Compatibility
| # | Test | Script | Input | Expected | Status |
|---|------|--------|-------|----------|--------|
| D1 | Old -l | SN | `-l 8` | Works + deprecation warning | Compat |
| D2 | Old -p | SN | `-p DEB` | Works + deprecation warning | Compat |
| D3 | Old -s | SN | `-s PROD` | Works + deprecation warning | Compat |
| D4 | Old -l no value | SN | `-l` | Works + warning + treated as --no-delimiter | Compat |

#### Category E: Normal Operation
| # | Test | Script | Input | Expected | Status |
|---|------|--------|-------|----------|--------|
| E1 | Default MAC | MAC | (no args) | 1 lowercase MAC with : delimiter | Normal |
| E2 | Default SN | SN | (no args) | 1 SN: VM-XXXXXX-SRV | Normal |
| E3 | Multiple MAC | MAC | `-n 5` | 5 MAC addresses | Normal |
| E4 | Multiple SN | SN | `-n 3` | 3 serial numbers | Normal |
| E5 | Uppercase MAC | MAC | `-c upper -n 2` | 2 uppercase MACs | Normal |
| E6 | Mixed case SN | SN | `-c mixed -n 1` | 1 mixed-case SN | Normal |
| E7 | Custom delimiter MAC | MAC | `-d - -n 1` | 1 MAC with - delimiter | Normal |
| E8 | Custom delimiter SN | SN | `-d _ -n 1` | 1 SN with _ delimiter | Normal |
| E9 | No delimiter MAC | MAC | `--no-delimiter -n 1` | 1 MAC no delimiter | Normal |
| E10 | No delimiter SN | SN | `--no-delimiter -n 1` | 1 SN no delimiter | Normal |
| E11 | No prefix SN | SN | `--no-prefix -n 1` | 1 SN: XXXXXX-SRV | Normal |
| E12 | No suffix SN | SN | `--no-suffix -n 1` | 1 SN: VM-XXXXXX | Normal |
| E13 | Custom prefix/suffix | SN | `-P DEB -S PROD -L 6 -n 1` | DEB-XXXXXX-PROD | Normal |
| E14 | Random MAC | MAC | `-R -n 1` | 1 random lab MAC | Normal |
| E15 | Target MAC | MAC | `-T vmware -n 1` | 1 VMware MAC | Normal |

### 5.2 Test Execution Order

**Priority 1: Normal Operation (E1-E15)** - Must all pass first  
**Priority 2: Argument Validation (A1-A14)** - Clear errors expected  
**Priority 3: No-Value Behavior (B1-B8)** - Consistent handling  
**Priority 4: Conflicting Options (C1-C5)** - Clear error messages  
**Priority 5: Backward Compatibility (D1-D4)** - Warnings + works  

### 5.3 Clear Error Output Requirements

Every error must follow this format:
```
Error: [Brief description of problem]
  Input: [the problematic value or option]
  Valid: [list of valid values or options]
  Hint: [suggestion for fix]
```

**Examples:**
```
Error: Invalid case value for MAC generation
  Input: 'foo'
  Valid: upper, lower, both
  Hint: Use -c upper, -c lower, or -c both

Error: Count must be a positive integer
  Input: '0'
  Valid: 1, 2, 3, ...
  Hint: Use -n with a number >= 1

Error: Delimiter must be a single character or 'none'
  Input: '::'
  Valid: any single character, or 'none'
  Hint: Use -d '.' or -d none

Error: Cannot combine -T and -R options
  Input: -T vmware -R
  Valid: Use -T OR -R, not both
  Hint: Choose one target type

Error: Conflicting options -P and --no-prefix
  Input: -P DEB --no-prefix
  Valid: Use -P OR --no-prefix, not both
  Hint: Choose one prefix approach
```

---

## 6. Error Handling Implementation Guide

### 6.1 genmac Error Handling

```bash
# Validate case option
if [[ "$CASE" != "upper" && "$CASE" != "lower" && "$CASE" != "both" ]]; then
    echo "Error: Invalid case value for MAC generation" >&2
    echo "  Input: '$CASE'" >&2
    echo "  Valid: upper, lower, both" >&2
    echo "  Hint: Use -c upper, -c lower, or -c both" >&2
    exit 1
fi

# Validate count option
if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive integer" >&2
    echo "  Input: '$COUNT'" >&2
    echo "  Valid: 1, 2, 3, ..." >&2
    echo "  Hint: Use -n with a number >= 1" >&2
    exit 1
fi

# Validate delimiter option
if [[ "$DELIM" == "none" ]]; then
    DELIM=""
elif [[ ${#DELIM} -ne 1 ]]; then
    echo "Error: Delimiter must be a single character or 'none'" >&2
    echo "  Input: '$DELIM'" >&2
    echo "  Valid: any single character, or 'none'" >&2
    echo "  Hint: Use -d '.' or -d none" >&2
    exit 1
fi

# Validate target option
if [[ "$TARGET" != "vmware" ]]; then
    echo "Error: Unsupported target type for MAC generation" >&2
    echo "  Input: '$TARGET'" >&2
    echo "  Valid: vmware" >&2
    echo "  Hint: Use -T vmware (currently only supported target)" >&2
    exit 1
fi

# Check for conflicting options
if [[ "$RANDOM_LAB" -eq 1 && "$TARGET" != "vmware" ]]; then
    echo "Error: Cannot combine -T and -R options" >&2
    echo "  Input: -T $TARGET -R" >&2
    echo "  Valid: Use -T OR -R, not both" >&2
    echo "  Hint: Choose one target type" >&2
    exit 1
fi
```

### 6.2 gensn Error Handling

```bash
# Validate length option
if ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" -lt 1 ]; then
    echo "Error: Length must be a positive integer" >&2
    echo "  Input: '$LENGTH'" >&2
    echo "  Valid: 1, 2, 3, ..." >&2
    echo "  Hint: Use -L with a number >= 1" >&2
    exit 1
fi

# Validate count option
if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -lt 1 ]; then
    echo "Error: Count must be a positive integer" >&2
    echo "  Input: '$COUNT'" >&2
    echo "  Valid: 1, 2, 3, ..." >&2
    echo "  Hint: Use -n with a number >= 1" >&2
    exit 1
fi

# Validate case option
if [[ "$CASE" != "upper" && "$CASE" != "lower" && "$CASE" != "mixed" ]]; then
    echo "Error: Invalid case value for SN generation" >&2
    echo "  Input: '$CASE'" >&2
    echo "  Valid: upper, lower, mixed" >&2
    echo "  Hint: Use -c upper, -c lower, or -c mixed" >&2
    exit 1
fi

# Validate delimiter option
if [[ "$DELIMITER" == "none" ]]; then
    USE_DELIMITER=0
elif [[ ${#DELIMITER} -ne 1 ]]; then
    echo "Error: Delimiter must be a single character" >&2
    echo "  Input: '$DELIMITER'" >&2
    echo "  Valid: any single character" >&2
    echo "  Hint: Use -d '.' or -d '-'" >&2
    exit 1
fi
```

### 6.3 Conflicting Option Detection

Add after argument parsing in both scripts:

```bash
# For gensn
if [[ $USE_PREFIX -eq 0 && [[ " ${ORIG_ARGS[@]} " =~ " -P " ]]]; then
    echo "Error: Conflicting options -P and --no-prefix" >&2
    echo "  Input: -P with --no-prefix" >&2
    echo "  Valid: Use -P OR --no-prefix, not both" >&2
    echo "  Hint: Choose one prefix approach" >&2
    exit 1
fi

if [[ $USE_SUFFIX -eq 0 && [[ " ${ORIG_ARGS[@]} " =~ " -S " ]]]; then
    echo "Error: Conflicting options -S and --no-suffix" >&2
    echo "  Input: -S with --no-suffix" >&2
    echo "  Valid: Use -S OR --no-suffix, not both" >&2
    echo "  Hint: Choose one suffix approach" >&2
    exit 1
fi

if [[ $USE_DELIMITER -eq 0 && [[ " ${ORIG_ARGS[@]} " =~ " -d " ]]]; then
    echo "Error: Conflicting options -d and --no-delimiter" >&2
    echo "  Input: -d with --no-delimiter" >&2
    echo "  Valid: Use -d OR --no-delimiter, not both" >&2
    echo "  Hint: Choose one delimiter approach" >&2
    exit 1
fi
```

---

## 7. Implementation Checklist

### Pre-Implementation
- [ ] Create branch: `feature/script-unification`
- [ ] Create worktree for isolated development
- [ ] Review current scripts thoroughly
- [ ] Verify all test cases in current scripts pass

### Phase 1: genmac
- [ ] Add `--no-delimiter` flag
- [ ] Enhance error messages (all validation points)
- [ ] Add conflicting option detection
- [ ] Update help text
- [ ] Run all test cases (Section 5)
- [ ] Fix any failures

### Phase 1: gensn
- [ ] Add `USE_SUFFIX=1` default
- [ ] Change `-l` → `-L` (primary)
- [ ] Change `-p` → `-P` (primary)
- [ ] Change `-s` → `-S` (primary)
- [ ] Add `--no-suffix` flag
- [ ] Fix `-d` no-value behavior
- [ ] Fix `-p` no-value behavior
- [ ] Fix `-s` no-value behavior
- [ ] Add deprecated aliases (-l, -p, -s)
- [ ] Update build_sn to use USE_SUFFIX
- [ ] Enhance error messages (all validation points)
- [ ] Add conflicting option detection
- [ ] Update help text
- [ ] Run all test cases (Section 5)
- [ ] Fix any failures

### Phase 1: README.md
- [ ] Update genmac options section
- [ ] Update gensn options section
- [ ] Document new uppercase options
- [ ] Document deprecated options
- [ ] Document no-value behavior
- [ ] Add migration notes

### Phase 1: Validation
- [ ] All normal operation tests pass (E1-E15)
- [ ] All argument validation tests pass (A1-A14)
- [ ] All no-value behavior tests pass (B1-B8)
- [ ] All conflicting option tests pass (C1-C5)
- [ ] All backward compatibility tests pass (D1-D4)
- [ ] Error messages are clear and actionable

### Phase 2: Wrapper (Optional)
- [ ] Create genvm.sh
- [ ] Test wrapper with all combinations
- [ ] Update README.md with wrapper docs
- [ ] Update install.sh

### Post-Implementation
- [ ] Remove worktree
- [ ] Commit changes to branch
- [ ] Push branch to remote
- [ ] Create PR for review

---

## 8. Rollout Plan

```
Phase 1: Update Scripts (REQUIRED)
├── Branch + Worktree Setup
├── genmac Updates
│   ├── Add --no-delimiter
│   ├── Enhance error handling
│   └── Update help text
├── gensn Updates
│   ├── Rename to uppercase (-L, -P, -S)
│   ├── Add --no-suffix
│   ├── Fix no-value behaviors
│   ├── Add deprecated aliases
│   ├── Enhance error handling
│   └── Update help text
├── README.md Updates
│   ├── MAC script docs
│   ├── SN script docs
│   └── Migration notes
└── Comprehensive Testing
    ├── 45 test cases (Section 5)
    ├── All edge cases covered
    └── Clear error outputs verified

Phase 2: Wrapper (OPTIONAL)
├── Create genvm.sh
├── Test combinations
└── Document
```

---

## 9. Success Criteria

### Phase 1 (Required - Must All Pass)
- [ ] genmac has --no-delimiter support
- [ ] genmac has clear error messages
- [ ] gensn uses -L, -P, -S (uppercase)
- [ ] gensn has --no-suffix
- [ ] gensn fixes no-value behavior for -d, -p, -s
- [ ] gensn has deprecated aliases with warnings
- [ ] Both scripts have enhanced error handling
- [ ] All 45 test cases pass
- [ ] README.md updated
- [ ] Help texts updated
- [ ] Backward compatibility maintained

### Phase 2 (Optional)
- [ ] Wrapper script works correctly
- [ ] Wrapper handles all combinations
- [ ] Wrapper documentation complete

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing scripts | Medium | High | Worktree isolation, comprehensive tests, backward compat |
| User confusion from changes | Medium | Medium | Deprecation warnings, clear docs, migration guide |
| Bug fixes introduce new bugs | Medium | High | Test ALL combinations before commit |
| Incomplete edge case coverage | Medium | High | Explicit test matrix (Section 5) |
| Poor error messages | Low | Medium | Standardized error format (Section 5.3) |

**Overall Risk: Medium** (Mitigated by worktree isolation and comprehensive testing)

---

## 11. Appendix

### Current Script Locations
- `scripts/genmac` - 208 lines
- `scripts/gensn` - 174 lines

### Test Commands Reference
```bash
# Run all tests
cd /path/to/VM-MAC-and-SN-Generators

# Test MAC script
./scripts/genmac -n 3 -c lower -d ':' -T vmware
./scripts/genmac -R -n 1
./scripts/genmac --no-delimiter -n 1

# Test SN script
./scripts/gensn -L 6 -P DEB -S PROD -c upper -n 2
./scripts/gensn --no-prefix -L 8 -n 1
./scripts/gensn --no-suffix -L 6 -n 1
./scripts/gensn -d . -n 1
./scripts/gensn -d -n 1  # Should = --no-delimiter
./scripts/gensn -p -n 1  # Should = --no-prefix
./scripts/gensn -s -n 1  # Should = --no-suffix

# Test error cases
./scripts/genmac -c invalid 2>&1 | head -4  # Check error format
./scripts/gensn -n 0 2>&1 | head -4
./scripts/gensn -L 0 2>&1 | head -4
```

### Worktree Commands
```bash
# Create worktree
cd /Users/oem/mobiloemdrive/OEMDEV/CODE/GITHUB/VM-MAC-and-SN-Generators
git worktree add ../worktree-script-unification feature/script-unification

# Work in worktree
cd ../worktree-script-unification

# Clean up worktree
git worktree remove ../worktree-script-unification
```

---

*Document generated: 2026-07-08*
*Last updated: 2026-07-08*
*Approach: Branch + Worktree + Test Everything + Clear Errors*
