#!/bin/bash

set -e

rm -rf api

seaography-cli --framework poem --complexity-limit 3 --depth-limit 3 api entities/src postgres://dport:@localhost:5432/canvas notused

rm api/.env

mv /tmp/generated/src/entities entities/src
mv entities/src/mod.rs entities/src/lib.rs

mv /tmp/generated/src/query_root.rs service/src/api/query_root.rs
