#!/usr/bin/env sh
mkdir -p lib &&                                                 \
find src -name '*-base.scss' |                                  \
xargs cat > lib/base.scss &&                                    \
node-sass --include-path node_modules --output-style compressed lib/base.scss lib/base.css
