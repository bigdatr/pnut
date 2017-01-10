#!/usr/bin/env sh
find src -name '*-base.scss' | while read -r FILE
    do
        mkdir -p $(echo $(dirname "$FILE") | sed -e 's/^src\//lib\//')
        cp "$FILE" $(echo "$FILE" | sed -e 's/^src\//lib\//')
        node-sass --include-path node_modules --output-style compressed "$FILE" $(echo "$FILE" | sed -e 's/^src\//lib\//' -e 's/\.scss$/\.css/')
    done
