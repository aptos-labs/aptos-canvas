#!/bin/sh

set -e

echo "##### Running tests #####"
GRAFFIO_ADDR="0xb764b4baa21a53b7af4ea6688674d385e3255871021de12ddd6be5e004e92fec"

aptos move publish \
	--assume-yes \
  --profile testnet-v3 \
  --named-addresses addr=$GRAFFIO_ADDR
