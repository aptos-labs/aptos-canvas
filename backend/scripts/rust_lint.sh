#!/bin/sh

# This assumes you have already installed cargo-sort:
# cargo install cargo-sort
#
# The best way to do this however is to run scripts/dev_setup.sh
#
# If you want to run this from anywhere in aptos-core, try adding this wrapepr
# script to your path:
# https://gist.github.com/banool/e6a2b85e2fff067d3a215cbfaf808032

if [ ! -f "scripts/rust_lint.sh" ] 
then
    echo "Please run this from the processor/ directory." 
    exit 1
fi

set -e
set -x

cargo +nightly fmt

cargo clippy

cargo sort --grouped --workspace
