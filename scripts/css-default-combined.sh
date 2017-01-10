#!/usr/bin/env sh
mkdir -p lib &&                                                         \
find src -name '*-base.scss' |                                          \
xargs cat > lib/default.scss &&                                         \
find src -name '*-default.scss' |                                       \
xargs cat >> lib/default.scss &&                                        \
node-sass --include-path node_modules --output-style compressed lib/default.scss lib/default.css
