
//#region metamodel

export type MyConstructor = new(...args: Array<any>) => any;

export interface ICtor<T> {
    new(): T;
}

export interface IXmlModelItemReference {
    name?: string;
    namespace?: string;
}

export interface IXmlModelTypeReference {
    name?: string;
    namespace?: string;
    ctor?: () => IDefaultCtor
}

export interface IDefaultCtor {
    new(): any;
}

export interface IXmlAttributeParameters extends IXmlModelItemReference {
    type?: IXmlModelTypeReference|Function;
    typeName?: string;
}

export interface IXmlElementParameters extends IXmlModelItemReference {
    type?: IXmlModelTypeReference;
    order?: number;
    minOccurs?: number;
    maxOccurs?: number;
}

export interface IXmlComplexTypeParameters extends IXmlModelItemReference {
    isAbstract?: boolean;
    baseType?: IXmlModelTypeReference;
}

export interface IXmlSimpleTypeParameters extends IXmlModelItemReference {
    baseType?: IXmlModelTypeReference;
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

const _knownModelTypesByCtor = new Map<Function, XmlModelTypeInfo>();

class XmlModelAttributeRepresentationInfo {
    public constructor (
        public readonly name: string,
        public readonly params?: IXmlAttributeParameters
    ) {
    }
}

class XmlModelElementRepresentationInfo {
    public constructor (
        public readonly name: string,
        public readonly order: number,
        public readonly params?: IXmlElementParameters
    ) {
    }
}

export class XmlModelPropertyInfo {

    private _attributeSpec = new Array<IXmlAttributeParameters>();
    private _elementSpec = new Array<IXmlElementParameters>();

    public constructor(
        public readonly modelTypeInfo: XmlModelTypeInfo,
        public readonly name: string,
    ) {
    }

    public getAttributes() : ReadonlyArray<IXmlAttributeParameters> { return this._attributeSpec; }
    public getElements() : ReadonlyArray<IXmlElementParameters> { return this._elementSpec; }

    public configureAttribute(params: IXmlAttributeParameters) {
        this._attributeSpec.push(params);
    }

    public configureElement(params: IXmlElementParameters) {
        this._elementSpec.push(params);
    }
}

export class XmlModelTypeInfo {
    private _ctor: Function;
    private _name: string;
    private _rootSpecs = new Array<IXmlModelItemReference>();
    private _complexTypeSpecs = new Array<IXmlComplexTypeParameters>();
    private _simpleTypeSpecs = new Array<IXmlSimpleTypeParameters>();
    // private _includeTypes = new Array<()=>ICtor<any>>();
    private _propsByName = new Map<string, XmlModelPropertyInfo>();

    public constructor(ctor: Function) {
        this._ctor = ctor;
        this._name = ctor.name;
    }

    public getName() : string { return this._name; }
    public getRootSpecs() : ReadonlyArray<IXmlModelItemReference> { return this._rootSpecs; }
    public getComplexTypes() : ReadonlyArray<IXmlComplexTypeParameters> { return this._complexTypeSpecs; }
    public getSimpleTypes() : ReadonlyArray<IXmlSimpleTypeParameters> { return this._simpleTypeSpecs; }
    // public getIncludes() : ReadonlyArray<IDefaultCtor> { return this._includeTypes.map(t => t()); }
    public getProps() : IterableIterator<XmlModelPropertyInfo> { return this._propsByName.values(); }

    private getPopertyInfoByName(name: string) : XmlModelPropertyInfo {
        let info = this._propsByName.get(name);
        if (info === undefined) {
            this._propsByName.set(name, info = new XmlModelPropertyInfo(this, name));
        }
        return info;
    }

    public registerRootInfo(params: IXmlModelItemReference) {
        this._rootSpecs.push(params);
    }  
    public registerComplexTypeInfo(params: IXmlComplexTypeParameters) {
        this._complexTypeSpecs.push(params);
    }
    public registerSimpleTypeInfo(params: IXmlSimpleTypeParameters) {
        this._simpleTypeSpecs.push(params);
    }
    // public registerIncludeType(ctorSrc: ()=>ICtor<any>) {
    //     this._includeTypes.push(ctorSrc);
    // }
    
    public registerPropertyAsAttribute(propertyKey: string, params: IXmlAttributeParameters) {
        this.getPopertyInfoByName(propertyKey).configureAttribute(params);
    }
    public registerPropertyAsElement(propertyKey: string, params: IXmlElementParameters) {
        this.getPopertyInfoByName(propertyKey).configureElement(params);
    }

    public createInstance() : any {
        const ctor = <MyConstructor> this._ctor;
        return new ctor();
    }
}

function getModelTypeInfoByCtor(ctor: Function) : XmlModelTypeInfo {
    let info = _knownModelTypesByCtor.get(ctor);
    if (info === undefined) {
        _knownModelTypesByCtor.set(ctor, info = new XmlModelTypeInfo(ctor));
    }
    return info;
}

export function findModelTypeInfoByType(ctor: Function) : XmlModelTypeInfo|undefined {
    return _knownModelTypesByCtor.get(ctor);
}
export function findModelTypeInfoByObjType(o: any) : XmlModelTypeInfo|undefined {
    return _knownModelTypesByCtor.get(o.constructor);
}

// annotations {

    //function XmlRoot<T extends { new (...args: any[]): {} }>(constructor: T) {
export function XmlRoot(params?: IXmlModelItemReference) {
    return function (constructor: Function) : void {
        getModelTypeInfoByCtor(constructor).registerRootInfo(params ?? { });
    }
}
export function XmlComplexType(params?: IXmlComplexTypeParameters) {
    return function (constructor: Function) : void {
        getModelTypeInfoByCtor(constructor).registerComplexTypeInfo(params ?? { });
    }
}
// export function XmlInclude(...types: (()=>ICtor<any>)[]) {
//     return function (constructor: Function) : void {
//         types.forEach(t => {
//             getModelTypeInfoByCtor(constructor).registerIncludeType(t);
//         });
//     }
// }
export function XmlAttribute(params?: IXmlAttributeParameters) {
    return function(target: any, propertyKey: string) : void {
        getModelTypeInfoByCtor(target.constructor).registerPropertyAsAttribute(propertyKey, params ?? { });
    }
}
export function XmlElement(params?: IXmlElementParameters) {
    return function(target: any, propertyKey: string) : void {
        getModelTypeInfoByCtor(target.constructor).registerPropertyAsElement(propertyKey, params ?? { });
    }
}

export function XmlSimpleType(params?: IXmlSimpleTypeParameters) {
    return function (constructor: Function) : void {
        getModelTypeInfoByCtor(constructor).registerSimpleTypeInfo(params ?? { });
    }
}

export function XmlEnumerationValues<E extends Record<Extract<keyof E, any>, any>>(mapping: E) {
    return function(target: any, propertyKey: string) : void {
        // getModelTypeInfoByCtor(target.constructor).registerPropertyAsElement(propertyKey, elementName, order, params);

        for (const [k, v] of Object.entries(mapping)) {
            console.warn(k);
            console.warn(v);
        }

        console.error('TODO: simpletype - enumerations');
        // return ret;
    }
}

export function XmlAttributesGroup(params?: { name?: string, namespace?: string }) {
    return function (constructor: Function) : void {
        // ...
        console.error('TODO: XmlAttributeGroup');
    }
}
export function XmlAttributesGroupRef(groupType: ICtor<any>) {
    return function(target: any, propertyKey: string) : void{
        // ...
        console.error('TODO: XmlAttributeGroupRef');
    }
}
export function XmlElementsGroup(params?: { name?: string, namespace?: string }) {
    return function (constructor: Function) : void {
        // ...
        console.error('TODO: XmlElementsGroup');
    }
}


export function XmlArray(params: {order: number}) {
    return function(target: any, propertyKey: string) : void {
        // getModelTypeInfoByCtor(target.constructor).registerPropertyAsElement(propertyKey, order, elementName, ns);
        console.error('TODO: XmlArray');
    }
}
/*
export function XmlArrayItem(elementName?: string, ns?: string, nestingLevel: number) {
    return function(target: any, propertyKey: string) {
        getModelTypeInfoByCtor(target.constructor).registerPropertyAsArrayItem(propertyKey, order, elementName, ns, nestingLevel);
    }
}
*/

// } annotations

//#endregion
