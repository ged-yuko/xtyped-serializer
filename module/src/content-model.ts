import { findModelTypeInfoByType, XmlModelItemReference, IXmlElementParameters, XmlModelTypeInfo } from "./annotations";
import { isArrayInstanceOf } from "./util";

export interface IXmlValueModelVisitor<T, TRet> {
    visitNumberValue(arg0: XmlNumberValueModel, arg: T): TRet;
    visitBooleanValue(arg0: XmlBooleanValueModel, arg: T): TRet;
    visitStringValue(arg0: XmlStringValueModel, arg: T): TRet;
}

export abstract class XmlValueModel {
    public apply<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet { return this.applyImpl(visitor, arg); }

    protected abstract applyImpl<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet;

    public toString() : string { return JSON.stringify(this); }
}

export class XmlStringValueModel extends XmlValueModel{
    public constructor(
        public pattern?: string,
        public maxLength?: number,
        public minLength?: number
    ){
        super();
    }

    protected applyImpl<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitStringValue(this, arg); } 
}

export class XmlNumberValueModel extends XmlValueModel {
    public constructor(
        public isInteger?: boolean,
        public minValue?: number,
        public maxValue?: number
    ) {
        super();
    }

    protected applyImpl<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitNumberValue(this, arg); } 
}

export class XmlBooleanValueModel extends XmlValueModel {
    protected applyImpl<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitBooleanValue(this, arg); } 
}


export interface IXmlContentPartModelVisitor<T, TRet> {
    visitXmlElement(model: XmlElementModel, arg: T) : TRet;
    visitXmlAnyElement(model: XmlElementAnyModel, arg: T) : TRet;
    visitXmlAllGroup(model: XmlElementAllGroupModel, arg: T) : TRet;
    visitXmlSequenceGroup(model: XmlElementSequenceGroupModel, arg: T) : TRet;
    visitXmlChoiceGroup(model: XmlElementChoiceGroupModel, arg: T) : TRet;
    visitXmlAttribute(model: XmlAttributeModel, arg: T) : TRet;
}

class XmlContentPartModelFormatter implements IXmlContentPartModelVisitor<any, string> {

    public static Instance = new XmlContentPartModelFormatter();

    private constructor() {
    }

    visitXmlElement(model: XmlElementModel, arg: any): string {
        // return `${model.namespace}:${model.name}`;
        return `#element[:${model.name}]`;
    }
    visitXmlAnyElement(model: XmlElementAnyModel, arg: any): string {
        return `#any[]`;
    }
    visitXmlAllGroup(model: XmlElementAllGroupModel, arg: any): string {
        return `#all[${model.parts.join(', ')}]`;
    }
    visitXmlSequenceGroup(model: XmlElementSequenceGroupModel, arg: any): string {
        return `#sequence[${model.parts.join(', ')}]`;
    }
    visitXmlChoiceGroup(model: XmlElementChoiceGroupModel, arg: any): string {
        return `#choice[${model.parts.join(', ')}]`;
    }
    visitXmlAttribute(model: XmlAttributeModel, arg: any): string {
        return `${model.namespace}:@${model.name}`;
    }
}

export abstract class XmlContentPartModel {

    public apply<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return this.applyImpl(visitor, arg); }

    protected abstract applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet;

    public toString() : string { return this.apply(XmlContentPartModelFormatter.Instance, null); }
}

export class XmlAttributeModel extends XmlContentPartModel {
    
    public constructor(
        public name: string,
        public namespace: string
    ) {
        super();
    }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlAttribute(this, arg); }
}

export abstract class XmlElementPartModel extends XmlContentPartModel {
    private _maxOccurs: number = 1;
    private _minOccurs: number = 1;

    public constructor() {
        super();
    }

    public get maxOccurs() : number { return this._maxOccurs; }
    public get minOccurs() : number { return this._minOccurs; }

    public setOccurences(min?: number, max?: number|'unbounded') {
        this._minOccurs = min ?? 1;
        this._maxOccurs = max === 'unbounded' ? Number.MAX_SAFE_INTEGER : max ?? 1;
    }
}
export abstract class XmlElementGroupModel extends XmlElementPartModel {
    private _parts = new Array<XmlElementPartModel>();
    
    public constructor() {
        super();
    }

    public get parts() { return this._parts; }

    private registerPart<T extends XmlElementPartModel>(part: T) : T {
        this._parts.push(part);
        return part;
    }
    public addElement(name: string) { return this.registerPart(new XmlElementModel(name)); }
    public addChoiceGroup() { return this.registerPart(new XmlElementChoiceGroupModel()); }
    public addSequenceGroup() { return this.registerPart(new XmlElementSequenceGroupModel()); }
    public addAllGroup() { return this.registerPart(new XmlElementAllGroupModel()); }
}
export class XmlElementChoiceGroupModel extends XmlElementGroupModel {
    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlChoiceGroup(this, arg); }
}
export class XmlElementSequenceGroupModel extends XmlElementGroupModel {
    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlSequenceGroup(this, arg); }
}
export class XmlElementAllGroupModel extends XmlElementGroupModel {
    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlAllGroup(this, arg); }
}
export class XmlElementAnyModel extends XmlElementPartModel {
    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlAnyElement(this, arg); }
}

export interface IXmlElementContentFsmNodeVisitor<T, TRet> {
    visitCountControlNode(node: XmlElementContentFsmCountControlNode, arg: T);
    visitConsumeAllNode(node: XmlElementContentFsmConsumeAllNode, arg: T);
    visitConsumeNode(node: XmlElementContentFsmConsumeNode, arg: T);
    visitSimpleNode(node: XmlElementContentFsmNode, arg: T): TRet;
}

export class XmlElementContentFsmNode {
    private _next = new Set<XmlElementContentFsmNode>();

    public constructor(
        public id: number,
        private part: XmlElementPartModel
    ) {
    }

    public get next() { return this._next; }
    public registerNext(node: XmlElementContentFsmNode) {
        if (this._next.has(node))
            throw new Error('Node already linked');

        this._next.add(node);
    }

    public apply<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) : TRet { return this.applyImpl(visitor, arg); }
    protected applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) : TRet { return visitor.visitSimpleNode(this, arg); }
}
export class XmlElementContentFsmConsumeNode extends XmlElementContentFsmNode {
    public constructor(
        id: number,
        public element: XmlElementModel
    ) {
        super(id, element);
    }
 
    protected override applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) { return visitor.visitConsumeNode(this, arg); }
}
export class XmlElementContentFsmConsumeAllNode extends XmlElementContentFsmNode {
    public constructor(
        id: number,
        part: XmlElementPartModel,
        public elements: XmlElementModel[]
    ) {
        super(id, part);
    }

    protected override applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) { return visitor.visitConsumeAllNode(this, arg); }
}
export enum ContentFsmOpKind {
    Push,
    Inc,
    Pop
}
export type ContentFsmOperation = {op:ContentFsmOpKind.Push}
                        | {op:ContentFsmOpKind.Inc}
                        | {op:ContentFsmOpKind.Pop, min: number, max: number};
export class XmlElementContentFsmCountControlNode extends XmlElementContentFsmNode {
    public constructor(
        id: number, part: XmlElementPartModel,
        public counterId: number,
        public operation: ContentFsmOperation
    ) {
        super(id, part);
    }

    protected override applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) { return visitor.visitCountControlNode(this, arg); }
}
class ContentFsmFragment {
    public constructor(
        public from: XmlElementContentFsmNode,
        public to: XmlElementContentFsmNode
    ) {
    }
}
export class XmlElementContentFsm {
    public constructor(
        private nodes: XmlElementContentFsmNode[],
        private fragment: ContentFsmFragment
    ) {
    }

    public get start() { return this.fragment.from; }
    public get end() { return this.fragment.to; }
}

class XmlElementContentFsmBuilder implements IXmlContentPartModelVisitor<any, ContentFsmFragment> {
    private _nodeIdCount = 0;
    private _counterIdCount = 0;    
    private _nodes = new Array<XmlElementContentFsmNode>();

    private constructor() {
    }

    private makeSimpleNode(part: XmlElementPartModel) { 
        return new XmlElementContentFsmNode(this._nodeIdCount++, part);
    }
    private makeElementNode(element: XmlElementModel) { 
        return new XmlElementContentFsmConsumeNode(this._nodeIdCount++, element); 
    }
    private makeAllElementsNode(group: XmlElementAllGroupModel) { 
        if (isArrayInstanceOf(group.parts, XmlElementModel)) {
            return new XmlElementContentFsmConsumeAllNode(this._nodeIdCount++, group, group.parts); 
        } else {
            throw new Error(`Invalid 'all' group. Parts here should only be simple elements.`);
        }
    }
    private makeCounterNode(part: XmlElementPartModel, operation: ContentFsmOperation) {
        return new XmlElementContentFsmCountControlNode(this._nodeIdCount++, part, this._counterIdCount++, operation); 
    }

    visitXmlElement(model: XmlElementModel, arg: any): ContentFsmFragment {
        const node = this.makeElementNode(model);
        return new ContentFsmFragment(node, node);
    }
    visitXmlAnyElement(model: XmlElementAnyModel, arg: any): ContentFsmFragment {
        throw new Error("visitXmlAnyElement not implemented.");
    }
    visitXmlAllGroup(model: XmlElementAllGroupModel, arg: any): ContentFsmFragment {
        const node = this.makeAllElementsNode(model);
        return new ContentFsmFragment(node, node);
    }
    visitXmlSequenceGroup(model: XmlElementSequenceGroupModel, arg: any): ContentFsmFragment {
        const fragment = new ContentFsmFragment(this.makeSimpleNode(model), this.makeSimpleNode(model));
        let curr = fragment.from;
        for (const part of model.parts) {
            var step = this.visitPart(part);
            curr.registerNext(step.from);
            curr = step.to;
        }
        curr.registerNext(fragment.to);
        return fragment;        
    }
    visitXmlChoiceGroup(model: XmlElementChoiceGroupModel, arg: any): ContentFsmFragment {
        const fragment = new ContentFsmFragment(this.makeSimpleNode(model), this.makeSimpleNode(model));
        for (const part of model.parts) {
            var step = this.visitPart(part);
            fragment.from.registerNext(step.from);
            step.to.registerNext(fragment.to);
        }
        return fragment;
    }

    visitPart(model: XmlElementPartModel, arg?: any): ContentFsmFragment {
        const step = model.apply(this, arg);

        if (model.minOccurs > model.maxOccurs || model.maxOccurs === 0) {
            throw new Error(`Invalid occurences specification`);
        }
        
        if (model.maxOccurs === 1) {
            if (model.minOccurs === 0) {
                const fragment = new ContentFsmFragment(this.makeSimpleNode(model), this.makeSimpleNode(model));

                fragment.from.registerNext(step.from);
                step.to.registerNext(fragment.to);
                fragment.from.registerNext(fragment.to);

                return fragment;
            } else if (model.minOccurs === 1) {
                return step;
            } else {
                throw new Error(`Invalid occurences specification`);
            }
        } else {
            const fragment = new ContentFsmFragment(this.makeSimpleNode(model), this.makeSimpleNode(model));

            const enter = this.makeCounterNode(model, { op: ContentFsmOpKind.Push });
            const inc = this.makeCounterNode(model, { op: ContentFsmOpKind.Inc });
            const exit = this.makeCounterNode(model, { op: ContentFsmOpKind.Pop, min: model.minOccurs, max: model.maxOccurs });

            fragment.from.registerNext(enter);
            enter.registerNext(step.from);
            step.to.registerNext(inc);
            inc.registerNext(step.from);
            inc.registerNext(exit);
            exit.registerNext(fragment.to);

            return fragment;
        }
    }

    public static buildFsm(model: XmlElementPartModel) : XmlElementContentFsm {
        const builder = new XmlElementContentFsmBuilder();
        const fragment = builder.visitPart(model);
        return new XmlElementContentFsm(builder._nodes, fragment);
    }

    visitXmlAttribute(model: XmlAttributeModel, arg: any): ContentFsmFragment { throw new Error("Method not implemented."); }
}

export class XmlElementContentModel {
    private _attrs = new Map<string, XmlAttributeModel>();
    private _sequence = new XmlElementSequenceGroupModel();
    private _isMixed = false;
    private _fsm: XmlElementContentFsm;

    public constructor() {
    }

    public get fsm() {
        if (!this._fsm) {
            this._fsm = XmlElementContentFsmBuilder.buildFsm(this._sequence);
        }
        return this._fsm;
    }

    public get sequence() {
        return this._sequence;
    }

    public findAttribute(name: string) : XmlAttributeModel|undefined {
        return this._attrs.get(name);
    }

    public registerAttribute(name: string) : XmlAttributeModel {
        console.warn('TODO: namespace');
        const attr = new XmlAttributeModel(name, ''); 
        this._attrs.set(name, attr);
        return attr;
    }
}

export class XmlElementModel extends XmlElementPartModel {
    private _content = new XmlElementContentModel();
    private _typeCtor: Function;

    public constructor(
        public name: string
    ) {
        super();
    }

    public get content() { return this._content; }
    public get typeCtor() { return this._typeCtor; }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlElement(this, arg); }

    public setTypeCtor(ctor: Function) { this._typeCtor = ctor; }
}


export class XmlNamespaceModel {
    private _rootElementsByName = new Map<string, XmlElementModel>();

    public constructor(
        public namespace: string
    ) {
    }

    public registerRootElement(name: string) : XmlElementModel {
        const el = new XmlElementModel(name);
        this._rootElementsByName.set(name, el);
        return el;
    }

    public findRootElement(name: string) : XmlElementModel|undefined {
        return this._rootElementsByName.get(name);
    }

    private static populateElementModel(el: XmlElementModel, typeInfo: XmlModelTypeInfo) : void {
        for (const prop of Array.from(typeInfo.getProps())) {
            for (const attr of Array.from(prop.getAttributes())) {
                el.content.registerAttribute(attr.name ?? prop.name);
            }

            // type XmlElementParamsWithOrder = Required<Pick<IXmlElementParameters, 'order'>> & Omit<IXmlElementParameters, 'order'>;
            const elts = Array.from(prop.getElements())
                              //.filter((x): x is XmlElementParamsWithOrder => !!x.order)
                              .filter((x): x is IXmlElementParameters & { order: number} => !!x.order)
                              .sort((a, b) => a.order - b.order);
            for (const er of elts) {
                const emodel = el.content.sequence.addElement(er.name ?? prop.name);
                if (er.type?.ctor) {
                    const typeRef = er.type.ctor();
                    emodel.setTypeCtor(typeRef);

                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }

                    this.populateElementModel(emodel, elTypeInfo);
                }
            }
        }
    }

    public static makeForType(type: Function, ns?: string) : XmlNamespaceModel {
        const model = new XmlNamespaceModel(ns ?? '');
        const typeInfo = findModelTypeInfoByType(type);
        // typeInfo.isMatchRootElement(new XmlModelItemReference());

        if (!typeInfo) {
            throw new Error('Unknown XML model type ' + type.name);
        }
        
        for (const ct of typeInfo.getRootSpecs()) {
            const el = model.registerRootElement(ct.name ?? typeInfo.getName());
            this.populateElementModel(el, typeInfo);
        }

        return model;
    }
}




