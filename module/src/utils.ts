
export function foreachSeparating<T>(arr: T[], f: (x: T) => void, s: () => void): void{
    if (arr.length > 0) {
        f(arr[0]);
        for (let i = 1; i < arr.length; i++) {
            s();
            f(arr[i]);
        }
    }
}

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

export class IndentedStringBuilder {
    private readonly _content = new Array<string>();

    private readonly _defaultPrefix: string;
    private readonly _prefix = new Array<string>();

    private _lineStart: boolean;

    public constructor(defaultPrefix?: string) {
        this._defaultPrefix = defaultPrefix ?? '    ';
        this._lineStart = true;
    }

    public clear(): void {
        this._content.length = 0;
        this._lineStart = true;
    }

    public append(str: string): IndentedStringBuilder {
        this.appendPrefixInternal();
        
        this._content.push(str);
        return this;
    }

    public appendLine(str?: string): IndentedStringBuilder {
        this.appendPrefixInternal();

        if (str) {
            this._content.push(str);
        }
        this._content.push("\n");

        this._lineStart = true;
        return this;
    }

    private appendPrefixInternal(): void {
        if (this._lineStart) {

            for (const s of this._prefix) {
                this._content.push(s);
            }

            this._lineStart = false;
        }   
    }

    public push(prefix?: string): IndentedStringBuilder {
        this._prefix.push(prefix ?? this._defaultPrefix);
        return this;
    }

    public pop(): IndentedStringBuilder {
        this._prefix.pop();
        return this;
    }

    public stringify(): string {
        return this._content.join('');
    }
}
