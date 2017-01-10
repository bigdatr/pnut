#!/usr/bin/env sh
find src -name '*-default.scss' | while read -r FILE
    do
        mkdir -p $(echo $(dirname "$FILE") | sed -e 's/^src\//lib\//')

        base=$(echo "$FILE" | sed  -e 's/-default\.scss$/-base\.scss/')
        combined=$(cat $([ -r "$base" ] && echo "$base" ) $FILE)

        echo "$combined" > $(echo "$FILE" | sed -e 's/^src\//lib\//')
        echo "$combined" | node-sass --include-path node_modules --output-style compressed > $(echo "$FILE" | sed -e 's/^src\//lib\//' -e 's/\.scss$/\.css/')
    done
