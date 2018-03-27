import {QuadTree} from '../../src/index';

const DEG_TO_RAD = 180 / Math.PI;

let canvas = document.createElement('canvas'),
    tmp = document.createElement('canvas'),
    debug = document.createElement('div'),
    ctx = canvas.getContext('2d'),
    width = 1024,
    height = 768,
    tree = QuadTree.create(0, 0, width, height, 30, 7);

const FP_LOGO_URL = 'https://site.floorplanner.com/assets/app/floorplanner-logo-9a8e186c2a031ce2bd6fdb08258882b26f67dc53c4fbde4119a5776b3a51ab94.png';

const FLOORPLANNER_IMAGE = new Image
FLOORPLANNER_IMAGE.crossOrigin = 'anonymous'

canvas.width = tmp.width = width;
canvas.height = tmp.width = height;

document.body.appendChild(canvas);
document.body.appendChild(debug);

function renderTree (tree) {

    tree.traverse((node) => {
        let {x0, y0, x1, y1, width, height} = node.bounds;

        node.data.forEach(item => {
            let {x, y} = item;
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 2, 2);
        });

        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(x0, y0, width, height);
    })
}


function example1 () {
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

    constructor () {
        this.sx = Math.round(Math.random() * width);
        this.sy = Math.round(Math.random() * height);
        this.dx = 4 - Math.random() * 8;
        this.dy = 4 - Math.random() * 8;
        this.radius = Math.random() * 100 + 10;
    }

    step () {
        let count = 0;
        for (let i = 0; i < 360; ++i) {
            let x = Math.cos(i*DEG_TO_RAD) * this.radius,
                y = Math.sin(i*DEG_TO_RAD) * this.radius;
            tree.insert(this.sx + x, this.sy + y, {});
            count++;
        }
        this.sx += this.dx;
        this.sy += this.dy;
        if (this.sx < 0) this.sx = width;
        else if (this.sx > width) this.sx = 0;
        if (this.sy < 0) this.sy = height;
        else if (this.sy > height) this.sy = 0;
        return count;
    }
}

let circles = [];
for (let i = 0; i < 50; ++i) {
    circles.push(new Circle);
}

function example2 () {
    tree.clear();
    return circles.reduce((acc, c) => acc+c.step(), 0);
}

class ExampleImage {
    constructor (image) {
        this.items = [];
        this.sx = Math.random() * width;
        this.sy = Math.random() * height;
        this.dx = 8 - Math.random() * 16;
        this.dy = 8 - Math.random() * 16;
        this.create(image);
    }

    create (image) {
        let {width, height} = image,
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
                if (pixels[index+1] > 0) {
                    this.items.push({x: x, y: y});
                }
            }
        }
    }

    step () {

        this.items.forEach(({x, y}) => {
            tree.insert(this.sx+x, this.sy+y);
        });

        this.sx += this.dx;
        this.sy += this.dy;
        if (this.sx < 0) this.sx = width;
        else if (this.sx > width) this.sx = 0;
        if (this.sy < 0) this.sy = height;
        else if (this.sy > height) this.sy = 0;

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

function example3 () {
    tree.clear();
    return imagesExample3.reduce((acc, c) => acc+c.step(), 0);

}

const examples = [
    example3,
    example2,
    example1
];

let renderCount = 0,
    currExample = 0;

function render () {

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    let t = Date.now();

    let count = examples[currExample]();

    debug.innerHTML = `example ${currExample+1} - insertion of <strong>${count}</strong> items took ${Date.now() - t} ms`;

    renderCount++;

    if (renderCount > 200) {
        currExample = currExample < examples.length - 1 ? currExample + 1 : 0;
        renderCount = 0;
    }

    renderTree(tree);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
