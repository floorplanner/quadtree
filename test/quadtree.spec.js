import fs from 'fs';
import {createCanvas, loadImage} from 'canvas';
import expect from 'expect.js';
import {QuadTree} from '../src/index';

const TEST_IMAGE = './test/data/hi.png';

describe ('quadtree', function () {

    this.timeout(60000);

    it ('should create a quadtree', (cb) => {
        loadImage(TEST_IMAGE).then(image => {
            let canvas = createCanvas(image.width, image.height),
                ctx = canvas.getContext('2d'),
                tree = QuadTree.create(0, 0, image.width, image.height);

            ctx.drawImage(image, 0, 0);

            let imageData = ctx.getImageData(0, 0, image.width, image.height),
                pixels = imageData.data;

            for (let y = 0; y < image.height; ++y) {
                for (let x = 0; x < image.width; ++x) {
                    let index = (x + y * image.width) * 4,
                        px = pixels[index + 3];
                    if (px > 0) {
                        tree.insert(x, y, {x: x, y: y});
                    }
                }
            }

            let data = tree.retrieve(tree.bounds);

            expect(data.length).to.be(116172);

            tree.traverse(function (node) {
                let {x0, y0, width, height} = node.bounds;

                ctx.strokeStyle = `rgba(255,0,0,1)`;
                ctx.strokeRect(x0, y0, width, height);
            });

            fs.writeFileSync('quadtree.png', canvas.toBuffer());

            cb();
        }).catch(cb);
    });

});
