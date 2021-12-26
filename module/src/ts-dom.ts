
export interface ITsNamedMember {
    get name(): string;
}

export enum TsAccessModifier {
    Public = 'public',
    Protected = 'protected',
    Private = 'private'
}

export interface ITsClassMember extends ITsNamedMember {
    apply<T, TRet>(visitor: ITsClassMemberVisitor<T, TRet>, arg: T): TRet;
}

export interface ITsClassMemberVisitor<T, TRet> {
    visitMethodDef(methodDef: TsMethodDef, arg: T): TRet;
    visitFieldDef(fieldDef: TsFieldDef, arg: T): TRet;
}

export interface ITsSourceUnitMember extends ITsNamedMember {
    apply<T, TRet>(visitor: ITsSourceUnitMemberVisitor<T, TRet>, arg: T): TRet;
}

export interface ITsSourceUnitMemberVisitor<T, TRet> {
    visitInterfaceDef(ifaceDef: TsInterfaceDef, arg: T): TRet;
    visitClassDef(classDef: TsClassDef, arg: T): TRet;
    visitEnumDef(enumDef: TsEnumDef, arg: T): TRet;
}

export class TsAnnotationDef {
    public constructor(
        public readonly name: string
    ) { 
    }
}

export interface ITsTypeRefVisitor<T, TRet> {
    visitBuiltinTypeRef(builtinTypeRef: TsBuiltinTypeRef, arg: T): TRet;
    visitArrayTypeRef(arrayTypeRef: TsArrayTypeRef, arg: T): TRet;
    visitCustomTypeRef(customTypeRef: TsCustomTypeRef, arg: T): TRet;
}
export enum TsBuiltinTypeKind {
    Number = 'number',
    String = 'string',
    Object = 'Object',
    Any = 'any',
    Undefined = 'undefined',
    Void = 'void'
}
export abstract class TsTypeRef {
    public static makeBuiltin(kind: TsBuiltinTypeKind): TsTypeRef { return new TsBuiltinTypeRef(kind); }
    public static makeArray(number, elementType: TsTypeRef): TsTypeRef { return new TsArrayTypeRef(elementType); }
    public static makeCustom(name: string, genericArgs?: TsTypeRef[]): TsTypeRef { return new TsCustomTypeRef(name, genericArgs); }

    public apply<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet { return this.applyImpl(visitor, arg); }
    protected abstract applyImpl<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet;
}
export class TsBuiltinTypeRef extends TsTypeRef {
    public constructor(
        public readonly kind: TsBuiltinTypeKind
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet { return visitor.visitBuiltinTypeRef(this, arg); }
}
export class TsArrayTypeRef extends TsTypeRef {
    public constructor(
        public readonly elementType: TsTypeRef
    ) {
        super();
    }
 
    protected override applyImpl<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet { return visitor.visitArrayTypeRef(this, arg); }
}
export class TsCustomTypeRef extends TsTypeRef {
    public constructor(
        public readonly name: string,
        public readonly genericArgs?: TsTypeRef[]
    ) {
        super();
    }
 
    protected override applyImpl<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet { return visitor.visitCustomTypeRef(this, arg); }
}

export abstract class TsNamedMember implements ITsNamedMember {
    public constructor(
        public readonly name: string
    ) {
    }
}

export class TsGenericParameterDef extends TsNamedMember {
    private readonly _baseTypes: ReadonlyArray<TsTypeRef>;

    public constructor(name: string, basedTypes?: Array<TsTypeRef>) {
        super(name);
        this._baseTypes = basedTypes ?? [];
    }

    public get baseTypes(): ReadonlyArray<TsTypeRef> { return this._baseTypes; }
}

export class TsMethodSignature {
    public constructor(
        public readonly paramTypes: TsTypeRef[],
        public readonly returnType: TsTypeRef
    ) {
    }
}

export abstract class TsNamedOrderedCollection<T extends ITsNamedMember> extends TsNamedMember {
    private readonly _itemsList = new Array<T>();
    private readonly _itemsByName = new Map<string, T>();

    public constructor(name: string) {
        super(name);
    }

    public get members(): ReadonlyArray<T> { return this._itemsList; }

    protected register<M extends T>(item: M): M {
        if (this._itemsByName.has(item.name)) {
            throw new Error(`Entity ${this.name} already has member ${item.name}`);
        } else {
            this._itemsList.push(item);
            this._itemsByName.set(item.name, item);
            return item;
        }
    }
}

export abstract class TsCustomTypeDef<M extends ITsNamedMember> extends TsNamedOrderedCollection<M> {

    private readonly _genericParams: TsGenericParameterDef[];

    public constructor(name: string, genericParams?: TsGenericParameterDef[]) {
        super(name);
        
        this._genericParams = genericParams ?? [];
    }

    public get genericParam(): ReadonlyArray<TsGenericParameterDef> { return this._genericParams; }

    public makeRef(args?: TsTypeRef[]): TsTypeRef {
        if ((args?.length ?? 0) === this._genericParams.length) {
            return TsTypeRef.makeCustom(this.name, args);
        } else {
            throw new Error(`Inconsistent type reference construction attempt`);
        }
    }
}

export abstract class TsClassMember extends TsNamedMember implements ITsClassMember {
    public access?: TsAccessModifier;

    public constructor(name: string) {
        super(name);
    }

    public abstract apply<T, TRet>(visitor: ITsClassMemberVisitor<T, TRet>, arg: T): TRet;
}

export abstract class TsLiteral {
    public string(value: string) : TsLiteralOf<string> { return new TsLiteralOf<string>(value, `"${value.replace('"', '\\"')}"`); }
    public number(value: number) : TsLiteralOf<number> { return new TsLiteralOf<number>(value, value.toString()); }
    public boolean(value: boolean) : TsLiteralOf<boolean> { return new TsLiteralOf<boolean>(value, value ? 'true' : 'false'); }

    public abstract format(): string;
}
export class TsLiteralOf<T> extends TsLiteral {
    public constructor(
        public readonly value: T,
        private readonly formatted: string
    ) {
        super();
    }

    public override format(): string {
        return this.formatted;
    }
}

export class TsMethodDecl extends TsNamedMember {
    public constructor(
        name: string,
        public readonly signature: TsMethodSignature
    ) {
        super(name);
    }
}

export class TsInterfaceDef extends TsCustomTypeDef<TsMethodDecl> implements ITsSourceUnitMember {
    public constructor(name: string) {
        super(name);
    }

    public createMethod(name: string, signature: TsMethodSignature): TsMethodDecl { 
        return this.register(new TsMethodDecl(name, signature));
    }

    apply<T, TRet>(visitor: ITsSourceUnitMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitInterfaceDef(this, arg);
    }    
}

export class TsFieldDef extends TsClassMember implements ITsClassMember {
    public constructor(
        name: string,
        public readonly fieldType?: TsTypeRef
    ) {
        super(name);
    }

    apply<T, TRet>(visitor: ITsClassMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitFieldDef(this, arg);
    }
}

export class TsMethodDef extends TsClassMember implements ITsClassMember {
    public constructor(
        name: string,
        public readonly signature: TsMethodSignature
    ) {
        super(name);
    }

    apply<T, TRet>(visitor: ITsClassMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitMethodDef(this, arg);
    }
}

export class TsClassDef extends TsCustomTypeDef<TsClassMember> implements ITsSourceUnitMember {
    private _annotations = new Array<TsAnnotationDef>();

    public constructor(name: string) {
        super(name);
    }

    public createAnnotation(name: string): TsAnnotationDef {
        const annotation = new TsAnnotationDef(name);
        this._annotations.push(annotation);
        return annotation;
    }

    public createMethod(name: string, signature: TsMethodSignature): TsMethodDef { 
        return this.register(new TsMethodDef(name, signature));
    }

    public createField(name: string, fieldType?: TsTypeRef): TsFieldDef { 
        return this.register(new TsFieldDef(name, fieldType));
    }

    apply<T, TRet>(visitor: ITsSourceUnitMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitClassDef(this, arg);
    }
}

export class TsEnumMemberDef extends TsNamedMember {
    public constructor(
        name: string,
        public readonly value?: TsLiteral
    ) {
        super(name);
    }
}

export class TsEnumDef extends TsNamedOrderedCollection<TsEnumMemberDef> implements ITsSourceUnitMember {
    public constructor(name: string) {
        super(name);
    }

    public makeRef(): TsTypeRef { 
        return TsTypeRef.makeCustom(this.name);
    }

    public add(name: string, value?: any): TsEnumMemberDef {
        return this.register(new TsEnumMemberDef(name, value));
    }

    apply<T, TRet>(visitor: ITsSourceUnitMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitEnumDef(this, arg);
    }    
}

export class TsSourceUnit extends TsNamedOrderedCollection<ITsSourceUnitMember> {

    public constructor(name: string) {
        super(name);
    }

    public createClass(name: string): TsClassDef {
        return this.register(new TsClassDef(name)); 
    }

    public createInterface(name: string): TsInterfaceDef {
        return this.register(new TsInterfaceDef(name)); 
    }

    public createEnum(name: string, members?: { name: string, value?: any }[]): TsEnumDef {
        const e = this.register(new TsEnumDef(name));
        members?.forEach(x => e.add(x.name, x.value));
        return e;
    }
}

