(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _index = require('../../src/index');

const DEG_TO_RAD = 180 / Math.PI;

let canvas = document.createElement('canvas'),
    tmp = document.createElement('canvas'),
    debug = document.createElement('div'),
    ctx = canvas.getContext('2d'),
    width = 1024,
    height = 768,
    tree = _index.QuadTree.create(0, 0, width, height, 30, 7);

const FP_LOGO_URL = 'https://site.floorplanner.com/assets/app/floorplanner-logo-9a8e186c2a031ce2bd6fdb08258882b26f67dc53c4fbde4119a5776b3a51ab94.png';

const FLOORPLANNER_IMAGE = new Image();
FLOORPLANNER_IMAGE.crossOrigin = 'anonymous';

canvas.width = tmp.width = width;
canvas.height = tmp.width = height;

document.body.appendChild(canvas);
document.body.appendChild(debug);

function renderTree(tree) {

    tree.traverse(node => {
        let { x0, y0, x1, y1, width, height } = node.bounds;

        node.data.forEach(item => {
            let { x, y } = item;
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 2, 2);
        });

        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(x0, y0, width, height);
    });
}

function example1() {
    let count = 25000;

    tree.clear();

    for (let i = 0; i < count; ++i) {
        let x = Math.round(Math.random() * width),
            y = Math.round(Math.random() * height);
        tree.insert(x, y, {});
    }

    return count;
}

class Circle {

    constructor() {
        this.sx = Math.round(Math.random() * width);
        this.sy = Math.round(Math.random() * height);
        this.dx = 4 - Math.random() * 8;
        this.dy = 4 - Math.random() * 8;
        this.radius = Math.random() * 100 + 10;
    }

    step() {
        let count = 0;
        for (let i = 0; i < 360; ++i) {
            let x = Math.cos(i * DEG_TO_RAD) * this.radius,
                y = Math.sin(i * DEG_TO_RAD) * this.radius;
            tree.insert(this.sx + x, this.sy + y, {});
            count++;
        }
        this.sx += this.dx;
        this.sy += this.dy;
        if (this.sx < 0) this.sx = width;else if (this.sx > width) this.sx = 0;
        if (this.sy < 0) this.sy = height;else if (this.sy > height) this.sy = 0;
        return count;
    }
}

let circles = [];
for (let i = 0; i < 50; ++i) {
    circles.push(new Circle());
}

function example2() {
    tree.clear();
    return circles.reduce((acc, c) => acc + c.step(), 0);
}

class ExampleImage {
    constructor(image) {
        this.items = [];
        this.sx = Math.random() * width;
        this.sy = Math.random() * height;
        this.dx = 8 - Math.random() * 16;
        this.dy = 8 - Math.random() * 16;
        this.create(image);
    }

    create(image) {
        let { width, height } = image,
            ctx = tmp.getContext('2d');

        tmp.width = width;
        tmp.height = height;

        this.items = [];

        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(image, 0, 0);

        let pixels = ctx.getImageData(0, 0, width, height).data;

        for (let y = 0; y < height; y += 3) {
            for (let x = 0; x < width; x += 3) {
                let index = (x + y * width) * 4;
                if (pixels[index + 1] > 0) {
                    this.items.push({ x: x, y: y });
                }
            }
        }
    }

    step() {

        this.items.forEach(({ x, y }) => {
            tree.insert(this.sx + x, this.sy + y);
        });

        this.sx += this.dx;
        this.sy += this.dy;
        if (this.sx < 0) this.sx = width;else if (this.sx > width) this.sx = 0;
        if (this.sy < 0) this.sy = height;else if (this.sy > height) this.sy = 0;

        return this.items.length;
    }
}

console.log(FLOORPLANNER_IMAGE.loaded);

let imagesExample3 = [];

FLOORPLANNER_IMAGE.onload = () => {
    console.log('load');
    for (let i = 0; i < 10; ++i) {
        imagesExample3.push(new ExampleImage(FLOORPLANNER_IMAGE));
    }
};
FLOORPLANNER_IMAGE.src = FP_LOGO_URL;

function example3() {
    tree.clear();
    return imagesExample3.reduce((acc, c) => acc + c.step(), 0);
}

const examples = [example3, example2, example1];

let renderCount = 0,
    currExample = 0;

function render() {

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    let t = Date.now();

    let count = examples[currExample]();

    debug.innerHTML = `example ${currExample + 1} - insertion of <strong>${count}</strong> items took ${Date.now() - t} ms`;

    renderCount++;

    if (renderCount > 200) {
        currExample = currExample < examples.length - 1 ? currExample + 1 : 0;
        renderCount = 0;
    }

    renderTree(tree);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

},{"../../src/index":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QuadTreeBoundary = exports.QuadTree = undefined;

var _quadtree = require('./quadtree');

exports.QuadTree = _quadtree.QuadTree;
exports.QuadTreeBoundary = _quadtree.QuadTreeBoundary;

},{"./quadtree":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var DEFAULT_OPTIONS = exports.DEFAULT_OPTIONS = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    capacity: 10,
    max_level: 5
};

class QuadTreeBoundary {
    constructor(x0 = 0, y0 = 0, x1 = 0, y1 = 0) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }

    get width() {
        return this.x1 - this.x0;
    }

    get height() {
        return this.y1 - this.y0;
    }

    get center() {
        return { x: this.x0 + this.width / 2, y: this.y0 + this.height / 2 };
    }

    inside(other) {
        let { x0, y0, x1, y1 } = this;

        if (false) {} else if (other instanceof QuadTreeBoundary) {
            return x0 <= other.x1 && x1 >= other.x0 && y0 <= other.y1 && y1 >= other.y0;
        } else if (other instanceof QuadTreeData) {
            let { x, y } = other;
            return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        }
    }
}

exports.QuadTreeBoundary = QuadTreeBoundary;
class QuadTreeData {
    constructor(x, y, data = null) {
        this.x = x;
        this.y = y;
        this.data = data;
    }

    inside({ x0, y0, x1, y1 }) {
        return x0 <= this.x && this.x <= x1 && y0 <= this.y && this.y <= y1;
    }
}

exports.QuadTreeData = QuadTreeData;
class QuadTree {

    static create(x, y, width, height, capacity = 10, max_level = 5) {
        return new QuadTree(new QuadTreeBoundary(x, y, x + width, y + width), capacity, max_level, 0);
    }

    constructor(bounds, capacity, max_level = 5, level = 0) {
        this.bounds = bounds;
        this.max_level = max_level;
        this.capacity = capacity;
        this.level = level;
        this.nodes = [];
        this.data = [];
    }

    clear() {
        this.nodes = [];
    }

    split() {
        let { x0, y0, x1, y1 } = this.bounds,
            midX = this.bounds.center.x,
            midY = this.bounds.center.y;

        this.nodes = [new QuadTreeBoundary(midX, y0, x1, midY), new QuadTreeBoundary(x0, y0, midX, midY), new QuadTreeBoundary(x0, midY, midX, y1), new QuadTreeBoundary(midX, midY, x1, y1)].map(bounds => {
            return new QuadTree(bounds, this.capacity, this.max_level, this.level + 1);
        });
    }

    index(data) {
        for (let i = 0; i < 4; ++i) {
            if (this.nodes[i].bounds.inside(data)) return i;
        }
        return -1;
    }

    insert(x, y, data = null) {
        this._insert(new QuadTreeData(x, y, data));
    }

    _insert(data) {

        if (!this.bounds.inside(data)) {
            return;
        }

        if (this.nodes.length === 4) {
            let index = this.index(data);
            if (index !== -1) {
                this.nodes[index]._insert(data);
                return;
            }
        }

        this.data.push(data);

        if (this.data.length > this.capacity && this.level < this.max_level) {

            // Check to see if the current node is a leaf, if it is, split
            if (this.nodes.length === 0) {
                this.split();
            }

            this.data = this.data.filter(o => {
                let index = this.index(o);
                if (index !== -1) {
                    this.nodes[index]._insert(o);
                    return false;
                } else {
                    return true;
                }
            });
        }
    }

    query(bounds) {
        let data = [];

        this.traverse(function (node) {
            if (!node.bounds.inside(bounds)) return;

            data = data.concat(node.data.filter(item => {
                return item.inside(bounds);
            }));
        });

        return data;
    }

    retreive(bounds) {
        return this.query(bounds);
    }

    traverse(cb = null) {

        if (typeof cb === 'function') {
            cb(this);
        }

        if (this.nodes.length === 4) {
            for (let i = 0; i < 4; ++i) {
                this.nodes[i].traverse(cb);
            }
        }
    }
}
exports.QuadTree = QuadTree;

},{}]},{},[1]);
