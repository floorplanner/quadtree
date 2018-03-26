## quadtree

A simple quadtree implementation.

![alt quadtree](https://content.screencast.com/users/TimKnip/folders/Jing/media/2e40667f-baf3-416c-98ff-ef8ef372271b/2018-03-26_1312.png)

### install

    npm i quadtree

### example

```javascript

import {Quadtree} from 'quadtree';

let width = 800;    // width of the tree
let height = 600;   // height of the tree
let capacity = 10;  // capacity of a node
let max_level = 5;  // recursion depth

let tree = QuadTree.create(0, 0, width, height, capacity, max_level);

tree.insert(100, 100, {text: 'some data'});

tree.traverse(function (node) {
    console.log(node.level, node.data);
});

let data = tree.retrieve(tree.bounds);

console.log(data);

```
