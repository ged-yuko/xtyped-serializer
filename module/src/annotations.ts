
//#region metamodel

//export type MyConstructor = new(...args: Array<any>) => any;

export type AnyCtor = new (...args: any[]) => any;
export type AnyCtorOf<T> = new (...args: any[]) => T;
export type CtorOf<T> = new() => T;
export type DefaultCtor = new() => any;
/*
export interface ICtor<T> {
    new(): T;
}

export interface IDefaultCtor {
    new(): any;
}

*/

export interface IXmlModelItemReference {
    readonly name?: string;
    readonly namespace?: string;
}

export interface IXmlModelTypeReference {
    readonly name?: string;
    readonly namespace?: string;
    readonly ctor?: () => DefaultCtor
}

export interface IXmlPartOccurenceParameters {
    readonly order?: number;
    readonly minOccurs?: number;
    readonly maxOccurs?: number|'unbounded';
}

export interface IXmlRootParameters extends IXmlModelItemReference {
    readonly attributeQualified?: boolean,
    readonly elementQualified?: boolean,
    readonly preferredPrefix?: string;
}

export interface IXmlAttributeParameters extends IXmlModelItemReference {
    readonly type?: IXmlModelTypeReference;
    readonly default?: any;
    readonly required?: boolean;
    readonly qualified?: boolean;
    readonly preferredPrefix?: string;
}

export interface IXmlElementParameters extends IXmlModelItemReference, IXmlPartOccurenceParameters {
    readonly type?: IXmlModelTypeReference;
    readonly qualified?: boolean;
    readonly preferredPrefix?: string;
}

export interface IXmlComplexTypeParameters extends IXmlModelItemReference {
    readonly baseType?: IXmlModelTypeReference;
}
export interface IXmlAbstractComplexTypeParameters extends IXmlModelItemReference {
    readonly baseType?: IXmlModelTypeReference;
}

export interface IXmlSimpleTypeParameters extends IXmlModelItemReference {
    readonly baseType?: IXmlModelTypeReference;
}

export interface IXmlAttributeGroupParameters extends IXmlModelItemReference {
}

export interface IXmlAttributeGroupEntryParameters extends IXmlModelTypeReference {
}

export interface IXmlElementsGroupParameters extends IXmlModelItemReference {
}

export interface IXmlElementsGroupEntryParameters extends IXmlModelTypeReference, IXmlPartOccurenceParameters {
}

export interface IXmlChoiceParameters extends IXmlPartOccurenceParameters {
}

export interface IXmlTextParameters {
    readonly order?: number;
}

export interface IXmlIgnoreParameters {
}

export enum XmlNodeAssociationKind {
    AnyNode,
    Element,
    Attribute,
    Text
}

export class XmlModelItemReference {
    public constructor(
        public readonly name: string,
        public readonly namespace?: string
    ) { 
    }

    public equals(other: XmlModelItemReference) : boolean {
        return this.name === other.name && (
            (!this.namespace && !other.namespace) || this.namespace === other.namespace
        );
    }

    public static from(n: Node) : XmlModelItemReference {
        if (n instanceof Attr) {
            return new XmlModelItemReference(n.localName, n.namespaceURI ?? undefined);
        } else if (n instanceof Element) {
            return new XmlModelItemReference(n.localName, n.namespaceURI ?? undefined);
        } else {
            throw new Error(`Cannot create model item reference from ${n.constructor}:${n}`);
        }
    }
}

export class XmlModelPropertyInfo {
    
    private _enumerationValues = new Array<Map<string, any>>();
    private _attributeSpec = new Array<IXmlAttributeParameters>();
    private _elementSpec = new Array<IXmlElementParameters>();
    private _attrGroupEntrySpec = new Array<IXmlElementsGroupEntryParameters>();
    private _elementsGroupEntrySpec = new Array<IXmlElementsGroupEntryParameters>();
    private _choiceEntrySpec = new Array<IXmlChoiceParameters>();
    private _textEntrySpec = new Array<IXmlTextParameters>();
    private _ignoreSpec = new Array<IXmlIgnoreParameters>();
    private _associateWithNode?: XmlNodeAssociationKind;

    public constructor(
        public readonly modelTypeInfo: XmlModelTypeInfo,
        public readonly name: string,
    ) {
    }
    
    public getEnumerationValues() : ReadonlyArray<ReadonlyMap<string, any>> { return this._enumerationValues; }
    public getAttributes() : ReadonlyArray<IXmlAttributeParameters> { return this._attributeSpec; }
    public getElements() : ReadonlyArray<IXmlElementParameters> { return this._elementSpec; }
    public getAttrGroupEntries() : ReadonlyArray<IXmlAttributeGroupEntryParameters> { return this._attrGroupEntrySpec; }
    public getElementsGroupEntries() : ReadonlyArray<IXmlElementsGroupEntryParameters> { return this._elementsGroupEntrySpec; }
    public getChoiceEntries() : ReadonlyArray<IXmlChoiceParameters> { return this._choiceEntrySpec; }
    public getTextEntries() : ReadonlyArray<IXmlTextParameters> { return this._textEntrySpec; }
    public getIgnore() : ReadonlyArray<IXmlIgnoreParameters> { return this._ignoreSpec; }
    public isConfiguredAsNode() : XmlNodeAssociationKind|undefined { return this._associateWithNode; }

    public registerEnumerationValues(entries: Map<string, any>) : void {
        this._enumerationValues.push(entries);
    }
    public configureAttribute(params: IXmlAttributeParameters) : void {
        this._attributeSpec.push(params);
    }
    public configureElement(params: IXmlElementParameters) : void {
        this._elementSpec.push(params);
    }
    public configureAttributeGroupEntry(params: IXmlAttributeGroupEntryParameters) : void {
        this._attrGroupEntrySpec.push(params);
    }
    public configureElementsGroupEntry(params: IXmlElementsGroupEntryParameters) : void {
        this._elementsGroupEntrySpec.push(params);
    }
    public configureChoiceEntry(params: IXmlChoiceParameters) : void {
        this._choiceEntrySpec.push(params);
    }
    public configureTextEntry(params: IXmlTextParameters) : void {
        this._textEntrySpec.push(params);
    }
    public configureIgnored(params: IXmlIgnoreParameters) : void {
        this._ignoreSpec.push(params);
    }
    public configureAsNode(nodeKind: XmlNodeAssociationKind) : void {
        this._associateWithNode = nodeKind;
    }
}

export class XmlModelTypeCtorInfo {
    private _base: Function;

    public constructor(
        public readonly ctor: Function
    ) {
        this._base = XmlModelTypeCtorInfo.getBaseType(ctor);
    }

    private static getBaseType(ctor: Function) : Function {
        // seems Object.getPrototypeOf(C)
        //    or Object.getPrototypeOf(C.prototype).constructor
        //    would be correct
        return Object.getPrototypeOf(ctor.prototype)?.constructor;
    }

    public getBaseType() : Function|null {
        const base = this._base;
        return (base && (base !== {}.constructor)) ? base : null;
    }
    
    public createInstance() : any {
        throw new Error(`Unable to create instance of ${this.ctor.name}`);
    }
}
class XmlModelConcreteTypeCtorInfo extends XmlModelTypeCtorInfo{
    private _ctor: DefaultCtor;

    public constructor(
        ctor: DefaultCtor
    ) {
        super(ctor);
        this._ctor = ctor;
    }

    public override createInstance() : any {
        const ctor = this._ctor;
        return new ctor();
    }
}

export class XmlModelTypeInfo {
    private _ctorInfo: XmlModelTypeCtorInfo;
    private _name: string;
    private _rootSpecs = new Array<IXmlRootParameters>();
    private _complexTypeSpecs = new Array<IXmlComplexTypeParameters>();
    private _abstractComplexTypeSpecs = new Array<IXmlComplexTypeParameters>();
    private _simpleTypeSpecs = new Array<IXmlSimpleTypeParameters>();
    // private _includeTypes = new Array<()=>ICtor<any>>();
    private _attrGroupSpecs = new Array<IXmlAttributeGroupParameters>();

    private _propsByName = new Map<string, XmlModelPropertyInfo>();
    private _allProps = new Array<XmlModelPropertyInfo>();

    public constructor(ctorInfo: XmlModelTypeCtorInfo) {
        this._ctorInfo = ctorInfo;
        this._name = ctorInfo.ctor.name;
    }

    public getName() : string { return this._name; }
    public getRootSpecs() : ReadonlyArray<IXmlRootParameters> { return this._rootSpecs; }
    public getComplexTypes() : ReadonlyArray<IXmlComplexTypeParameters> { return this._complexTypeSpecs; }
    public getAbstractComplexTypes() : ReadonlyArray<IXmlAbstractComplexTypeParameters> { return this._abstractComplexTypeSpecs; }
    public getSimpleTypes() : ReadonlyArray<IXmlSimpleTypeParameters> { return this._simpleTypeSpecs; }
    // public getIncludes() : ReadonlyArray<IDefaultCtor> { return this._includeTypes.map(t => t()); }
    public getProps() : ReadonlyArray<XmlModelPropertyInfo> { return this._allProps; }

    private getPropertyInfoByName(name: string) : XmlModelPropertyInfo {
        let info = this._propsByName.get(name);
        if (info === undefined) {
            this._propsByName.set(name, info = new XmlModelPropertyInfo(this, name));
            this._allProps.push(info);
        }
        return info;
    }

    public registerRootInfo(params: IXmlRootParameters) : void {
        this._rootSpecs.push(params);
    }  
    public registerComplexTypeInfo(params: IXmlComplexTypeParameters) : void {
        this._complexTypeSpecs.push(params);
    }
    public registerAbstractComplexTypeInfo(params: IXmlAbstractComplexTypeParameters) : void {
        this._abstractComplexTypeSpecs.push(params);
    }
    public registerSimpleTypeInfo(params: IXmlSimpleTypeParameters) : void {
        this._simpleTypeSpecs.push(params);
    }
    // public registerIncludeType(ctorSrc: ()=>ICtor<any>) {
    //     this._includeTypes.push(ctorSrc);
    // }
    public registerEnumerationValues(propertyKey: string, entries: Map<string, any>): void  {
        this.getPropertyInfoByName(propertyKey).registerEnumerationValues(entries);
    }
    public registerAttributeGroupInfo(params: IXmlAttributeGroupParameters) : void {
        this._attrGroupSpecs.push(params);
    }
    public registerElementsGroupInfo(params: IXmlElementsGroupParameters) : void {
        this._attrGroupSpecs.push(params);
    }
    
    public registerPropertyAsAttribute(propertyKey: string, params: IXmlAttributeParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureAttribute(params);
    }
    public registerPropertyAsElement(propertyKey: string, params: IXmlElementParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureElement(params);
    }
    public registerPropertyAsAttributesGroupEntry(propertyKey: string, params: IXmlAttributeGroupEntryParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureAttributeGroupEntry(params);
    }
    public registerPropertyAsElementsGroupEntry(propertyKey: string, params: IXmlElementsGroupEntryParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureElementsGroupEntry(params);
    }
    public registerPropertyAsChoiceEntry(propertyKey: string, params: IXmlChoiceParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureChoiceEntry(params);
    }
    public registerPropertyAsTextEntry(propertyKey: string, params: IXmlTextParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureTextEntry(params);
    }
    public registerPropertyAsIgnored(propertyKey: string, params: IXmlIgnoreParameters) : void {
        this.getPropertyInfoByName(propertyKey).configureIgnored(params);
    }
    public registerPropertyAsNode(propertyKey: string, nodeKind: XmlNodeAssociationKind) : void {
        this.getPropertyInfoByName(propertyKey).configureAsNode(nodeKind);
    }

    public getTypeCtorInfo() : XmlModelTypeCtorInfo {
        return this._ctorInfo;
    }
}

class XmlModelTypeInfoRegistry {
    
    private static readonly _knownModelTypesByCtor = new Map<Function, XmlModelTypeInfo>();

    public static findByCtor(ctor: Function) {
        return XmlModelTypeInfoRegistry._knownModelTypesByCtor.get(ctor);
    }
    
    private static getByCtorOrCreate(ctor: Function, f: () => XmlModelTypeInfo) : XmlModelTypeInfo {
        let info = XmlModelTypeInfoRegistry._knownModelTypesByCtor.get(ctor);
        if (info === undefined) {
            XmlModelTypeInfoRegistry._knownModelTypesByCtor.set(ctor, info = f());
        }
        return info;
    }

    public static getAbstractModelTypeInfoByCtor(ctor: Function) : XmlModelTypeInfo {
        return XmlModelTypeInfoRegistry.getByCtorOrCreate(ctor, () => new XmlModelTypeInfo(new XmlModelTypeCtorInfo(ctor)));
    }

    public static getModelTypeInfoByCtor(ctor: DefaultCtor) : XmlModelTypeInfo {
        return XmlModelTypeInfoRegistry.getByCtorOrCreate(ctor, () => new XmlModelTypeInfo(new XmlModelConcreteTypeCtorInfo(ctor)));
    }
}

export function findModelTypeInfoByType(ctor: Function) : XmlModelTypeInfo|undefined {
    return XmlModelTypeInfoRegistry.findByCtor(ctor);
}
export function findModelTypeInfoByObjType(o: any) : XmlModelTypeInfo|undefined {
    return XmlModelTypeInfoRegistry.findByCtor(o.constructor);
}

// annotations {

    //function XmlRoot<T extends { new (...args: any[]): {} }>(constructor: T) {
export function XmlRoot(params?: IXmlRootParameters) {
    return function (constructor: DefaultCtor) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerRootInfo(params ?? { });
    }
}
export function XmlAbstractComplexType(params?: IXmlAbstractComplexTypeParameters) {
    return function (constructor: Function) : void {
        XmlModelTypeInfoRegistry.getAbstractModelTypeInfoByCtor(constructor).registerAbstractComplexTypeInfo(params ?? { });
    }
}
export function XmlComplexType(params?: IXmlComplexTypeParameters) {
    return function (constructor: DefaultCtor) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerComplexTypeInfo(params ?? { });
    }
}
// export function XmlInclude(...types: (()=>ICtor<any>)[]) {
//     return function (constructor: DefaultCtor) : void {
//         types.forEach(t => {
//             XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerIncludeType(t);
//         });
//     }
// }
export function XmlAttribute(params?: IXmlAttributeParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsAttribute(propertyKey, params ?? { });
    }
}
export function XmlElement(params?: IXmlElementParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsElement(propertyKey, params ?? { });
    }
}

export function XmlSimpleType(params?: IXmlSimpleTypeParameters) {
    return function (constructor: DefaultCtor) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerSimpleTypeInfo(params ?? { });
    }
}

export function XmlEnumerationValues<E extends Record<Extract<keyof E, any>, any>>(enumType: E) {
    return function(target: any, propertyKey: string) : void {

        const entries = new Map<string, any>();
        for (const [k, v] of Object.entries(enumType)) {
            entries.set(k, v);
        }

        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerEnumerationValues(propertyKey, entries);
    }
}

export function XmlAttributesGroup(params?: IXmlAttributeGroupParameters) {
    return function (constructor: DefaultCtor) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerAttributeGroupInfo(params ?? { });
    }
}
export function XmlAttributesGroupEntry(params?: IXmlAttributeGroupEntryParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsAttributesGroupEntry(propertyKey, params ?? { });
    }
}
export function XmlElementsGroup(params?: IXmlElementsGroupParameters) {
    return function (constructor: DefaultCtor) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(constructor).registerElementsGroupInfo(params ?? { });
    }
}
export function XmlElementsGroupEntry(params?: IXmlElementsGroupEntryParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsElementsGroupEntry(propertyKey, params ?? { });
    }
}
export function XmlChoice(params?: IXmlChoiceParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsChoiceEntry(propertyKey, params ?? { });
    }
}
export function XmlText(params?: IXmlTextParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsTextEntry(propertyKey, params ?? { });
    }
}
export function XmlIgnore(params?: IXmlIgnoreParameters) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsIgnored(propertyKey, params ?? { });
    }
}
export function XmlNode(nodeKind?: XmlNodeAssociationKind) {
    return function(target: any, propertyKey: string) : void {
        XmlModelTypeInfoRegistry.getModelTypeInfoByCtor(target.constructor).registerPropertyAsNode(propertyKey, nodeKind ?? XmlNodeAssociationKind.AnyNode);
    }
}


// } annotations

//#endregion
