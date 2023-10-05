#!/bin/sh

set -e

echo "##### Running tests #####"
GRAFFIO_ADDR="0x53c2e4476d51d9e53d67dd668c706599b77947e84d229ef28d5c3e92436fe668"

aptos move publish \
	--assume-yes \
  --profile testnet-v1 \
  --named-addresses addr=$GRAFFIO_ADDR
