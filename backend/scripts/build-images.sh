#!/bin/bash

# To use this to push images, run the script with --push, e.g.
# ./scripts/build-images.sh --push

if [ ! -f "scripts/build-images.sh" ]; then
    echo "Please run this from the backend/ directory."
    exit 1
fi

set -ex

export GIT_SHA=$(git rev-parse HEAD)
export IMAGE_REPO=us-docker.pkg.dev/aptos-registry/docker/graffio-backend

docker buildx build . -t "${IMAGE_REPO}:${GIT_SHA}" "$@"
