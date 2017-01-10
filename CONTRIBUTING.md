

# General component requirements

When adding new components they must have:
- Full test coverage (using ava)
- [JSDoc documentation](#docs)
- Flow types
- Strict semver versioning
- A working [example](#examples)

---

# Component styling

Component styles are build by a group of shell scripts in the [scripts](/scripts) folder.

The CSS build will output a bunch of different files into the `lib` folder.

- It aggregates all the base styles for components into a `base.css` file.
- It combines base _and_ default styles (seeing as you'd never want default without base) into a `default.css` file.
- It creates sass and css files for individual components so that you can pick and choose what files you want.
- As well as creating the `.css` files it also combines and moves the sass files across to allow users to handle sass compilation if they would prefer.

For example if you had a `Table-base.scss` and `Table-default.scss` file it would output the following files:

```
lib
├── base.css
├── base.scss
├── default.css
├── default.scss
├── component
│   └── table
│       ├── Table-base.css
│       ├── Table-base.scss
│       ├── Table-default.css
│       ├── Table-default.scss
│       └── Table.js
```


---

# Examples

All components should be accompanied by implementation examples. Simple code examples can be placed in [JSDoc comments](http://usejsdoc.org/tags-example.html) but any complex or varied functionality that the component allows should be shown with working examples in the [example](/example) folder.

## Building the examples

You can run the examples build from the parent pnut folder by running:

```
yarn run build-examples
```

This will cd into the example folder and run `yarn install` and `yarn run build`. Once the task finishes you can view the examples by running your favourite webserver in the `example` folder.


## Developing examples

The example folder contains a basic webpack/babel build setup. To start working on examples go into the example folder and run:

```
yarn install
```

The two main tasks are _build_ and _watch_.

```
yarn run build
```
Will do a production build of the examples.

```
yarn run watch
```
will start up webpack-dev-server and allow for rapid development.

---

# Docs

Documentation is written using [JSDoc](http://usejsdoc.org/) comments.

@TODO add more info here about documentation standards.
