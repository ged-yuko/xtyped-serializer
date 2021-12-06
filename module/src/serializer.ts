import { ICtor, XmlModelItemReference, XmlModelTypeInfo, XmlModelPropertyInfo, findModelTypeInfoByType, MyConstructor, findModelTypeInfoByObjType, IXmlModelItemReference } from "./annotations";
import * as m from "./content-model";
import { ImmStack, collectTree } from "./util";

const untype = ((x:any):any => x);

//#region xpath quirks

const xpath = (node: Node, expr: string, nsResolver?: XPathNSResolver, nodeType?: number) : XPathResult => {
    //const doc = node.ownerDocument || node as Document;
    const doc = node instanceof Document ? node : node.ownerDocument;
    if (!doc)
        throw new Error('Failed to obtain document to apply xpath ' + expr + ': ' + node);
/*
    const nsResolver: XPathNSResolver = (prefix) => {
        var ns = new Map<string|null,string>([
            ['m', 'main.webapp.xml'],
        ]);
        return ns.get(prefix)||null;
    };
*/
    const result = doc.evaluate(expr, node, nsResolver, nodeType);
    return result;
};

const xpathString = (node: Node, expr: string, nsResolver?: XPathNSResolver) : string => {
    const result = xpath(node, expr, nsResolver, XPathResult.STRING_TYPE);
    return result.stringValue;
};

const xpathNodes = (node: Node, expr: string, nsResolver?: XPathNSResolver) : Node[] => {
    const result = xpath(node, expr, nsResolver);
    var items = new Array<Node>();
    for (var item = result.iterateNext(); item; item = result.iterateNext()) {
        items.push(item);
    }
    return items;
};

export class XmlNodeInterpreter {
    public constructor(
        private readonly _node: Node,
        private readonly _resolver?: XPathNSResolver
    ) {
    }

    public string(xpath: string) : string {
        return xpathString(this._node, xpath, this._resolver);
    }
    public int(xpath: string) : number {
        return Number.parseInt(xpathString(this._node, xpath, this._resolver));
    }
    public float(xpath: string) : number {
        return Number.parseFloat(xpathString(this._node, xpath, this._resolver));
    }
    public bool(xpath: string) : boolean {
        const s = xpathString(this._node, xpath, this._resolver);
        return s.toLowerCase() === 'true' || Number.parseInt(s) === 1;
    }

    public nodes(xpath: string) : XmlNodeInterpreter[] {
        return xpathNodes(this._node, xpath, this._resolver).map(n => new XmlNodeInterpreter(n));
    }
    public node(xpath: string) : XmlNodeInterpreter {
        return new XmlNodeInterpreter(xpathNodes(this._node, xpath, this._resolver)[0]);
    }

    public rawElement(xpath: string) : Element {
        return xpathNodes(this._node, xpath, this._resolver).find(n => n instanceof Element) as Element;
    }
}

//#endregion

//#region model mapping

class XmlElementMapping {
    private _modelType : XmlModelTypeInfo;

    private _attrsByRef = new Map<XmlModelItemReference, XmlModelPropertyInfo>();
    private _elementsByOrderAndRef = new Array<Map<XmlModelItemReference, XmlElementMapping>>();

    public constructor(modelType: XmlModelTypeInfo) {
        this._modelType = modelType;
    }

    public instantiate(e: Element) : any {
        const o = this._modelType.createInstance();
        this.fillObjFromElement(o, e);
        return o;
    }

    private fillObjFromElement(o: any, e: Element) {
        let order = 0;
        e.childNodes.forEach(n => {
            if (n instanceof Attr) {
                const p = this._attrsByRef.get(XmlModelItemReference.from(n));
                if (p) {
                    Reflect.set(o, p.name, n.value);
                } else {
                    // unknown attribute
                }
            } else if (n instanceof Element) {
                const key = XmlModelItemReference.from(n);
                let elements = this._elementsByOrderAndRef[order];
                let mapping = elements.get(key);
                if (mapping) {
                    
                }
            }
        });
    }
}

const findRootMapping = <T> (e: Element, ...type: ICtor<T>[]) : XmlElementMapping|undefined => {    
    const rootDesc = type.map(t => findModelTypeInfoByType(t))
                        .filter(t => t != undefined)
                        .find(t => t?.getRootSpecs()
                                     .some(r => (r.name ?? t.getName()) === e.localName 
                                             && (!r.namespace || !e.namespaceURI || r.namespace === e.namespaceURI)
                                     )
                        );

    if (rootDesc) {
        const mapping = new XmlElementMapping(rootDesc);
        return mapping;
    } else {
        return undefined;
    }
}

function childsOf(node: Element) : { attributes: Attr[], subnodes: Node[] }{
    const attributes = new Array<Attr>();
    const subnodes = new Array<Node>();

    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes.item(i);
        if (attr) {
            attributes.push(attr);
        }
    }

    node.childNodes.forEach(cn => {
        if (cn instanceof Attr) {
            attributes.push(cn);
        } else {
            subnodes.push(cn);
        }
    });

    return { attributes, subnodes };
}
/*
class XmlElementContentFsmFrame {

}
class XmlElementContentFsmState {
    private constructor(
        public pos: number,
        public node: m.XmlElementContentFsmNode,
        public stack: ImmStack<XmlElementContentFsmFrame>,
        public path: ImmStack<m.XmlElementModel>
    ){
    }

    public static initial(node: m.XmlElementContentFsmNode) : XmlElementContentFsmState {
        return new XmlElementContentFsmState(
            0, 
            node,
            ImmStack.empty<XmlElementContentFsmFrame>(),
            ImmStack.empty<m.XmlElementModel>()
        );
    }
}
class XmlElementContentFsmRunner implements m.IXmlElementContentFsmNodeVisitor<XmlElementContentFsmState, XmlElementContentFsmState[]> {

    private constructor(
        private fsm: m.XmlElementContentFsm,
        private elts: Array<Element>
    ) {
    }

    visitCountControlNode(node: m.XmlElementContentFsmCountControlNode, arg: XmlElementContentFsmState) : XmlElementContentFsmState[] {
        throw new Error("Method not implemented.");
    }
    visitConsumeAllNode(node: m.XmlElementContentFsmConsumeAllNode, arg: XmlElementContentFsmState) : XmlElementContentFsmState[] {
        throw new Error("Method not implemented.");
    }
    visitConsumeNode(node: m.XmlElementContentFsmConsumeNode, arg: XmlElementContentFsmState) : XmlElementContentFsmState[] {
        throw new Error("Method not implemented.");
    }
    visitSimpleNode(node: m.XmlElementContentFsmNode, arg: XmlElementContentFsmState) : XmlElementContentFsmState[] {
        throw new Error("Method not implemented.");
    }

    public static findSteps(fsm: m.XmlElementContentFsm, elts: Array<Element>) {
        const runner = new XmlElementContentFsmRunner(fsm, elts);
        const q = new LinkedQueue<XmlElementContentFsmState>();
        q.enqueue(XmlElementContentFsmState.initial(fsm.start))
        const results = new Array<XmlElementContentFsmState>();
        
        while (q.count > 0) {
            const s = q.dequeue();
            const ns = s.node.apply(runner, s);

            for (const fs of ns) {
                if (fs.node === fsm.end) {
                    results.push(fs);
                } else {
                    q.enqueue(fs);
                }
            }
        }

        switch (results.length) {
            case 0: throw new Error('Invalid document'); break;
            case 1: return runner.prepareResultSteps(results[0]);
            default: throw new Error('Ambuiguity!'); break;
        }
    }

    private prepareResultSteps(state: XmlElementContentFsmState) {
        const result = new Array<{element: Element, model: m.XmlElementModel}>(state.path.count);
        let step = state.path;
        for (let i = 0; i < this.elts.length; i++) {
            result[i] = { element: this.elts[i], model: step.peek() };
            step = step.pop();
        }
        return result;
    }
}

class XmlDomToObjMapper {

    // private _rootNs: m.XmlNamespaceModel;
    private _log = '';

    public constructor() {
    }

    private log(msg: any) {
        this._log += msg + '\n';
    }

    public mapElement(node: Element, obj: any, model: m.XmlElementModel) {
        if (model.name === node.localName) {
            const childs = childsOf(node);
            const contentSteps = XmlElementContentFsmRunner.findSteps(model.content.fsm, childs.subnodes);

            for (const attr of childs.attributes) {
                const am = model.content.resolveAttr(attr.localName);
                if (am) {
                    Reflect.set(obj, am.name, attr.value);
                } else {
                    this.log(`failed to resolve attribute ${attr.localName}`);
                    return;
                }
            }

            for (const { element, model } of contentSteps) {
                const subobj = this.instantiateModelObj(model);
                this.mapElement(element, subobj, model);
                Reflect.set(obj, model.name, subobj);
            }
        }
    }

    private instantiateModelObj(model: m.XmlElementModel) : any {
        throw new Error('TODO instantiate according to model mapping');
    }
}
*/
class XmlDomToObjCtx {
    private constructor(
        public parent: XmlDomToObjCtx|null,
        public childs: XmlDomToObjCtx[],
        public part: m.XmlElementPartModel,
        public start: number,
        public pos: number
    ){
    }

    public advance(part: m.XmlElementPartModel): XmlDomToObjCtx {
        return new XmlDomToObjCtx(this.parent, this.childs, part, this.pos, this.pos + 1);
    }

    public enter(part: m.XmlElementPartModel): XmlDomToObjCtx {
        return new XmlDomToObjCtx(this, [], part, this.pos, this.pos);
    }
    
    public exit(part: m.XmlElementPartModel): XmlDomToObjCtx {
        if (this.parent && part === this.part) {
            return new XmlDomToObjCtx(this.parent.parent, [...this.parent.childs, this], this.parent.part, this.parent.start, this.pos);
        } else {
            throw new Error('Parser/mapper inconsistency');
        }
    }
    
    public static initial(part: m.XmlElementPartModel) {
        return new XmlDomToObjCtx(null, [], part, 0, 0);
    }
}

class XmlDomToObjMapper implements m.IXmlContentPartModelVisitor<XmlDomToObjCtx, XmlDomToObjCtx[]> {

    private _elements: Element[];
    // private _rootNs: m.XmlNamespaceModel;
    private _log = '';

    private constructor(elements: Element[]) {
        this._elements = elements;
    }

    private log(msg: any) {
        this._log += msg + '\n';
    }

    visitXmlElement(model: m.XmlElementModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] {
        if (model.name  === this._elements[arg.pos].localName) {
            return [arg.advance(model)];
        } else {
            return [];
        }
    }
    visitXmlAnyElement(model: m.XmlElementAnyModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] {
        throw new Error("Method not implemented.");
    }
    visitXmlAllGroup(model: m.XmlElementAllGroupModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] {
        throw new Error("Method not implemented.");
    }
    visitXmlSequenceGroup(model: m.XmlElementSequenceGroupModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] {
        let steps = [arg];
        let path = ImmStack.empty<XmlDomToObjCtx[]>().push(steps)

        
        for (const part of model.parts) {
            path = path.push(steps = steps.flatMap(s => this.visit(s, part)))
        }

        return steps;
    }
    visitXmlChoiceGroup(model: m.XmlElementChoiceGroupModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] {
        const result = new Array<XmlDomToObjCtx>();

        for (const part of model.parts) {
            result.push(... this.visit(arg, part));
        }

        return result;
    }

    private visit(arg: XmlDomToObjCtx, part: m.XmlElementPartModel): XmlDomToObjCtx[] {
        const results = part.apply(this, arg.enter(part));
        return results.map(rs => rs.exit(part));
    }

    private static _objectFillers = new Map<Function, (ee: Element[], o: any, t: XmlDomToObjCtx) => void>([
        [m.XmlElementModel, (ee, o, t) => Reflect.set(o, (<m.XmlElementModel>t.part).name, XmlDomToObjMapper.mapElement(ee[t.start], new (<MyConstructor>(<m.XmlElementModel>t.part).typeCtor)(), <any>t.part))],
        [m.XmlElementSequenceGroupModel, (ee, o, t) => XmlDomToObjMapper.fillObj(ee, o, t)]
    ]);

    private static fillObj(elements: Element[], obj: any, tree: XmlDomToObjCtx) {
        for (const s of tree.childs) {
            const ffiller = this._objectFillers.get(s.part.constructor);
            if (ffiller) {
                ffiller(elements, obj, s);
            }
        }
    }

    public static mapElement(node: Element, obj: any, model: m.XmlElementModel) {
        if (model.name === node.localName) {
            const childs = childsOf(node);
            const elements = <Element[]> childs.subnodes.filter(n => n instanceof Element);
            const mapper = new XmlDomToObjMapper(elements);
            const contentSteps = mapper.visit(XmlDomToObjCtx.initial(model), model.content.getSequence());

            //const tre = contentSteps.map(t => collectTree(t, s => s.childs, s => s.part.toString() + ' @' + s.pos));
            // tre.forEach(t => console.warn(t));
            // console.warn(model);

            if (contentSteps.length !== 1) {
                throw new Error(`Invalid document`);
            }

            for (const attr of childs.attributes) {
                const attrModel = model.content.findAttributeByLocalName(attr.localName);
                if (attrModel) {
                    Reflect.set(obj, attrModel.name, attr.value);
                }
            }

            XmlDomToObjMapper.fillObj(elements, obj, contentSteps[0]);

            // console.warn(obj);
            return obj;
        } else {
            throw new Error('Invalid mapping attept');
        }        
    }

    visitXmlAttribute(model: m.XmlAttributeModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] { throw new Error("Method not implemented."); }
}

class XmlObjToDomCtx {
    private constructor(
        public parent: XmlObjToDomCtx|null,
        public element: Element,
        public key: string,
        public obj: any
    ){
    }

    public enter(element: Element, key: string, obj: any) : XmlObjToDomCtx {
        return new XmlObjToDomCtx(this, element, key, obj);
    }

    public static initial(element: Element, obj: any) : XmlObjToDomCtx {
        return new XmlObjToDomCtx(null, element, '', obj);
    }
}

class XmlObjToDomMapper implements m.IXmlContentPartModelVisitor<XmlObjToDomCtx, void> {
    
    private constructor() {
    }

    visitXmlElement(model: m.XmlElementModel, arg: XmlObjToDomCtx): void {
        const element = arg.element.ownerDocument.createElementNS(arg.element.namespaceURI, model.name); // TODO consider namespace switching
        arg.element.appendChild(element);
        this.fillElement(model, arg.enter(element, model.name, Reflect.get(arg.obj, model.name)));
    }
    visitXmlAnyElement(model: m.XmlElementAnyModel, arg: XmlObjToDomCtx): void {
        throw new Error("Method not implemented.");
    }
    visitXmlAllGroup(model: m.XmlElementAllGroupModel, arg: XmlObjToDomCtx): void {
        throw new Error("Method not implemented.");
    }
    visitXmlSequenceGroup(model: m.XmlElementSequenceGroupModel, arg: XmlObjToDomCtx): void {
        for (const part of model.parts) {
            this.visit(part, arg);
        }
    }
    visitXmlChoiceGroup(model: m.XmlElementChoiceGroupModel, arg: XmlObjToDomCtx): void {
        throw new Error("Method not implemented.");
    }

    private visit(part: m.XmlElementPartModel, arg: XmlObjToDomCtx): void {
        part.apply(this, arg);
    }

    private fillElement(model: m.XmlElementModel, arg: XmlObjToDomCtx) {
        for (const attrModel of model.content.getAttributes()) {
            const value = Reflect.get(arg.obj, attrModel.propertyName);
            arg.element.setAttributeNS(attrModel.namespace, attrModel.name, '' + value); // TODO sophisticated simpleTypes
        }
        
        this.visit(model.content.getSequence(), arg);
    }

    public static mapElement(node: Element, obj: any, model: m.XmlElementModel) {
        new XmlObjToDomMapper().fillElement(model, XmlObjToDomCtx.initial(node, obj));
    }

    visitXmlAttribute(model: m.XmlAttributeModel, arg: XmlObjToDomCtx): void { throw new Error("Method not implemented."); }
}

//#endregion

const nsCtxByType = new Map<string, Map<Function, m.XmlNamespaceModel>>();

const resolveModelForType = (ns: string, elname: string, type: Function) => {
    let  nsByType = nsCtxByType.get(ns);
    if (!nsByType) {
        nsByType = new Map<Function, m.XmlNamespaceModel>();
        nsCtxByType.set(ns, nsByType);
    } 

    let model = nsByType.get(type);
    if (!model) {
        model = m.XmlNamespaceModel.makeForType(type);
        nsByType.set(type, model);
    }

    return model;
}


const walkXmlNodeImpl = (xml: Node) : XmlNodeInterpreter => {
    return new XmlNodeInterpreter(xml);
};
const walkXmlStringImpl = (xml: string) : XmlNodeInterpreter => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "application/xml");
    return new XmlNodeInterpreter(dom.documentElement);
};
const serializeImpl = (root: any) : string => {
    const typeInfo = findModelTypeInfoByObjType(root);
    if (!typeInfo) {
        throw new Error('Unknown XML model type ' + root.constructor.name); 
    }

    const nsModels = typeInfo.getRootSpecs()
                             .map(s => ({ namespace: s.namespace ?? '', name: s.name ?? typeInfo.getName() }))
                             .map(s => ({ rootSpec: s, nsModel: resolveModelForType(s.namespace, s.name, root.constructor) }));
    if (nsModels.length !== 1) {
        throw new Error('Unknown root element of type ' + root.constructor.name); 
    }
    
    const nsModel = nsModels[0];

    const elementModel = nsModel.nsModel.findRootElement(nsModel.rootSpec.name);
    if (!elementModel) {
        throw new Error('Unknown root element ' + nsModel.rootSpec.name); 
    }

    var doc = document.implementation.createDocument(nsModel.nsModel.namespace, nsModel.rootSpec.name);
    
    XmlObjToDomMapper.mapElement(doc.documentElement, root, elementModel);

    const writer = new XMLSerializer();
    const xmlText = writer.serializeToString(doc);
    return xmlText;
};
// deserialize: <T, C extends { new (): T }> (xml: string, ...types: C[]) : T => {
const deserializeImpl = <T> (xml: string, ...type: ICtor<T>[]) : T => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "application/xml");
    const rootElement = dom.documentElement;

    // const mapping = getRootMapping(rootElement, ... untype(type));
    // const root = mapping.instantiate(rootElement);
    const typeInfo = findModelTypeInfoByType(type[0]); // TODO other types probing
    if (!typeInfo) {
        throw new Error('Unknown XML model type ' + type[0]); 
    }
    const root = typeInfo.createInstance();

    const nsModel = resolveModelForType(rootElement.namespaceURI ?? '', rootElement.localName, root.constructor);
    const elementModel = nsModel.findRootElement(rootElement.localName);
    if (!elementModel) {
        throw new Error('Unknown root element ' + rootElement.localName); 
    }
    XmlDomToObjMapper.mapElement(rootElement, root, elementModel);

    return root;
};

export default {
    walkXmlNode: walkXmlNodeImpl,
    walkXmlString: walkXmlStringImpl,
    serialize: serializeImpl,
    deserialize: deserializeImpl,
};
