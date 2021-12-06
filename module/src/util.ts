

export function isArrayInstanceOf<T>(arr: any, Class: new (...args: any[])=>T) : arr is Array<T> {
    if (Array.isArray(arr)) {
        return arr.every(elem => elem instanceof Class);
    } else {
        return false;
    }
}

function collectTreeImpl<T>(lines: string[], prefix: string, childPrefix: string, node: T, childs: (n: T) => T[], format: (n: T) => string): void {
    lines.push(prefix + ' ' + format(node));

    var nodeChilds = childs(node);
    for (let i = 0; i < nodeChilds.length; i++)
    {
        var item = nodeChilds[i];

        if (i < nodeChilds.length - 1)
            collectTreeImpl(lines, childPrefix + '  ├─', childPrefix + '  │ ', item, childs, format);
        else
            collectTreeImpl(lines, childPrefix + '  └─', childPrefix + '    ', item, childs, format);
    }

    if (nodeChilds.length > 0 && childs(nodeChilds[nodeChilds.length - 1]).length === 0)
        lines.push(childPrefix);
}

export function collectTree<T>(root: T, childs: (n: T) => T[], format: (n: T) => string): string {
    const lines = [];
    collectTreeImpl(lines, '', '', root, childs, format);
    return lines.join('\n');
}

export class QueueItem<T> {
    public next: QueueItem<T>|null = null;

    public constructor(
        public data: T
    ){
    }
}

export class LinkedQueue<T> {
    private _head : QueueItem<T>|null = null;
    private _tail : QueueItem<T>|null = null;
    private _count = 0;

    public constructor() {
    }

    public get count() { return this._count; }

    public enqueue(data: T) {
        var item = new QueueItem<T>(data);

        if (this._tail) {
            this._tail.next = item;

        } else { // _count === 0
            this._head = item;
        }
        
        this._tail = item;
        this._count++;
    }

    public dequeue() : T|undefined {
        if (this._head) {
            const item = this._head;
            this._head = item.next;
            item.next = null;
            
            this._count--;
            if (this._count == 0) {
                this._head = null;
            }

            return item.data;
        } else {
            return undefined;
        }
    }
}

export class ImmStack<T> {
    private _count: number;
    private _next: ImmStack<T> | null;
    private _data: T | null;

    private constructor(next: ImmStack<T> | null, data: T | null) {
        this._count = (next?.count ?? 0) + (data ? 1 : 0)
        this._next = next;
        this._data = data;
    }

    public get count() { return this._count; }

    public push(data: T) : ImmStack<T> {
        return new ImmStack<T>(this._data ? this : null, data);
    }

    public pop() : ImmStack<T>|null {
        return this._next;
    }

    public peek() : T|null {
        return this._data;
    }

    public static empty<T>() { return new ImmStack<T>(null, null); }
}
