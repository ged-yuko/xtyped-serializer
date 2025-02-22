import { UnionType } from "typescript";
import { XmlModelItemReference, XmlModelTypeInfo, XmlModelPropertyInfo, findModelTypeInfoByType, findModelTypeInfoByObjType, IXmlModelItemReference, DefaultCtor, CtorOf, AnyCtorOf } from "./annotations";
import * as m from "./content-model";
import { ImmStack, collectTree, isArray, IndentedStringBuilder, firstOrDefault, parallelMap, ConstructedType, ArrayElementType } from "./utils";

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
        const o = this._modelType.getTypeCtorInfo().createInstance();
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

const findRootMapping = <T> (e: Element, ...type: DefaultCtor[]) : XmlElementMapping|undefined => {    
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
        public readonly parent: XmlDomToObjCtx|null,
        public readonly childs: XmlDomToObjCtx[],
        public readonly part: m.XmlElementPartModel,
        public readonly start: number,
        public readonly pos: number
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

    public equals(other: XmlDomToObjCtx) : boolean {
        return this.pos === other.pos 
            && this.start === other.start
            && this.part === other.part 
            && parallelMap(cc => cc[0].equals(cc[1]), this.childs, other.childs).every(b => b);
    }
    
    public static initial(part: m.XmlElementPartModel) {
        return new XmlDomToObjCtx(null, [], part, 0, 0);
    }
}

type XmlConcretePartModel<T extends m.XmlContentPartModel> = (T & {property: XmlModelPropertyInfo});
function isConcretePart<T extends m.XmlContentPartModel>(model: m.XmlContentPartModel, ctor: AnyCtorOf<T>) : model is XmlConcretePartModel<T> {
    return model instanceof ctor && !!model.property;
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
        const element = this._elements[arg.pos];
        if (arg.pos < this._elements.length && model.elementName === element.localName && model.form.namespace === (element.namespaceURI ?? '')) { // TODO think about qualifiedness here
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
        
        const step = (state: XmlDomToObjCtx) => {
            const results = part.apply(this, state.enter(part));
            return results.map(rs => rs.exit(part));
        }

        let states = [arg];
        let count = 0;
        while (count < part.minOccurs && states.length > 0) {
            states = states.flatMap(step);
            count++;
        }

        let result = states;
        while (states.length > 0 && count < part.maxOccurs) {
            result = states;
            states = states.flatMap(step);
            count++;
        }

        return states.length > 0 ? states : result;
    }

    private static bindValue(o: any, propertyName: string, value: any) {
        const existingValue = Reflect.get(o, propertyName);
        if (isArray(existingValue)) {
            existingValue.push(value);
        } else {
            Reflect.set(o, propertyName, value);
        }
    }

    private static _objectFillers = new Map<Function, (ee: Element[], o: any, t: XmlDomToObjCtx) => void>([
        [m.XmlElementModel, (ee, o, t) => {
            if (isConcretePart(t.part, m.XmlElementModel)) {
                this.ensureCollectionIfNeeded(o, t.part);
                if (t.part.typeCtor) {
                    const value = XmlDomToObjMapper.mapElement(ee[t.start], new (t.part.typeCtor)(), <any>t.part);
                    this.bindValue(o, t.part.property.name, value);
                } else {
                    console.warn(`Unable to instantiate model of ${t.part.elementName} due to unspecified contructor`);
                }
            } else {
                throw new Error('Can map only concrete element model.');
            }
        }],
        [m.XmlElementSequenceGroupModel, (ee, o, t) => {
            if (isConcretePart(t.part, m.XmlElementSequenceGroupModel) && t.part.typeCtor) {
                this.ensureCollectionIfNeeded(o, t.part);
                const value = new (t.part.typeCtor)();
                XmlDomToObjMapper.fillObj(ee, value, t);
                this.bindValue(o, t.part.property.name, value);
            } else {
                XmlDomToObjMapper.fillObj(ee, o, t)
            }
        }],
        [m.XmlElementChoiceGroupModel, (ee, o, t) => { 
            if (isConcretePart(t.part, m.XmlElementChoiceGroupModel)) {
                this.ensureCollectionIfNeeded(o, t.part);
            }
            XmlDomToObjMapper.fillObj(ee, o, t)
        }]
    ]);

    private static ensureCollectionIfNeeded<T extends m.XmlElementPartModel>(obj: any, part: XmlConcretePartModel<T>) {
        if (part.maxOccurs > 1) {
            const oldValue = Reflect.get(obj, part.property.name);
            if (!isArray(oldValue)) {
                const newValue = new Array<any>();
                Reflect.set(obj, part.property.name, newValue);
            }
        }
    }

    private static fillObj(elements: Element[], obj: any, tree: XmlDomToObjCtx) {
        for (const s of tree.childs) {
            const ffiller = this._objectFillers.get(s.part.constructor);
            if (ffiller) {
                ffiller(elements, obj, s);
            } else {
                throw new Error(`Xml content part ${s.part.constructor.name} filler is not implemented`);
            }
        }
    }

    public static mapElement(node: Element, obj: any, model: m.XmlElementModel) {
        if (model.elementName === node.localName) {
            const childs = childsOf(node);
            const elements = <Element[]> childs.subnodes.filter(n => n instanceof Element);
            const mapper = new XmlDomToObjMapper(elements);
            const plausibleContentSteps = mapper.visit(XmlDomToObjCtx.initial(model), model.content.getSequence());
            const maxDst = Math.max(... plausibleContentSteps.map(s => s.pos));
            const contentSteps = plausibleContentSteps.filter(s => s.pos === maxDst);

            // if (contentSteps.length > 1) {
            //     const first = contentSteps[0];
            //     if (contentSteps.slice(1).every(s => s.equals(first))) {
            //         contentSteps = [first];
            //     }
            // }

            if (contentSteps.length !== 1) {
                console.warn(this.collectDebugInfo(node, contentSteps, model)); 
            } else {
                this.mapElementAttributes(node, obj, model.content);
                XmlDomToObjMapper.fillObj(elements, obj, contentSteps[0]);
            }

            // console.warn(obj);
            return obj;
        } else {
            throw new Error('Invalid mapping attept');
        }        
    }

    private static collectDebugInfo(node: Element, contentSteps: XmlDomToObjCtx[], model: m.XmlElementModel) : string {
        const tre = contentSteps.map(t => collectTree(t, s => s.childs, s => s.part.toString() + ' @' + s.pos));

        const sb = new IndentedStringBuilder();
        sb.appendLine(`Invalid document at line ${node.lineNumber}:${node.columnNumber} having`).push();
        sb.appendLine().push();
        sb.appendLine(node.outerHTML).pop();
        sb.appendLine();
        sb.appendLine(`while expected`).push();
        sb.appendLine(model.content.getSequence().toStringDescribe()).pop();
        sb.appendLine(`but got ${contentSteps.length} of paths`).push();
        if (tre.length > 0) {
            sb.appendLine();
            tre.forEach(t => sb.appendLine(t));
        } else {
            sb.appendLine(`nothing nice`);
        }

        return sb.stringify();
    }

    private static mapElementAttributes(node: Element, obj: any, model: m.XmlAttrsContainerModel) {
        for (const attr of model.getAttributes()) {
            // const value = node.getAttributeNS(attr.form.namespace, attr.attributeName);
            const prefix = attr.form.qualified ? (node.lookupPrefix(attr.form.namespace) + ':') : '';
            const value = node.getAttribute(prefix + attr.attributeName) ?? attr.defaultValue;
            Reflect.set(obj, attr.property.name, value);
        }
        for (const agroup of model.getAttributeGroups()) {
            const value = new agroup.typeCtor();
            Reflect.set(obj, agroup.property.name, value); // TODO make it possible to have optional attribute groups
            this.mapElementAttributes(node, value, agroup);
        }
    }

    visitXmlAttribute(model: m.XmlAttributeModel, arg: XmlDomToObjCtx): XmlDomToObjCtx[] { throw new Error("Method not implemented."); }
}

class XmlnsCounter {
    private _value = 0;

    public constructor() {
    }

    public nextValue() : number {
        return ++this._value;
    }
}

type XmlNsPrefixInfo = { prefix: string, declNeeded: boolean, nsctx: XmlnsCtx };

class XmlnsCtx {
    public constructor(
        private readonly currPrefix: string,
        private readonly currNs: string,
        private readonly prefixByNs: Map<string, string>,
        private readonly nsByPrefix: Map<string, string>,
        private readonly counter: XmlnsCounter
    ) {
    }

    private update(prefix: string, namespace: string, declNeeded: boolean) : XmlnsCtx {
        let byNs;
        let byPrefix;

        if (declNeeded && prefix.length > 0) {
            byNs = new Map(this.prefixByNs);
            byPrefix = new Map(this.nsByPrefix);
            byNs.set(namespace, prefix);
            byPrefix.set(prefix, namespace);
        } else {
            byNs = this.prefixByNs;
            byPrefix = this.nsByPrefix;
        }

        return new XmlnsCtx(prefix, namespace, byNs, byPrefix, this.counter);
    }

    public setCurrFrom(other: XmlnsCtx) {
        return new XmlnsCtx(other.currPrefix, other.currNs, this.prefixByNs, this.nsByPrefix, this.counter);
    }

    public getPrefixFor(part: m.IXmlContentPart) : XmlNsPrefixInfo {
        let prefix: string;
        let declNeeded: boolean;

        const existingPrefix = this.prefixByNs.get(part.form.namespace);
        const oldNsOfPreferred = part.form.preferredPrefix ? this.nsByPrefix.get(part.form.preferredPrefix) : undefined;

        if (part.form.namespace === this.currNs) {
            prefix = this.currPrefix;
            declNeeded = false;
        } else if (existingPrefix) {
            prefix = existingPrefix;
            declNeeded = false;
        } else if (part.form.preferredPrefix && (!oldNsOfPreferred || oldNsOfPreferred === part.form.namespace)) {
            prefix = part.form.preferredPrefix;
            declNeeded = !oldNsOfPreferred;
        } else {
            prefix = '';
            declNeeded = true;
        }

        if (part.form.qualified) {
            if (prefix.length == 0) {
                prefix = 'ns' + this.counter.nextValue();
                declNeeded = true;
            }
        } else {
            if (this.currNs == part.form.namespace) {
                prefix = '';
                declNeeded = false;
            }
        }

        const ctx = (declNeeded || part.form.namespace !== this.currNs || prefix != this.currPrefix) 
                        ? this.update(prefix, part.form.namespace, declNeeded)
                        : this;

        return { prefix, declNeeded, nsctx: ctx };
    }
    
    public static initial() : XmlnsCtx {
        return new XmlnsCtx('', '', new Map(), new Map(), new XmlnsCounter());
    }
}

class XmlObjToDomCtx {
    private constructor(
        public readonly parent: XmlObjToDomCtx|null,
        public readonly element: Element,
        public readonly obj: any,
        public readonly containingProperty: m.XmlModelSubpartPropertyInfo,
        public readonly modelMatchedExplicitly: boolean,
        public readonly xmlns: XmlnsCtx,
    ){
    }

    public enter(element: Element, obj: any, containingProperty: m.XmlModelSubpartPropertyInfo, modelMatchedExplicitly?: boolean) : XmlObjToDomCtx {
        return new XmlObjToDomCtx(this, element, obj, containingProperty, modelMatchedExplicitly ?? false, this.xmlns);
    }
    public exitPreserveXmlns() : XmlObjToDomCtx {
        if (!this.parent) {
            throw new Error('Invalid operation during object to XML DOM mapping');
        }
        
        return new XmlObjToDomCtx(
            this.parent.parent,
            this.parent.element,
            this.parent.obj,
            this.parent.containingProperty, 
            this.modelMatchedExplicitly, 
            this.xmlns.setCurrFrom(this.parent.xmlns)
        );
    }

    private newNs(xmlns: XmlnsCtx) : XmlObjToDomCtx {
        return new XmlObjToDomCtx(this, this.element, this.obj, this.containingProperty, this.modelMatchedExplicitly, xmlns);
    }

    public getPrefixFor(part: m.IXmlContentPart) : { prefix: string, declNeeded: boolean, ctx: XmlObjToDomCtx } {
        const result = this.xmlns.getPrefixFor(part);
        const ctx = result.nsctx === this.xmlns ? this : this.newNs(result.nsctx);
        return { prefix: result.prefix, declNeeded: result.declNeeded, ctx };
    }

    public static initial(element: Element, obj: any, xmlns: XmlnsCtx) : XmlObjToDomCtx {
        return new XmlObjToDomCtx(null, element, obj, undefined, false, xmlns);
    }
}

class XmlObjToDomMapper implements m.IXmlContentPartModelVisitor<XmlObjToDomCtx, void> {
    
    private constructor() {
    }

    visitXmlElement(model: m.XmlElementModel, arg: XmlObjToDomCtx): void {
        // const containerType = arg.containingProperty?.modelTypeInfo.getTypeCtorInfo().ctor;
        const rawValue = arg.modelMatchedExplicitly || !model.property ? arg.obj : Reflect.get(arg.obj, model.property.name); // TODO validate object type everywhere maybe
        if (rawValue) {
            const values = isArray(rawValue) ? rawValue : [rawValue];
            for (const value of values) {
                const pp = arg.getPrefixFor(model);
                const prefix = pp.prefix.length > 0 ? pp.prefix + ':' : '';
                const element = arg.element.ownerDocument.createElementNS(arg.element.namespaceURI, prefix + model.elementName);
                arg.element.appendChild(element);
                this.fillElement(model, pp.ctx.enter(element, value, model.property));
            }
        }
    }
    visitXmlAnyElement(model: m.XmlElementAnyModel, arg: XmlObjToDomCtx): void {
        throw new Error("Method not implemented.");
    }
    visitXmlAllGroup(model: m.XmlElementAllGroupModel, arg: XmlObjToDomCtx): void {
        throw new Error("Method not implemented.");
    }
    visitXmlSequenceGroup(model: m.XmlElementSequenceGroupModel, arg: XmlObjToDomCtx): void {
        let ctx = arg;
        if (model.property && arg.containingProperty !== model.property) {
            const groupObj = Reflect.get(arg.obj, model.property.name);
            if (groupObj) {
                ctx = arg.enter(arg.element, groupObj, model.property);
            } else {
                return;
            }
        } 

        for (const part of model.parts) {
            this.visit(part, ctx);
        }
    }
    visitXmlChoiceGroup(model: m.XmlElementChoiceGroupModel, arg: XmlObjToDomCtx): void {
        if (!model.property) {
            throw new Error('Invalid choice content model');
        }
            
        const rawValue = Reflect.get(arg.obj, model.property.name);
        const value = isArray(rawValue) ? rawValue : [rawValue];

        for (const item of value) {
            if (item) {
                if (item.constructor) {
                    const part = model.parts.find(p => (p instanceof m.XmlElementModel || p instanceof m.XmlElementSequenceGroupModel) && p.typeCtor === item.constructor);
                    if (part) {
                        this.visit(part, arg.enter(arg.element, item, model.property, true));
                    } else {
                        throw new Error(`Unexpected part content ${item.constructor.name} at '${model.property.name}' of ${arg.obj.constructor.name}`);
                    }
                } else {
                    console.warn(`Unable to map ${item} due to missing constructor to classify it`);
                }
            }
        }
    }

    private visit(part: m.XmlElementPartModel, arg: XmlObjToDomCtx): void {
        part.apply(this, arg);
    }

    private fillElement(model: m.XmlElementModel, arg: XmlObjToDomCtx) {
        // arg =  // TODO namespace context seems fckd with attributes
        XmlObjToDomAttributeMapper.fillElementAttributes(model, arg);
        this.visit(model.content.getSequence(), arg);
    }

    public static mapElement(node: Element, obj: any, model: m.XmlElementModel, xmlns: XmlnsCtx) {
        new XmlObjToDomMapper().fillElement(model, XmlObjToDomCtx.initial(node, obj, xmlns));
    }

    visitXmlAttribute(model: m.XmlAttributeModel, arg: XmlObjToDomCtx): void { throw new Error("Method not implemented."); }
}

class XmlObjToDomAttributeMapper implements m.IXmlAttributeContentPartVisitor<XmlObjToDomCtx, XmlObjToDomCtx> {

    private static Instance = new XmlObjToDomAttributeMapper();

    private constructor() { 
    }

    visitXmlAttributeModel(attrModel: m.XmlAttributeModel, arg: XmlObjToDomCtx): XmlObjToDomCtx {
        const pp = arg.getPrefixFor(attrModel);
        arg = pp.ctx;
        const prefix = pp.prefix.length > 0 ? pp.prefix + ':' : '';
        const value = Reflect.get(arg.obj, attrModel.property.name);
        if ((value && !attrModel.defaultValue) || (attrModel.defaultValue && value !== attrModel.defaultValue)) {
            arg.element.setAttributeNS(attrModel.form.namespace, prefix + attrModel.attributeName, '' + value); // TODO sophisticated simpleTypes
        } else if (attrModel.required) {
            arg.element.setAttributeNS(attrModel.form.namespace, prefix + attrModel.attributeName, '');
        }
        return arg;
    }
    visitAttributeGroupModel(groupModel: m.XmlAttributeGroupModel, arg: XmlObjToDomCtx): XmlObjToDomCtx {
        const value  = Reflect.get(arg.obj, groupModel.property.name);
        if (value) {
            arg = this.visitAttrsContainer(groupModel, arg.enter(arg.element, value, groupModel.property)).exitPreserveXmlns();
        }
        return arg;
    }
    visitElementContentModel(elementContentModel: m.XmlElementContentModel, arg: XmlObjToDomCtx): XmlObjToDomCtx {
        return this.visitAttrsContainer(elementContentModel, arg);
    }

    private visitAttrsContainer(partModel: m.XmlAttrsContainerModel, arg: XmlObjToDomCtx): XmlObjToDomCtx {
        for (const groupModel of partModel.getAllAttributeParts()) {
            arg = this.visit(groupModel, arg);
        }    
        return arg;
    }

    private visit(part: m.IXmlAttributeContentPart, arg: XmlObjToDomCtx): XmlObjToDomCtx {
        return part.applyAttrContentPartVisitor(this, arg);
    }

    public static fillElementAttributes(model: m.XmlElementModel, ctx: XmlObjToDomCtx): XmlObjToDomCtx {
        return XmlObjToDomAttributeMapper.Instance.visit(model.content, ctx);
    }
}

//#endregion

const nsCtxByType = new Map<string, Map<DefaultCtor, m.XmlDataModel>>(); // TODO wtf

const resolveModelForType = (ns: string, elname: string, type: DefaultCtor) => { // rewrite it for correct namespace handling
    let  nsByType = nsCtxByType.get(ns);
    if (!nsByType) {
        nsByType = new Map<DefaultCtor, m.XmlDataModel>();
        nsCtxByType.set(ns, nsByType);
    } 

    let model = nsByType.get(type);
    if (!model) {
        model = m.XmlDataModel.makeForTypes(type);
        nsByType.set(type, model);
    }

    return model;
}

// function appendXmlnsDeclarationAttribute(element: Element, pp: XmlNsPrefixInfo) : void {
//     const attrName = pp.prefix.length > 0 ? ('xmlns:' + pp.prefix) : 'xmlns';
//     element.setAttribute(attrName, namespace);
// }

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

    const elementModel = nsModel.nsModel.findRootElement(nsModel.rootSpec.name, nsModel.rootSpec.namespace);
    if (!elementModel) {
        throw new Error('Unknown root element ' + nsModel.rootSpec.namespace + ':' + nsModel.rootSpec.name); 
    }

    const xmlns = XmlnsCtx.initial();
    const pp = xmlns.getPrefixFor(elementModel);
    const prefix = pp.prefix.length > 0 ? pp.prefix + ':' : '';
                
    var doc: Document;
    if (typeof(document) !== 'undefined') {
        doc = document.implementation.createDocument(nsModel.rootSpec.namespace, prefix + nsModel.rootSpec.name);
    } else {
        doc = new DOMImplementation().createDocument(nsModel.rootSpec.namespace, prefix + nsModel.rootSpec.name);
        if (!doc.documentElement) {
            doc.appendChild(doc.createElementNS(nsModel.rootSpec.namespace, prefix + nsModel.rootSpec.name));
        }
    }

    const xmlDeclaration = doc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
    doc.insertBefore(xmlDeclaration, doc.firstChild);
    
    XmlObjToDomMapper.mapElement(doc.documentElement, root, elementModel, pp.nsctx);

    const writer = new XMLSerializer();
    const xmlText = writer.serializeToString(doc);
    return xmlText;
};

const deserializeImpl = <CtorsT extends CtorOf<any>[]> (xml: string, ...type: CtorsT) : ConstructedType<ArrayElementType<CtorsT>> => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "application/xml");
    const rootElement = dom.documentElement;

    if (rootElement.localName === 'parsererror') {
        throw new Error(rootElement.innerText);
    }

    // const mapping = getRootMapping(rootElement, ... untype(type));
    // const root = mapping.instantiate(rootElement);
    const typeInfo = findModelTypeInfoByType(type[0]); // TODO other types probing
    if (!typeInfo) {
        throw new Error('Unknown XML model type ' + type[0].name); 
    }
    const root = typeInfo.getTypeCtorInfo().createInstance();

    const nsModel = resolveModelForType(rootElement.namespaceURI ?? '', rootElement.localName, root.constructor);
    const elementModel = nsModel.findRootElement(rootElement.localName, rootElement.namespaceURI ?? '');
    if (!elementModel) {
        throw new Error('Unknown root element ' + rootElement.namespaceURI + ':' + rootElement.localName); 
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
