#!/usr/bin/env bash
# VM-MAC-and-SN-Generators
# Install script for generate_mac.sh, generate_sn.sh, and genvm.sh
# This script copies the project scripts into /usr/local/bin
# so they can be used as simple commands: genmac, gensn, and genvm.
# v0.4.0: See CHANGELOG.md for details
# v0.5.0: Added genvm.sh unified wrapper

version="0.5.0"

set -euo pipefail

INSTALL_DIR="/usr/local/bin"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SRC_GENMAC="${PROJECT_DIR}/generate_mac.sh"
SRC_GENSN="${PROJECT_DIR}/generate_sn.sh"
SRC_GENVM="${PROJECT_DIR}/genvm.sh"

TARGET_GENMAC="${INSTALL_DIR}/genmac"
TARGET_GENSN="${INSTALL_DIR}/gensn"
TARGET_GENVM="${INSTALL_DIR}/genvm"

echo "=== VM MAC and SN Generators installer v${version} ==="
echo ""

# Check that source scripts exist in the current project directory
if [[ ! -f "${SRC_GENMAC}" ]]; then
  echo "Error: ${SRC_GENMAC} not found."
  echo "Please run this installer from the project root where generate_mac.sh exists."
  exit 1
fi

if [[ ! -f "${SRC_GENSN}" ]]; then
  echo "Error: ${SRC_GENSN} not found."
  echo "Please run this installer from the project root where generate_sn.sh exists."
  exit 1
fi

if [[ ! -f "${SRC_GENVM}" ]]; then
  echo "Error: ${SRC_GENVM} not found."
  echo "Please run this installer from the project root where genvm.sh exists."
  exit 1
fi

# Check sudo privileges early to fail fast if not available
echo "Checking sudo access ..."
if ! sudo -v; then
  echo "This installer requires sudo privileges to write into ${INSTALL_DIR}."
  echo "Please run it with a user that has sudo access."
  exit 1
fi

echo ""
echo "Installing scripts into ${INSTALL_DIR} ..."
echo ""

# Install generate_mac.sh as genmac
if [[ -e "${TARGET_GENMAC}" ]]; then
  echo "Notice: ${TARGET_GENMAC} already exists and will be overwritten."
fi
sudo cp "${SRC_GENMAC}" "${TARGET_GENMAC}"
sudo chmod +x "${TARGET_GENMAC}"
echo "Installed genmac -> ${TARGET_GENMAC}"

# Install generate_sn.sh as gensn
if [[ -e "${TARGET_GENSN}" ]]; then
  echo "Notice: ${TARGET_GENSN} already exists and will be overwritten."
fi
sudo cp "${SRC_GENSN}" "${TARGET_GENSN}"
sudo chmod +x "${TARGET_GENSN}"
echo "Installed gensn  -> ${TARGET_GENSN}"

# Install genvm.sh as genvm
if [[ -e "${TARGET_GENVM}" ]]; then
  echo "Notice: ${TARGET_GENVM} already exists and will be overwritten."
fi
sudo cp "${SRC_GENVM}" "${TARGET_GENVM}"
sudo chmod +x "${TARGET_GENVM}"
echo "Installed genvm   -> ${TARGET_GENVM}"

echo ""
echo "=== Installation complete ==="
echo ""
echo "You can now run:"
echo "  genmac  # VMware MAC address generator"
echo "  gensn   # VMware serial number generator"
echo "  genvm   # Unified MAC/SN generator"
echo ""

# Suggest how to refresh the shell's command cache
if [[ -n "${ZSH_VERSION-}" ]]; then
  echo "If this is a new install, you may need to run:"
  echo "  rehash"
elif [[ -n "${BASH_VERSION-}" ]]; then
  echo "If this is a new install, you may need to run:"
  echo "  hash -r"
else
  echo "If commands are not found immediately, open a new terminal or refresh your shell's hash table."
fi

echo ""
echo "Done."
exit 0
