#!/bin/bash

package_file="path/to/package.json"
@ needs jq to be installed
version=$(jq -r '.version' "$package_file")

# Build the docker image
docker build --rm --force-rm -t ignitial/ghiriroom:${version} .
docker tag ignitial/ghiriroom:${version} ignitial/ghiriroom:latest