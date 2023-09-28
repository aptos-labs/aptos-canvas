#!/bin/sh

set -e

echo "##### Running tests #####"
GRAFFIO_ADDR="0x12345"

./aptos move test \
  --package-dir move \
  --named-addresses addr=$GRAFFIO_ADDR
