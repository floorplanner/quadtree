import {QuadTree} from '../../src/index';

let canvas = document.createElement('canvas'),
    debug = document.createElement('div'),
    ctx = canvas.getContext('2d'),
    width = 1024,
    height = 768,
    tree = QuadTree.create(0, 0, width, height, 30, 7);

canvas.width = width;
canvas.height = height;

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

function render () {
    let count = 25000;

    ctx.fillStyle = '#ffff00';
    ctx.fillRect(0, 0, width, height);

    let t = Date.now();
    tree.clear();

    for (let i = 0; i < count; ++i) {
        let x = Math.round(Math.random() * width),
            y = Math.round(Math.random() * height);
        tree.insert(x, y, {});
    }
    debug.innerHTML = `insertion of ${count} items took ${Date.now() - t} ms`;

    renderTree(tree);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
