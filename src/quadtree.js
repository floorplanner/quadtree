
export var DEFAULT_OPTIONS = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    capacity: 10,
    max_level: 5
};

export class QuadTreeBoundary {
    constructor (x0 = 0, y0 = 0, x1 = 0, y1 = 0) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }

    get width () {
        return this.x1 - this.x0;
    }

    get height () {
        return this.y1 - this.y0;
    }

    get center () {
        return  {x: this.x0 + this.width / 2, y: this.y0 + this.height / 2};
    }

    inside (other) {
        let {x0, y0, x1, y1} = this;

        if (false) {

        } else if (other instanceof QuadTreeBoundary) {
            return (x0 <= other.x1 && x1 >= other.x0 && y0 <= other.y1 && y1 >= other.y0);
        } else if (other instanceof QuadTreeData) {
            let {x, y} = other;
            return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        }
    }
}

export class QuadTreeData {
    constructor (x, y, data = null) {
        this.x = x;
        this.y = y;
        this.data = data;
    }

    inside ({x0, y0, x1, y1}) {
        return x0 <= this.x && this.x <= x1 && y0 <= this.y && this.y <= y1;
    }
}

export class QuadTree {

    static create (x, y, width, height, capacity = 10, max_level = 5) {
        return new QuadTree(
            new QuadTreeBoundary(x, y, x+width, y+width),
            capacity,
            max_level,
            0
        );
    }

    constructor (bounds, capacity, max_level = 5, level = 0) {
        this.bounds = bounds;
        this.max_level = max_level;
        this.capacity = capacity;
        this.level = level;
        this.nodes = [];
        this.data = [];
    }

    clear () {
        this.nodes = [];
    }

    split () {
        let {x0, y0, x1, y1} = this.bounds,
            midX = this.bounds.center.x,
			midY = this.bounds.center.y;

        this.nodes = [
            new QuadTreeBoundary(midX, y0, x1, midY),
            new QuadTreeBoundary(x0, y0, midX, midY),
            new QuadTreeBoundary(x0, midY, midX, y1),
            new QuadTreeBoundary(midX, midY, x1, y1)
        ].map(bounds => {
            return new QuadTree(
                bounds,
                this.capacity,
                this.max_level,
                this.level + 1);
        });
    }

    index (data) {
        for (let i = 0; i < 4; ++i) {
            if (this.nodes[i].bounds.inside(data)) return i;
        }
        return -1;
    }

    insert (x, y, data = null) {
        this._insert(new QuadTreeData(x, y, data));
    }

    _insert (data) {

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

    query (bounds) {
        let data = [];

        this.traverse(function (node) {
            if (!node.bounds.inside(bounds)) return;

            data = data.concat(node.data.filter(item => {
                return item.inside(bounds);
            }));
        });

        return data;
    }

    retreive (bounds) {
        return this.query(bounds);
    }

    traverse (cb = null) {

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
