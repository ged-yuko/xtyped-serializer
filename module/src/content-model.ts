import { findModelTypeInfoByType, XmlModelTypeInfo, DefaultCtor, IXmlChoiceParameters, IXmlAttributeParameters, IXmlElementParameters, XmlModelPropertyInfo } from "./annotations";
import { collectTree, firstOrDefault, IndentedStringBuilder, isArrayInstanceOf, splitArrayByType } from "./utils";

export class XmlContextInfo {
    public constructor(
        public readonly namespace: string,
        public readonly attributeQualified: boolean,
        public readonly elementQualified: boolean,
        public readonly preferredPrefix?: string
    ) {
    }

    public augment(
        namespace?: string,
        attributeQualified?: boolean,
        elementQualified?: boolean,
        preferredPrefix?: string
    ): XmlContextInfo {
        return new XmlContextInfo(
            namespace ?? this.namespace,
            attributeQualified ?? this.attributeQualified,
            elementQualified ?? this.elementQualified,
            preferredPrefix ?? this.preferredPrefix
        );
    }

    public forAttribute(params: IXmlAttributeParameters) : XmlPartFormInfo {
        return new XmlPartFormInfo(
            params.namespace ?? this.namespace,
            params.qualified ?? this.attributeQualified,
            params.preferredPrefix ?? this.preferredPrefix
        );
    }

    public forElement(params: IXmlElementParameters) : XmlPartFormInfo {
        return new XmlPartFormInfo(
            params.namespace ?? this.namespace,
            params.qualified ?? this.elementQualified,
            params.preferredPrefix ?? this.preferredPrefix
        );
    }
    
    public toString(): string {
        return `{${this.namespace}}`;
    }

    public equals(other: XmlContextInfo): boolean {
        return this.namespace === other.namespace
            && this.attributeQualified === other.attributeQualified
            && this.elementQualified === other.elementQualified;
    }
}
export class XmlPartFormInfo {
    public constructor(
        public readonly namespace: string,
        public readonly qualified: boolean,
        public readonly preferredPrefix?: string
    ) {
    }
}
export interface IXmlContentPart {
    form: XmlPartFormInfo;    
}

export interface IXmlAttributeContentPartVisitor<T, TRet> {
    visitElementContentModel(elementContentModel: XmlElementContentModel, arg: T): TRet;
    visitXmlAttributeModel(attrModel: XmlAttributeModel, arg: T): TRet;
    visitAttributeGroupModel(groupModel: XmlAttributeGroupModel, arg: T): TRet;
}
export interface IXmlAttributeContentPart {
    applyAttrContentPartVisitor<T, TRet>(visitor: IXmlAttributeContentPartVisitor<T, TRet>, arg: T): TRet;
}

export interface IXmlValueModelVisitor<T, TRet> {
    visitNumberValue(num: XmlNumberValueModel, arg: T): TRet;
    visitBooleanValue(bool: XmlBooleanValueModel, arg: T): TRet;
    visitStringValue(str: XmlStringValueModel, arg: T): TRet;
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

    private amount(model: XmlElementPartModel) {
        if (model.minOccurs === 1 && model.maxOccurs === 1) {
            return '';
        } else {
            return '[' + model.minOccurs + '..' + (model.maxOccurs === Number.MAX_SAFE_INTEGER ? '' : model.maxOccurs) + ']';
        }
    }

    visitXmlElement(model: XmlElementModel, arg: any): string {
        // return `${model.namespace}:${model.name}`;
        return `#element{${model.form.namespace}:${model.elementName} @${model.property?.name}${this.amount(model)}}`;
    }
    visitXmlAnyElement(model: XmlElementAnyModel, arg: any): string {
        return `#any{${this.amount(model)}}`;
    }
    visitXmlAllGroup(model: XmlElementAllGroupModel, arg: any): string {
        return `#all{of ${model.parts.length} subparts ${this.amount(model)}}`;
    }
    visitXmlSequenceGroup(model: XmlElementSequenceGroupModel, arg: any): string {
        return `#sequence{of ${model.parts.length} subparts ${model.property?.name ? `as ${model.typeCtor?.name} @${model.property?.name}` : ''}${this.amount(model)}}`;
    }
    visitXmlChoiceGroup(model: XmlElementChoiceGroupModel, arg: any): string {
        return `#choice{of ${model.parts.length} subparts ${model.property?.name ? `@${model.property?.name}` : ''}${this.amount(model)}}`;
    }
    visitXmlAttribute(model: XmlAttributeModel, arg: any): string {
        return `${model.form.namespace}:@${model.attributeName}`;
    }
}

class XmlContentPartModelCompleteFormatter implements IXmlContentPartModelVisitor<any, string> {

    public static Instance = new XmlContentPartModelCompleteFormatter();

    private constructor() {
    }

    private amount(model: XmlElementPartModel) {
        if (model.minOccurs === 1 && model.maxOccurs === 1) {
            return '';
        } else {
            return '[' + model.minOccurs + '..' + (model.maxOccurs === Number.MAX_SAFE_INTEGER ? '' : model.maxOccurs) + ']';
        }
    }

    visitXmlElement(model: XmlElementModel, arg: any): string {
        // return `${model.namespace}:${model.name}`;
        return `#element{${model.form.namespace}:${model.elementName} @${model.property?.name}${this.amount(model)}}`;
    }
    visitXmlAnyElement(model: XmlElementAnyModel, arg: any): string {
        return `#any{${this.amount(model)}}`;
    }
    visitXmlAllGroup(model: XmlElementAllGroupModel, arg: any): string {
        return `#all{of ${model.parts} subparts ${this.amount(model)} : ${model.parts.join(', ')}}`;
    }
    visitXmlSequenceGroup(model: XmlElementSequenceGroupModel, arg: any): string {
        return `#sequence{of ${model.parts} subparts ${model.property?.name ? `as ${model.typeCtor?.name} @${model.property?.name}` : ''}${this.amount(model)}: ${model.parts.join(', ')}}`;
    }
    visitXmlChoiceGroup(model: XmlElementChoiceGroupModel, arg: any): string {
        return `#choice{of ${model.parts} subparts ${model.property?.name ? `@${model.property?.name}` : ''}${this.amount(model)}: ${model.parts.join(', ')}}`;
    }
    visitXmlAttribute(model: XmlAttributeModel, arg: any): string {
        return `${model.form.namespace}:@${model.attributeName}`;
    }
}

export type XmlModelSubpartPropertyInfo = XmlModelPropertyInfo|undefined;

export abstract class XmlContentPartModel {

    public constructor(
        public readonly property: XmlModelSubpartPropertyInfo
    ) {
    }

    public apply<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return this.applyImpl(visitor, arg); }

    protected abstract applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet;

    public toString() : string { return this.apply(XmlContentPartModelFormatter.Instance, null); }
    public toStringComplete() : string { return this.apply(XmlContentPartModelCompleteFormatter.Instance, null); }
    public toStringDescribe() : string {
        return collectTree(<XmlContentPartModel>this, p => p instanceof XmlElementGroupModel ? p.parts : [], p => p.toString()); 
    }
}

export class XmlAttributeModel implements IXmlContentPart, IXmlAttributeContentPart {
    
    public constructor(
        public readonly property: XmlModelPropertyInfo,
        public readonly attributeName: string,
        public readonly form: XmlPartFormInfo,
        public readonly defaultValue: any|undefined,
        public readonly required: boolean
    ) {
    }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlAttribute(this, arg); }
    public applyAttrContentPartVisitor<T, TRet>(visitor: IXmlAttributeContentPartVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlAttributeModel(this, arg); }
}

export abstract class XmlElementPartModel extends XmlContentPartModel {
    private _maxOccurs: number = 1;
    private _minOccurs: number = 1;

    public constructor(
        property: XmlModelSubpartPropertyInfo
    ) {
        super(property);
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
    
    public constructor(
        propertyInfo: XmlModelSubpartPropertyInfo,
        public readonly containerContext: XmlElementContentModel
    ) {
        super(propertyInfo);
    }

    public get parts() { return this._parts; }

    private registerPart<T extends XmlElementPartModel>(part: T) : T {
        this._parts.push(part);
        return part;
    }

    public addElement(propInfo: XmlModelPropertyInfo, elementName: string, formInfo: XmlPartFormInfo, contentModel: XmlElementContentModel) {
        return this.registerPart(new XmlElementModel(propInfo, elementName, formInfo, contentModel)); 
    }
    public addChoiceGroup(propInfo: XmlModelPropertyInfo) {
        return this.registerPart(new XmlElementChoiceGroupModel(propInfo, this.containerContext)); 
    }
    public addSequenceGroup(propInfo: XmlModelPropertyInfo) { 
        return this.registerPart(new XmlElementSequenceGroupModel(propInfo, this.containerContext)); 
    }
    public addAllGroup(propInfo: XmlModelPropertyInfo) { 
        return this.registerPart(new XmlElementAllGroupModel(propInfo, this.containerContext)); 
    }
}
export class XmlElementChoiceGroupModel extends XmlElementGroupModel {
    public constructor(
        propertyInfo: XmlModelSubpartPropertyInfo,
        containerContext: XmlElementContentModel,
    ) {
        super(propertyInfo, containerContext);
    }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlChoiceGroup(this, arg); }
}
export class XmlElementSequenceGroupModel extends XmlElementGroupModel {
    private _typeCtor?: DefaultCtor;

    public constructor(
        propertyInfo: XmlModelSubpartPropertyInfo,
        containerContext: XmlElementContentModel
    ) {
        super(propertyInfo, containerContext);
    }

    public get typeCtor() { return this._typeCtor; }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlSequenceGroup(this, arg); }

    public setModelInfo(ctor: DefaultCtor) {
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

export abstract class XmlAttrsContainerModel {
    // private _partsByProp = new Map<string, XmlAttrsContainerModel>();
    private _allAttrParts = new Array<IXmlAttributeContentPart>();
    private _attrs = new Array<XmlAttributeModel>();
    private _groups = new Array<XmlAttributeGroupModel>();

    public constructor(
    ) {
    }

    public getAttributes() : ReadonlyArray<XmlAttributeModel> {
        // return Array.from(this._attrs.values());
        return this._attrs;
    }
    public getAttributeGroups() : ReadonlyArray<XmlAttributeGroupModel> {
        return this._groups;
    }
    public getAllAttributeParts() : ReadonlyArray<IXmlAttributeContentPart> {
        return this._allAttrParts;
    }

    public registerAttribute(propertyInfo: XmlModelPropertyInfo, elementName: string, formInfo: XmlPartFormInfo, defaultValue: any|undefined, required: boolean) : XmlAttributeModel {
        const attr = new XmlAttributeModel(propertyInfo, elementName, formInfo, defaultValue, required); // TODO: attribute namespace
        this._attrs.push(attr);
        this._allAttrParts.push(attr);
        return attr;
    }

    public registerAttrsGroup(propertyInfo: XmlModelPropertyInfo, typeCtor: DefaultCtor) : XmlAttributeGroupModel {
        const group = new XmlAttributeGroupModel(propertyInfo, typeCtor);
        this._groups.push(group);
        this._allAttrParts.push(group);
        return group;
    }
}

export class XmlAttributeGroupModel extends XmlAttrsContainerModel implements IXmlAttributeContentPart {
    public constructor(
        public readonly property: XmlModelPropertyInfo,
        public readonly typeCtor: DefaultCtor
    ) {
        super();
    }

    public applyAttrContentPartVisitor<T, TRet>(visitor: IXmlAttributeContentPartVisitor<T, TRet>, arg: T): TRet { return visitor.visitAttributeGroupModel(this, arg); }
}

export class XmlElementContentModel extends XmlAttrsContainerModel implements IXmlAttributeContentPart  {
    private _sequence: XmlElementSequenceGroupModel;
    private _isMixed = false;
    private _fsm: XmlElementContentFsm;

    public constructor() {
        super();
        this._sequence = new XmlElementSequenceGroupModel(undefined, this);
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

    public applyAttrContentPartVisitor<T, TRet>(visitor: IXmlAttributeContentPartVisitor<T, TRet>, arg: T): TRet { return visitor.visitElementContentModel(this, arg); }
}

export class XmlElementModel extends XmlElementPartModel implements IXmlContentPart {
    private _typeCtor: DefaultCtor;

    public constructor(
        propertyInfo: XmlModelSubpartPropertyInfo,
        public readonly elementName: string,
        public readonly form: XmlPartFormInfo,
        public readonly content: XmlElementContentModel
    ) {
        super(propertyInfo);
    }

    public get typeCtor() { return this._typeCtor; }

    protected applyImpl<T, TRet>(visitor: IXmlContentPartModelVisitor<T, TRet>, arg: T): TRet { return visitor.visitXmlElement(this, arg); }

    public setTypeCtor(ctor: DefaultCtor) { this._typeCtor = ctor; }
}

export class XmlDataModel {
    private _rootElementsByNsByName = new Map<string, Map<string, XmlElementModel>>();
    private _complexTypesByCtor = new Map<Function, XmlElementContentModel>();

    public constructor() {
    }

    public findRootElement(name: string, namespace?: string) : XmlElementModel|undefined {
        return this._rootElementsByNsByName.get(namespace ?? '')?.get(name);
    }

    private registerRootElement(model: XmlElementModel) {
        let elByName = this._rootElementsByNsByName.get(model.form.namespace);
        if (!elByName) {
            this._rootElementsByNsByName.set(model.form.namespace, elByName = new Map<string, XmlElementModel>());
        }
        elByName.set(model.elementName, model);
    }

    private registerRootElementIfNeeded(typeInfo: XmlModelTypeInfo, contentModel: XmlElementContentModel) : XmlContextInfo|undefined {
        const rootElements = typeInfo.getRootSpecs().map(
            rootSpec => ({ spec: rootSpec, ctx: new XmlContextInfo(rootSpec.namespace ?? '', rootSpec.attributeQualified ?? false, rootSpec.elementQualified ?? false, rootSpec.preferredPrefix) })
        ).map(
            s => ({ ctx: s.ctx, elmt: new XmlElementModel(undefined, s.spec.name ?? typeInfo.getName(), s.ctx.forElement(s.spec), contentModel) })
        );
        if (rootElements.length > 0) {
            const contextInfo = rootElements[0].ctx;
            if (rootElements.every(e => e.ctx.equals(contextInfo))) {
                rootElements.forEach(e => this.registerRootElement(e.elmt));
            } else {
                throw new Error(`Multinamespaced XML model types are not supported. Type '${typeInfo.getName()}' annotated as belonging to {${rootElements.map(e => `'${e.elmt.form.namespace}'`).join(', ')}} `);
            }
            return contextInfo;
        } else {
            return undefined;
        }
    }

    private resolveComplexTypeModel(typeInfo: XmlModelTypeInfo, currCtx?: XmlContextInfo) : XmlElementContentModel {
        let result = this._complexTypesByCtor.get(typeInfo.getTypeCtorInfo().ctor);
        if (!result) {
            const contentModel = result = new XmlElementContentModel();
            this._complexTypesByCtor.set(typeInfo.getTypeCtorInfo().ctor, contentModel);

            const rootCtx = this.registerRootElementIfNeeded(typeInfo, contentModel);
            if (rootCtx && currCtx && !rootCtx.equals(currCtx)) {
                throw new Error(`Multinamespaced XML model types are not supported. Type '${typeInfo.getName()}' annotated as belonging to ${rootCtx} and used in context of ${currCtx.namespace} at the same time.`);
            }

            const ctx = currCtx ?? rootCtx ?? new XmlContextInfo('', false, false, '');
            this.populateAttrsModel(contentModel, typeInfo, ctx);
            this.populatePartModel(contentModel, typeInfo, ctx);
            // console.warn(`Model of ${typeInfo.getName()}: ${contentModel.getSequence()}`)
        } else {
            // console.warn(`Reusing part model for ${typeInfo.getName()}`);
        }
        return result;
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

        // const sb = new IndentedStringBuilder();
        // sb.appendLine('props of ' + typeInfo.getTypeCtorInfo().ctor.name).push();
        // result.forEach(p => sb.appendLine(`    ${p.order}: ${p.prop.name}`));
        // sb.pop().appendLine();
        // console.warn(sb.stringify());

        return result;
    }

    private populateAttrsModel(part: XmlAttrsContainerModel, typeInfo: XmlModelTypeInfo, ctx: XmlContextInfo) {
        const baseType = typeInfo.getTypeCtorInfo().getBaseType();
        if (baseType) {
            const baseTypeInfo = findModelTypeInfoByType(baseType);
            if (!baseTypeInfo) {
                throw new Error('Unknown XML model type ' + baseType.name);
            }
            this.populateAttrsModel(part, baseTypeInfo, ctx);
        }

        for (const prop of typeInfo.getProps()) {
            for (const attr of prop.getAttributes()) {
                part.registerAttribute(prop, attr.name ?? prop.name, ctx.forAttribute(attr), attr.default, attr.required ?? false);
            }

            for (const ag of prop.getAttrGroupEntries()) {
                if (ag.ctor) {
                    const typeRef = ag.ctor();
                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    const group = part.registerAttrsGroup(prop, typeRef);
                    this.populateAttrsModel(group, elTypeInfo, ctx);
                }
            }
        }
    }

    private populatePartModel(part: XmlElementContentModel|XmlElementSequenceGroupModel, typeInfo: XmlModelTypeInfo, ctx: XmlContextInfo) : void {
        // console.warn(`Preparing part model for ${typeInfo.getName()}`);
        const partSequence = part instanceof XmlElementContentModel ? part.getSequence() : part;
        const props = this.collectTypeProps(typeInfo);
        for (const prop of props.map(p => p.prop)) {

            const choiceSpecs = prop.getChoiceEntries();
            if (choiceSpecs.length > 1) {
                throw new Error(`Invalid XML content model: multiple choice declarations found at property '${prop.name}' of type '${typeInfo.getName()}'`);
            }
            const choiceSpec = firstOrDefault(choiceSpecs);
            const choice = choiceSpec ? partSequence.addChoiceGroup(prop) : undefined;
            choice?.setOccurences(choiceSpec?.minOccurs, choiceSpec?.maxOccurs);
            
            const containerModel = choice ? choice : partSequence;

            for (const er of prop.getElements()) {
                let ctmodel: XmlElementContentModel|undefined;
                let typeRef: DefaultCtor|undefined;
                if (er.type?.ctor) {
                    typeRef = er.type.ctor();

                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    ctmodel = this.resolveComplexTypeModel(elTypeInfo, ctx.augment(er.type.namespace));
                } else {
                    ctmodel = new XmlElementContentModel();
                }

                if (ctmodel) {
                    const emodel = containerModel.addElement(prop, er.name ?? prop.name, ctx.forElement(er), ctmodel);
                    emodel.setOccurences(er.minOccurs, er.maxOccurs);

                    if (typeRef) {
                        emodel.setTypeCtor(typeRef); // TODO move it to XmlElementContentModel
                    }
                }
            }

            for (const eg of prop.getElementsGroupEntries()) {
                const smodel = containerModel.addSequenceGroup(prop);
                smodel.setOccurences(eg.minOccurs, eg.maxOccurs);

                if (eg.ctor) {
                    const typeRef = eg.ctor();
                    smodel.setModelInfo(typeRef);

                    const elTypeInfo = findModelTypeInfoByType(typeRef);
                    if (!elTypeInfo) {
                        throw new Error('Unknown XML model type ' + typeRef.name);
                    }
                    this.populatePartModel(smodel, elTypeInfo, ctx);
                }
            }

            for (const t of prop.getTextEntries()) {
                console.warn('Text node handling not implemented');
            }
        }
    }

    public static makeForTypes(...types: DefaultCtor[]) : XmlDataModel {
        const typesInfo = splitArrayByType(types.map(t => findModelTypeInfoByType(t) ?? t), XmlModelTypeInfo);
        
        if (typesInfo.rest.length > 0) {
            throw new Error('Unknown XML model types: ' + typesInfo.selected.map(t => t.getName()).join(', '));
        }

        const model = new XmlDataModel();
        for (const typeInfo of typesInfo.selected) {
            model.resolveComplexTypeModel(typeInfo);
        }

        return model;
    }
}
