import { AnyCtorOf } from './annotations';
import { isArray } from './utils';

export class TsSourceItem {
    private _type = this.constructor.name;
}

export interface ITsExprVisitor<T, TRet> {
    visitCtorRetExpr(ctor: TsCtorRefExpr, arg: T): TRet;
    visitLambdaExpr(func: TsLambdaExpr, arg: T): TRet;
    visitArrayExpr(arr: TsArrayLiteralExpr, arg: T): TRet;
    visitObjectExpr(obj: TsObjLiteralExpr, arg: T): TRet;
    visitStringExpr(str: TsStringExpr, arg: T): TRet;
    visitBooleanExpr(bool: TsBooleanExpr, arg: T): TRet;
    visitNumberExpr(num: TsNumberExpr, arg: T): TRet;
    visitNullExpr(obj: TsNullExpr, arg: T): TRet;
    visitUndefinedExpr(obj: TsUndefinedExpr, arg: T): TRet;
}

export abstract class TsExpr extends TsSourceItem {
    public constructor() {
        super();
    }

    public apply<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return this.applyImpl(visitor, arg);
    }

    protected abstract applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet;

    public static literalFromExample(obj: any): TsLiteralExpr {
        if (isArray(obj)) {
            return new TsArrayLiteralExpr(obj.map(o => this.literalFromExample(o)));
        } else {
            switch (typeof obj) {
                case 'number': return new TsNumberExpr(obj);
                case 'boolean': return this.bool(obj);
                case 'string': return new TsStringExpr(obj);
                case 'undefined': return TsUndefinedExpr.Instance;
                case 'object': return new TsObjLiteralExpr(new Map<string, TsExpr>(Object.entries(obj).map(([k, v]) => [k, this.literalFromExample(v)])));
                case 'symbol':
                case 'function':
                case 'bigint':
                default:
                    throw new Error(`Unsupported literal example type ${typeof obj}`);
            }
        }
    }

    public static array(...items: TsExpr[]) {
        return new TsArrayLiteralExpr(items);
    }

    public static object(members?: readonly (readonly [string, TsExpr])[]) {
        return new TsObjLiteralExpr(new Map(members));
    }

    public static lambda(signature: TsMethodSignature, body: TsExpr) {
        return new TsLambdaExpr(signature, body);
    }

    public static ctorRef(typeName: string) {
        return new TsCtorRefExpr(typeName);
    }

    public static string(value: string) {
        return new TsStringExpr(value);
    }

    public static number(value: number) {
        return new TsNumberExpr(value);
    }

    public static bool(value: boolean) {
        return value ? TsBooleanExpr.TrueInstance : TsBooleanExpr.FalseInstance;
    }

    public static null() {
        return TsNullExpr.Instance;
    }

    public static undefined() {
        return TsUndefinedExpr.Instance;
    }
}

export abstract class TsLiteralExpr extends TsExpr {
}
export class TsUndefinedExpr extends TsLiteralExpr {
    public static Instance = new TsUndefinedExpr();
    
    private constructor() {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitUndefinedExpr(this, arg);
    }
}
export class TsNullExpr extends TsLiteralExpr {
    public static Instance = new TsNullExpr();

    private constructor() {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitNullExpr(this, arg);
    }
}
export class TsNumberExpr extends TsLiteralExpr {
    public constructor(
        public readonly value: number
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitNumberExpr(this, arg);
    }
}
export class TsBooleanExpr extends TsLiteralExpr {
    public static TrueInstance = new TsBooleanExpr(true);
    public static FalseInstance = new TsBooleanExpr(false);
    
    private constructor(
        public readonly value: boolean
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitBooleanExpr(this, arg);
    }
}
export class TsStringExpr extends TsLiteralExpr {
    public constructor(
        public readonly value: string
    ) {
        super(); 
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitStringExpr(this, arg);
    }
}

export class TsObjLiteralExpr extends TsExpr {
    public constructor(
        public readonly items: Map<string, TsExpr>
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitObjectExpr(this, arg);
    }
}

export class TsArrayLiteralExpr extends TsExpr {
    public constructor(
        public readonly items: TsExpr[]
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitArrayExpr(this, arg);
    }
}

export class TsLambdaExpr extends TsExpr {
    public constructor(
        public readonly signature: TsMethodSignature,
        public readonly body: TsExpr
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitLambdaExpr(this, arg);
    }
}

export class TsCtorRefExpr extends TsLiteralExpr {
    public constructor(
        public readonly typeName: string
    ) {
        super();
    }

    protected override applyImpl<T, TRet>(visitor: ITsExprVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitCtorRetExpr(this, arg);
    }
}

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

export class TsAnnotationDef extends TsSourceItem {
    public constructor(
        public readonly name: string,
        public readonly args: TsExpr[]
    ) { 
        super();
    }
}

export class TsAnnotationsCollection {
    private _defs = new Array<TsAnnotationDef>();

    public get defs() : ReadonlyArray<TsAnnotationDef> { 
        return this._defs;
    }

    public addByName(name: string, ...args: TsExpr[]): TsAnnotationDef {
        const annotation = new TsAnnotationDef(name, args);
        this._defs.push(annotation);
        return annotation;
    }

    public addByType<F extends (...args: any[])=> any>(ctor: F, args?: Parameters<F>): TsAnnotationDef {
        const annotation = new TsAnnotationDef(ctor.name, args?.map(a => TsExpr.literalFromExample(a)) ?? []);
        this._defs.push(annotation);
        return annotation;
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
export abstract class TsTypeRef extends TsSourceItem  {
    public constructor() {
        super();
    }

    public static makeBuiltin(kind: TsBuiltinTypeKind): TsBuiltinTypeRef { return new TsBuiltinTypeRef(kind); }
    public static makeArray(elementType: TsTypeRef): TsArrayTypeRef { return new TsArrayTypeRef(elementType); }
    public static makeCustom(name: string, genericArgs?: ReadonlyArray<TsTypeRef>): TsCustomTypeRef { return new TsCustomTypeRef(name, genericArgs); }

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
        public readonly genericArgs?: ReadonlyArray<TsTypeRef>
    ) {
        super();
    }
 
    protected override applyImpl<T, TRet>(visitor: ITsTypeRefVisitor<T, TRet>, arg: T): TRet { return visitor.visitCustomTypeRef(this, arg); }
}

export abstract class TsNamedMember extends TsSourceItem implements ITsNamedMember {
    public constructor(
        public readonly name: string
    ) {
        super();
    }
}

export class TsGenericParameterDef extends TsNamedMember {
    private readonly _baseTypes: ReadonlyArray<TsTypeRef>;

    public constructor(name: string, basedTypes?: Array<TsTypeRef>) {
        super(name);
        this._baseTypes = basedTypes ?? [];
    }

    public get reference(): TsTypeRef { return TsTypeRef.makeCustom(this.name); }

    public get baseTypes(): ReadonlyArray<TsTypeRef> { return this._baseTypes; }

    public static makeSetOf(genericParams: (TsGenericParameterDef|string)[]): TsGenericParameterDef[] {
        return genericParams.map(p => p instanceof TsGenericParameterDef ? p : new TsGenericParameterDef(p));
    }
}

export class TsMethodParameter extends TsNamedMember {
    private readonly _paramType: TsTypeRef;

    public constructor(name: string, paramType: TsTypeRef) {
        super(name);
        this._paramType = paramType;
    }

    public get paramType() : TsTypeRef { return this._paramType; }
}

export class TsMethodSignature {
    public constructor(
        public readonly genericParams: ReadonlyArray<TsGenericParameterDef>,
        public readonly parameters: ReadonlyArray<TsMethodParameter>,
        public readonly returnType?: TsTypeRef
    ) {
    }

    public static nothingToUnpsecified() : TsMethodSignature {
        return new TsMethodSignature([], [], undefined);
    }

    public static of(genericParams?: (TsGenericParameterDef|string)[], parameters?: (TsMethodParameter|[name: string, paramType: TsTypeRef])[], retType?: TsTypeRef): TsMethodSignature {
        return new TsMethodSignature(
            genericParams ? TsGenericParameterDef.makeSetOf(genericParams) : [], 
            (parameters ?? []).map(p => p instanceof TsMethodParameter ? p : new TsMethodParameter(p[0], p[1])), 
            retType
        );
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

    public get genericParams(): ReadonlyArray<TsGenericParameterDef> { return this._genericParams; }

    public makeRef(args?: TsTypeRef[]): TsTypeRef {
        if ((args?.length ?? 0) === this._genericParams.length) {
            return TsTypeRef.makeCustom(this.name, args);
        } else {
            throw new Error(`Inconsistent type reference construction attempt`);
        }
    }
}

export abstract class TsClassMember extends TsNamedMember implements ITsClassMember {
    public readonly annotations = new TsAnnotationsCollection();

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
    public readonly baseInterfaces: Array<TsTypeRef>;
    
    public constructor(name: string, genericParams?: Array<TsGenericParameterDef>, baseIfaces?: Array<TsTypeRef>) {
        super(name, genericParams);
        this.baseInterfaces = baseIfaces ?? new Array<TsTypeRef>();
    }

    public createMethod(name: string, signature: TsMethodSignature): TsMethodDecl { 
        return this.register(new TsMethodDecl(name, signature));
    }

    public createMethodOf(name: string, parameters: (TsMethodParameter|[string, TsTypeRef])[], retType?: TsTypeRef): TsMethodDecl {
        return this.createMethod(name, TsMethodSignature.of([], parameters, retType));
    }

    public createGenericMethodOf(name: string, genericParams: (TsGenericParameterDef|string)[], parameters: (TsMethodParameter|[string, TsTypeRef])[], retType?: TsTypeRef): TsMethodDecl {
        return this.createMethod(name, TsMethodSignature.of(genericParams, parameters, retType));
    }

    apply<T, TRet>(visitor: ITsSourceUnitMemberVisitor<T, TRet>, arg: T): TRet {
        return visitor.visitInterfaceDef(this, arg);
    }    
}

export class TsFieldDef extends TsClassMember implements ITsClassMember {
    public constructor(
        name: string,
        public readonly fieldType?: TsTypeRef,
        public readonly isOptional?: boolean
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
    public readonly annotations = new TsAnnotationsCollection();
    public readonly baseType: TsCustomTypeRef|undefined;
    public readonly interfaces: Array<TsTypeRef>;

    public constructor(name: string, genericParams?: Array<TsGenericParameterDef>, baseType?: TsCustomTypeRef, ifaces?: Array<TsTypeRef>) {
        super(name, genericParams);
        this.baseType = baseType;
        this.interfaces = ifaces ?? new Array<TsTypeRef>();
    }

    public createMethod(name: string, signature: TsMethodSignature): TsMethodDef { 
        return this.register(new TsMethodDef(name, signature));
    }

    public createMethodOf(name: string, parameters: (TsMethodParameter|[string, TsTypeRef])[], retType?: TsTypeRef): TsMethodDef {
        return this.createMethod(name, TsMethodSignature.of([], parameters, retType));
    }

    public createGenericMethodOf(name: string, genericParams: (TsGenericParameterDef|string)[], parameters: (TsMethodParameter|[string, TsTypeRef])[], retType?: TsTypeRef): TsMethodDecl {
        return this.createMethod(name, TsMethodSignature.of(genericParams, parameters, retType));
    }

    public createField(name: string, fieldType?: TsTypeRef, isOptional?: boolean): TsFieldDef { 
        return this.register(new TsFieldDef(name, fieldType, isOptional));
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

    public createClass(name: string, baseClass?: TsCustomTypeRef, ... ifaces: TsTypeRef[]): TsClassDef {
        return this.register(new TsClassDef(name, [], baseClass, ifaces)); 
    }

    public createGenericClass(name: string, genericParams: (TsGenericParameterDef|string)[], baseClass?: TsCustomTypeRef, ... ifaces: TsTypeRef[]): TsClassDef {
        return this.register(new TsClassDef(name, TsGenericParameterDef.makeSetOf(genericParams), baseClass, ifaces)); 
    }

    public createInterface(name: string, ... ifaces: TsTypeRef[]): TsInterfaceDef {
        return this.register(new TsInterfaceDef(name, [], ifaces)); 
    }

    public createGenericInterface(name: string, genericParams: (TsGenericParameterDef|string)[], ... ifaces: TsTypeRef[]): TsInterfaceDef {
        return this.register(new TsInterfaceDef(name, TsGenericParameterDef.makeSetOf(genericParams), ifaces)); 
    }

    public createEnum(name: string, members?: { name: string, value?: any }[]): TsEnumDef {
        const e = this.register(new TsEnumDef(name));
        members?.forEach(x => e.add(x.name, x.value));
        return e;
    }
}

