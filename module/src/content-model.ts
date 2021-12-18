import { findModelTypeInfoByType, XmlModelItemReference, IXmlElementParameters, XmlModelTypeInfo, DefaultCtor, IXmlChoiceParameters, XmlModelPropertyInfo } from "./annotations";
import { firstOrDefault, isArrayInstanceOf } from "./utils";

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
        public readonly pattern?: string,
        public readonly maxLength?: number,
        public readonly minLength?: number
    ){
        super();
    }

    protected applyImpl<T, TRet>(visitor: IXmlValueModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitStringValue(this, arg); } 
}

export class XmlNumberValueModel extends XmlValueModel {
    public constructor(
        public readonly isInteger?: boolean,
        public readonly minValue?: number,
        public readonly maxValue?: number
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
        return `#element[:${model.elementName} @${model.propertyName}]`;
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
        return `${model.namespace}:@${model.attributeName}`;
    }
}

export abstract class XmlContentPartModel {

    public apply<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return this.applyImpl(visitor, arg); }

    protected abstract applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet;

    public toString() : string { return this.apply(XmlContentPartModelFormatter.Instance, null); }
}

export class XmlAttributeModel extends XmlContentPartModel {
    
    public constructor(
        public readonly propertyName: string,
        public readonly attributeName: string,
        public readonly namespace: string
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
    public addElement(propertyName: string, elementName: string, contentModel: XmlElementContentModel) { return this.registerPart(new XmlElementModel(elementName, propertyName, contentModel)); }
    public addChoiceGroup(propertyName: string) { return this.registerPart(new XmlElementChoiceGroupModel(propertyName)); }
    public addSequenceGroup() { return this.registerPart(new XmlElementSequenceGroupModel()); }
    public addAllGroup() { return this.registerPart(new XmlElementAllGroupModel()); }
}
export class XmlElementChoiceGroupModel extends XmlElementGroupModel {
    public constructor(
        public readonly propertyName
    ) {
        super();
    }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlChoiceGroup(this, arg); }
}
export class XmlElementSequenceGroupModel extends XmlElementGroupModel {
    private _typeCtor?: DefaultCtor;
    private _propertyName?: string;

    public constructor(
    ) {
        super();
    }

    public get typeCtor() { return this._typeCtor; }
    public get propertyName() { return this._propertyName; }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlSequenceGroup(this, arg); }

    public setModelInfo(propertyName: string, ctor: DefaultCtor) {
        this._propertyName = propertyName;
        this._typeCtor = ctor; 
    }
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
        public readonly id: number,
        private readonly part: XmlElementPartModel
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
        public readonly element: XmlElementModel
    ) {
        super(id, element);
    }
 
    protected override applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) { return visitor.visitConsumeNode(this, arg); }
}
export class XmlElementContentFsmConsumeAllNode extends XmlElementContentFsmNode {
    public constructor(
        id: number,
        part: XmlElementPartModel,
        public readonly elements: XmlElementModel[]
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
        public readonly counterId: number,
        public readonly operation: ContentFsmOperation
    ) {
        super(id, part);
    }

    protected override applyImpl<T, TRet>(visitor: IXmlElementContentFsmNodeVisitor<T, TRet>, arg: T) { return visitor.visitCountControlNode(this, arg); }
}
class ContentFsmFragment {
    public constructor(
        public readonly from: XmlElementContentFsmNode,
        public readonly to: XmlElementContentFsmNode
    ) {
    }
}
export class XmlElementContentFsm {
    public constructor(
        private readonly _nodes: XmlElementContentFsmNode[],
        private readonly _fragment: ContentFsmFragment
    ) {
    }

    public get nodes() : ReadonlyArray<XmlElementContentFsmNode> { return this._nodes; }

    public get start() : XmlElementContentFsmNode { return this._fragment.from; }
    public get end() : XmlElementContentFsmNode { return this._fragment.to; }
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

    public getAttributes() : ReadonlyArray<XmlAttributeModel> {
        return Array.from(this._attrs.values());
    }

    public getFsm() {
        if (!this._fsm) {
            this._fsm = XmlElementContentFsmBuilder.buildFsm(this._sequence);
        }
        return this._fsm;
    }

    public getSequence() {
        return this._sequence;
    }

    public findAttributeByLocalName(elementName: string) : XmlAttributeModel|undefined {
        return this._attrs.get(elementName);
    }

    public registerAttribute(propertyName: string, elementName: string) : XmlAttributeModel {
        const attr = new XmlAttributeModel(propertyName, elementName, ''); // TODO: attribute namespace
        this._attrs.set(elementName, attr);
        return attr;
    }
}

export class XmlElementModel extends XmlElementPartModel {
    private _typeCtor: DefaultCtor;

    public constructor(
        public readonly elementName: string,
        public readonly propertyName: string,
        public readonly content: XmlElementContentModel
    ) {
        super();
    }

    public get typeCtor() { return this._typeCtor; }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlElement(this, arg); }

    public setTypeCtor(ctor: DefaultCtor) { this._typeCtor = ctor; }
}


export class XmlNamespaceModel {
    private _rootElementsByName = new Map<string, XmlElementModel>();
    private _complexTypesByCtor = new Map<Function, XmlElementContentModel>();

    public constructor(
        public readonly namespace: string
    ) {
    }

    public findRootElement(name: string) : XmlElementModel|undefined {
        return this._rootElementsByName.get(name);
    }

    private resolveComplexTypeModel(typeInfo: XmlModelTypeInfo) : XmlElementContentModel {
        let contentModel = this._complexTypesByCtor.get(typeInfo.getTypeCtorInfo().ctor);
        if (!contentModel) {
            this._complexTypesByCtor.set(typeInfo.getTypeCtorInfo().ctor, contentModel = new XmlElementContentModel());
            this.populatePartModel(contentModel, typeInfo);

            for (const rootSpec of typeInfo.getRootSpecs()) {
                const rootElement = new XmlElementModel(rootSpec.name ?? typeInfo.getName(), '', contentModel);
                this._rootElementsByName.set(rootElement.elementName, rootElement);
            }
        } else {
            // console.warn(`Reusing part model for ${typeInfo.getName()}`);
        }
        return contentModel;
    }

    private collectTypeProps(typeInfo: XmlModelTypeInfo) {
        const allProps = [typeInfo.getProps()];
        
        let baseType = typeInfo.getTypeCtorInfo().getBaseType();
        while (baseType) {
            const baseTypeInfo = findModelTypeInfoByType(baseType);
            if (baseTypeInfo) {
                allProps.push(baseTypeInfo.getProps());
                baseType = baseTypeInfo.getTypeCtorInfo().getBaseType();
            }
        }

        const maxPropsPerType = Math.max(... allProps.map(pp => pp.length));
        const orderStep = Math.pow(10, ('' + maxPropsPerType).length);

        allProps.reverse();
        const result = allProps.flatMap((pp, n) => pp.map(p => ({ 
            prop: p, order: (firstOrDefault(p.getChoiceEntries())?.order
                          ?? firstOrDefault(p.getElements())?.order 
                          ?? firstOrDefault(p.getElementsGroupEntries())?.order 
                          ?? firstOrDefault(p.getTextEntries())?.order 
                          ?? 0) + n * orderStep
        })));
        result.sort((a, b) => a.order - b.order)

        // console.warn('props of ' + typeInfo.getTypeCtorInfo().ctor.name);
        // result.forEach(p => console.warn(`    ${p.order}: ${p.prop.name}`));
        // console.warn('');

        return result;
    }

    private populatePartModel(part: XmlElementContentModel|XmlElementSequenceGroupModel, typeInfo: XmlModelTypeInfo) : void {
        // console.warn(`Preparing part model for ${typeInfo.getName()}`);

        const partSequence = part instanceof XmlElementContentModel ? part.getSequence() : part;
        const props = this.collectTypeProps(typeInfo);
        for (const prop of props.map(p => p.prop)) {
            if (part instanceof XmlElementContentModel) {
                for (const attr of Array.from(prop.getAttributes())) {
                    part.registerAttribute(prop.name, attr.name ?? prop.name);
                }
            }

            const choiceSpecs = prop.getChoiceEntries();
            if (choiceSpecs.length > 1) {
                throw new Error(`Invalid XML content model: multiple choice declarations found at property '${prop.name}' of type '${typeInfo.getName()}'`);
            }
            const choiceSpec = choiceSpecs.length == 0 ? undefined : (<Required<IXmlChoiceParameters>>{ 
                order: choiceSpecs[0].order ?? 1,
                minOccurs: choiceSpecs[0].minOccurs ?? 1,
                maxOccurs: choiceSpecs[0].maxOccurs ?? 1
            });
            const choice = choiceSpec ? partSequence.addChoiceGroup(prop.name) : undefined;
            choice?.setOccurences(choiceSpec?.minOccurs, choiceSpec?.maxOccurs);
            
            const containerModel = choice ? choice : partSequence;

            // // // type XmlElementParamsWithOrder = Required<Pick<IXmlElementParameters, 'order'>> & Omit<IXmlElementParameters, 'order'>;
            // // const elts = Array.from(prop.getElements())
            // //                   //.filter((x): x is XmlElementParamsWithOrder => !!x.order)
            // //                   .filter((x): x is IXmlElementParameters & { order: number} => !!x.order)
            // //                   .sort((a, b) => a.order - b.order);
            for (const er of prop.getElements()) {
                let ctmodel: XmlElementContentModel|undefined;
                let typeRef: DefaultCtor|undefined;
                if (er.type?.ctor) {
                    typeRef = er.type.ctor();

                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    ctmodel = this.resolveComplexTypeModel(elTypeInfo);
                }

                if (ctmodel) {
                    const emodel = containerModel.addElement(prop.name, er.name ?? prop.name, ctmodel);
                    emodel.setOccurences(er.minOccurs, er.maxOccurs);

                    if (typeRef) {
                        emodel.setTypeCtor(typeRef); // TODO move it to XmlElementContentModel
                    }
                }
            }

            for (const eg of prop.getElementsGroupEntries()) {
                const smodel = containerModel.addSequenceGroup();
                smodel.setOccurences(eg.minOccurs, eg.maxOccurs);

                if (eg.ctor) {
                    const typeRef = eg.ctor();
                    smodel.setModelInfo(prop.name, typeRef);

                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    this.populatePartModel(smodel, elTypeInfo);
                }
            }

            for (const ag of prop.getAttrGroupEntries()) {
                if (ag.ctor) {
                    const typeRef = ag.ctor();
                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    this.populatePartModel(part, elTypeInfo);
                }
            }

            for (const t of prop.getTextEntries()) {
                console.warn('Text node handling not implemented');
            }
        }
    }

    public static makeForType(type: DefaultCtor, ns?: string) : XmlNamespaceModel {
        const model = new XmlNamespaceModel(ns ?? '');
        const typeInfo = findModelTypeInfoByType(type);
        // typeInfo.isMatchRootElement(new XmlModelItemReference());

        if (!typeInfo) {
            throw new Error('Unknown XML model type ' + type.name);
        }

        model.resolveComplexTypeModel(typeInfo);

        return model;
    }
}




