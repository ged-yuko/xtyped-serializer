import { IXsdAttrsDeclsVisitor, IXsdComplexContentVisitor, IXsdComplexTypeModelVisitor, IXsdNamedGroupParticle, IXsdNamedGroupParticleVisitor, IXsdNestedParticle, IXsdNestedParticleVisitor, IXsdSchemaDeclarationVisitor, IXsdSchemaDefinition, IXsdSchemaDefinitionVisitor, IXsdTypeDefParticle, IXsdTypeDefParticleVisitor, XsdAllImpl, XsdAnnotation, XsdAttrDecls, XsdAttributeGroupRef, XsdAttributeImpl, XsdAttributeUse, XsdComplexContent, XsdComplexRestrictionType, XsdComplexType, XsdExplicitChoiceGroupImpl, XsdExplicitSequenceGroupImpl, XsdExtensionTypeImpl, XsdFormChoice, XsdGroupRef, XsdImplicitComplexTypeModel, XsdImport, XsdInclude, XsdNamedAllParticleGroup, XsdNamedAttributeGroup, XsdNamedGroup, XsdNotation, XsdRedefine, XsdSchema, XsdSimpleContent, XsdSimpleExplicitChoiceGroup, XsdSimpleExplicitSequenceGroup, XsdTopLevelAttribute, XsdTopLevelComplexType, XsdTopLevelElement, XsdTopLevelSimpleType } from './xsdschema2'
import xs from './serializer'
import { ITsClassMemberVisitor, ITsExprVisitor, ITsSourceUnitMemberVisitor, ITsTypeRefVisitor, TsAnnotationsCollection, TsArrayLiteralExpr, TsArrayTypeRef, TsBooleanExpr, TsBuiltinTypeKind, TsBuiltinTypeRef, TsClassDef, TsCtorRefExpr, TsCustomTypeRef, TsEnumDef, TsExpr, TsFieldDef, TsLambdaExpr as TsLambdaExpr, TsInterfaceDef, TsMethodDef, TsMethodSignature, TsNullExpr, TsNumberExpr, TsObjLiteralExpr, TsSourceUnit, TsStringExpr, TsTypeRef, TsUndefinedExpr } from './ts-dom'
import * as ts from 'typescript'
import * as fs from 'fs'
import { foreachSeparating, IndentedStringBuilder, LinkedQueue } from './utils'
import { XmlDataModel } from './content-model'
import { XmlComplexType, XmlElementsGroup, XmlAttributesGroup, XmlAttribute, XmlAttributesGroupEntry, IXmlAttributeParameters } from './annotations'

class TscSourceTextBuilder implements ITsSourceUnitMemberVisitor<undefined, ts.Node> {
                                    // ITsClassMemberVisitor<undefined, void>,
                                    // ITsTypeRefVisitor<undefined, void>,
                                    // ITsExprVisitor<undefined, void> {

    private static _instance = new TscSourceTextBuilder();
    
    private constructor() {
    }

    visitInterfaceDef(ifaceDef: TsInterfaceDef, arg: undefined): ts.Node {
        throw new Error('Method not implemented.')
    }
    visitClassDef(classDef: TsClassDef, arg: undefined): ts.Node {
        throw new Error('Method not implemented.')
    }
    visitEnumDef(enumDef: TsEnumDef, arg: undefined): ts.Node {
        return ts.factory.createEnumDeclaration(
            undefined,
            ts.factory.createModifiersFromModifierFlags(ts.ModifierFlags.Export),
            enumDef.name,
            enumDef.members.map(m => ts.factory.createEnumMember(m.name)) // TODO m.value
        );
    }

    public static format(unit: TsSourceUnit): string {
        const resultFile = ts.createSourceFile(unit.name, '', ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

        const nodes = unit.members.map(m => m.apply(TscSourceTextBuilder._instance, undefined));
        const nodeList =  ts.factory.createNodeArray(nodes);
        
        const result = printer.printList(ts.ListFormat.SourceFileStatements, nodeList, resultFile);
        return result;
    }
}

class TsSourceTextBuilder implements ITsSourceUnitMemberVisitor<IndentedStringBuilder, void>,
                                   ITsClassMemberVisitor<IndentedStringBuilder, void>,
                                   ITsTypeRefVisitor<IndentedStringBuilder, void>,
                                   ITsExprVisitor<IndentedStringBuilder, void> {

    private static _instance = new TsSourceTextBuilder();

    private constructor() {
    }

    visitBuiltinTypeRef(builtinTypeRef: TsBuiltinTypeRef, sb: IndentedStringBuilder): void {
        sb.append(builtinTypeRef.kind);
    }
    visitArrayTypeRef(arrayTypeRef: TsArrayTypeRef, sb: IndentedStringBuilder): void {
        sb.append('Array').append('<');
        arrayTypeRef.elementType.apply(this, sb);
        sb.append('>');
    }
    visitCustomTypeRef(customTypeRef: TsCustomTypeRef, sb: IndentedStringBuilder): void {
        sb.append(customTypeRef.name);
        if (customTypeRef.genericArgs) {
            foreachSeparating(customTypeRef.genericArgs, p => p.apply(this, sb), () => sb.append(', '));
        }
    }

    private formatMethodHead(name: string, signature: TsMethodSignature, sb: IndentedStringBuilder): void {
        sb.append(name).append('(')
        if (signature.paramTypes) {
            foreachSeparating(signature.paramTypes, p => p.apply(this, sb), () => sb.append(', '));
        }
        sb.append(')');
        if (signature.returnType) {
            sb.append(': ')
            signature.returnType.apply(this, sb);
        }
    }

    visitMethodDef(methodDef: TsMethodDef, sb: IndentedStringBuilder): void {
        this.formatAnnotations(methodDef.annotations, sb);
        // methodDef.access
        this.formatMethodHead(methodDef.name, methodDef.signature, sb);
        sb.appendLine(';');
        sb.appendLine();
    }
    visitFieldDef(fieldDef: TsFieldDef, sb: IndentedStringBuilder): void {
        this.formatAnnotations(fieldDef.annotations, sb);
        sb.append(fieldDef.name);
        
        if (fieldDef.fieldType) {
            sb.append(': ');
            fieldDef.fieldType.apply(this, sb);
        }

        sb.appendLine(';');
    }
    
    visitInterfaceDef(ifaceDef: TsInterfaceDef, sb: IndentedStringBuilder): void {
        sb.appendLine(`export interface ${ifaceDef.name} {`).push();
        for (const m of ifaceDef.members) {
            this.formatMethodHead(m.name, m.signature, sb);
            sb.appendLine(';');
        }
        sb.pop().appendLine('}').appendLine();
    }
    visitClassDef(classDef: TsClassDef, sb: IndentedStringBuilder): void {
        this.formatAnnotations(classDef.annotations, sb);
        sb.appendLine(`export class ${classDef.name} {`).push();
        for (const m of classDef.members) {
            if (m.access) {
                sb.append(m.access).append(' ');
            }
            m.apply(this, sb);
        }
        sb.pop().appendLine('}').appendLine();
    }
    visitEnumDef(enumDef: TsEnumDef, sb: IndentedStringBuilder): void {
        sb.appendLine(`export enum ${enumDef.name} {`).push();
        for (const m of enumDef.members) {
            if (m.value) {
                sb.append(`${m.name} = ${m.value.format()}`);
            } else {
                sb.append(m.name);
            }
            sb.appendLine(',');
        }
        sb.pop().appendLine('}').appendLine();
    }

    private formatAnnotations(collection: TsAnnotationsCollection, sb: IndentedStringBuilder): void {
        for (const def of collection.defs) {
            sb.append('@').append(def.name).append('(');
            foreachSeparating(def.args, e => e.apply(this, sb), () => sb.append(', '));
            sb.append(')');
            sb.appendLine();
        }
    }


    visitCtorRetExpr(ctor: TsCtorRefExpr, sb: IndentedStringBuilder): void {
        sb.append(ctor.typeName);
    }
    visitLambdaExpr(func: TsLambdaExpr, sb: IndentedStringBuilder): void {
        this.formatMethodHead('', func.signature, sb);
        sb.append(' => ');
        func.body.apply(this, sb);
    }
    visitArrayExpr(arr: TsArrayLiteralExpr, sb: IndentedStringBuilder): void {
        sb.append('[ ').push();
        if (arr.items.length > 4) {
            sb.appendLine();
        }
        foreachSeparating(arr.items, item => {
            if (arr.items.length > 7) {
                sb.appendLine();
            }
            item.apply(this, sb);
        }, () => sb.append(', '));
        sb.pop().append(' ]');
    }
    visitObjectExpr(obj: TsObjLiteralExpr, sb: IndentedStringBuilder): void {
        sb.append('{ ').push();
        if (obj.items.size > 4) {
            sb.appendLine();
        }
        foreachSeparating(Array.from(obj.items), ([name, expr]) => {
            if (obj.items.size > 4) {
                sb.appendLine();
            }
            sb.append(name).append(': ');
            expr.apply(this, sb);
        }, () => sb.append(', '));
        sb.pop().append(' }');
    }
    visitStringExpr(str: TsStringExpr, sb: IndentedStringBuilder): void {
        sb.append(str.value);
    }
    visitBooleanExpr(bool: TsBooleanExpr, sb: IndentedStringBuilder): void {
        sb.append('' + bool.value);
    }
    visitNumberExpr(num: TsNumberExpr, sb: IndentedStringBuilder): void {
        sb.append('' + num.value);
    }
    visitNullExpr(obj: TsNullExpr, sb: IndentedStringBuilder): void {
        sb.append('null');
    }
    visitUndefinedExpr(obj: TsUndefinedExpr, sb: IndentedStringBuilder): void {
        sb.append('undefined');
    }    


    public static format(unit: TsSourceUnit): string {
        const sb = new IndentedStringBuilder();
        sb.appendLine();
        sb.appendLine();
        
        for (const m of unit.members) {
            m.apply(TsSourceTextBuilder._instance, sb);
        }

        sb.appendLine();
        sb.appendLine();
        return sb.stringify();
    }
}

type FixupOperation = () => FixupOperations;
type FixupOperations = FixupOperation[];

interface IGroupModel {
}

abstract class DefinitionTypesModel {
    public constructor(
        public readonly context: NamespaceModel
    ) {
    }

    public implementDefinitions(unit: TsSourceUnit) : void {
        this.implementDefinitionsImpl(unit);
    }

    protected abstract implementDefinitionsImpl(unit: TsSourceUnit) : void;

    public getDelayedOperations() : FixupOperations {
        return this.getDelayedOperationsImpl();
    }
    
    protected getDelayedOperationsImpl() : FixupOperations { return []; } 
}

class ChoiceGroupIfaceModel extends DefinitionTypesModel implements IGroupModel {
    private _alternatives = new Array<ClassModel>();

    public constructor(
        context: NamespaceModel,
        private readonly name: string,
        private readonly definition: XsdExplicitChoiceGroupImpl|XsdSimpleExplicitChoiceGroup
    ) {
        super(context);
    }

    protected override implementDefinitionsImpl(unit: TsSourceUnit) : void {
        // TODO walk through this.definition.particles, implement choice type interface and visitor interface
    }
}

class ClassFieldModel {
    public constructor(
        public readonly name: string
    ) {
    }

    public implement(classDef: TsClassDef) : void {
        return this.implementImpl(classDef);
    }
    
    protected implementImpl(classDef: TsClassDef) : void {
        classDef.createField(this.name, TsTypeRef.makeBuiltin(TsBuiltinTypeKind.Any));
    }
}
class ClassAttributeFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly attrDef: XsdAttributeImpl
    ) {
        super(name);
    }
    
    protected override implementImpl(classDef: TsClassDef): void {
        const attr = this.attrDef;
        if (attr.defRef.ref) {
            throw new Error('attr ref not implemented');
        } else if (attr.defRef.name) {
            const isOptional = attr.use === XsdAttributeUse.Optional || !attr.use;
            const fd = classDef.createField(attr.defRef.name, TsTypeRef.makeBuiltin(TsBuiltinTypeKind.String), isOptional);

            const aargs = TsExpr.object();
            if (attr.default) {
                aargs.items.set('default', TsExpr.string(attr.default));
            }
            if (attr.form === XsdFormChoice.Qualified) {
                aargs.items.set('qualified', TsExpr.bool(true));
            }
            if (!isOptional) {
                aargs.items.set('required', TsExpr.bool(true));
            }
            fd.annotations.addByName(XmlAttribute.name, aargs);
        }
    }
}
class ClassAttributeGroupFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly groupRef: XsdAttributeGroupRef
    ) {
        super(name);
    }
    
    protected override implementImpl(classDef: TsClassDef): void {
        const groupRef = this.groupRef;
        const fd = classDef.createField(groupRef.ref, TsTypeRef.makeCustom(groupRef.ref));
        fd.annotations.addByName(XmlAttributesGroupEntry.name, TsExpr.object([
            ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(groupRef.ref))]
        ]));
    }
}

abstract class ClassModel extends DefinitionTypesModel {
    protected _baseTypeModel: ComplexTypeClassModel|undefined;
    protected _inheritanceMode = InheritanceMode.None;
    protected _choiceIfaces = new Array<ChoiceGroupIfaceModel>();
    protected _isMixed = false;

    protected readonly _fields = new Map<string, ClassFieldModel>();

    protected constructor(
        context: NamespaceModel,
        protected readonly name: string,
        protected readonly abstract: boolean
    ) {
        super(context);
    }

    protected registerField(name: string, def: XsdAttributeImpl|XsdAttributeGroupRef) : ClassFieldModel {
        if (this._fields.get(name)) {
            throw new Error(`Field ${name} already registered`);
        }

        let m: ClassFieldModel;
        if (def instanceof XsdAttributeImpl) {
            m = new ClassAttributeFieldModel(name, def);
        } else if (def instanceof XsdAttributeGroupRef) {
            m = new ClassAttributeGroupFieldModel(name, def);
        } else {
            console.error('unknown field model kind');
            m = new ClassFieldModel(name);
        }
        this._fields.set(name, m);
        return m;
    }
}

class SeqGroupClassModel extends ClassModel implements IGroupModel {

    public constructor(
        context: NamespaceModel,
        name: string,
        private readonly definition: XsdExplicitSequenceGroupImpl|XsdSimpleExplicitSequenceGroup 
    ) {
        super(context, name, false);
    }

    protected override getDelayedOperationsImpl() : FixupOperations { 
        // TODO expand implicit subgroups
        return []; 
    } 

    protected override implementDefinitionsImpl(unit: TsSourceUnit) : void{
        const cd = unit.createClass(this.name);
        cd.annotations.addByType(XmlElementsGroup);

        // TODO walk through this.definition.particles, implement elements group class
    }
}

enum InheritanceMode {
    None,
    Extension,
    Restriction
}

class ComplexTypeClassModel extends ClassModel {
    public constructor(
        context: NamespaceModel,
        name: string,
        private readonly definition: XsdComplexType,
        abstract: boolean,
        private readonly final: string,
        private readonly block: string
    ) {
        super(context, name, abstract);
    }

    protected override getDelayedOperationsImpl() : FixupOperations {
        return this.dispatchDefinitionModel();
    }

    private dispatchDefinitionModel() : FixupOperations {
        return this.definition.model.apply(new class implements IXsdComplexTypeModelVisitor<ComplexTypeClassModel, FixupOperations> {
            visitComplexContentModel(cmodel: XsdComplexContent, me: ComplexTypeClassModel): FixupOperations {
                if (cmodel.mixed) {
                    me._isMixed = true;
                }

                return cmodel.content.apply(new class implements IXsdComplexContentVisitor<ComplexTypeClassModel, FixupOperations> {
                    visitComplexExtensionModel(ctext: XsdExtensionTypeImpl, me: ComplexTypeClassModel): FixupOperations {
                        return me.registerExplicitMembers(ctext.base, InheritanceMode.Extension, ctext.particles, ctext.attrDecls);
                    }
                    visitComplexRestrictionModel(ctrst: XsdComplexRestrictionType, me: ComplexTypeClassModel): FixupOperations {
                        return me.registerExplicitMembers(ctrst.base, InheritanceMode.Restriction, ctrst.particles, ctrst.attrDecls);
                    }
                }, me);
            }
            visitSimpleContentModel(smodel: XsdSimpleContent, me: ComplexTypeClassModel): FixupOperations {
                return [];
            }
            visitImplicitComplexTypeModel(icmodel: XsdImplicitComplexTypeModel, me: ComplexTypeClassModel): FixupOperations {
                return [];
            }
        }, this);
    }

    private registerExplicitMembers(baseComplexTypeName: string, inheritanceMode: InheritanceMode, particles: IXsdTypeDefParticle[], attrDecls: XsdAttrDecls) : FixupOperations {
        this._baseTypeModel = this.context.complexTypes.get(baseComplexTypeName);
        this._inheritanceMode = inheritanceMode;
        
        return [ 
            // TODO extract it to superclass, consider attribute group model
            attrDecls.decls.flatMap(attrPart => attrPart.apply(new class implements IXsdAttrsDeclsVisitor<ComplexTypeClassModel, FixupOperations> {
                visitXsdAttribute(attr: XsdAttributeImpl, me: ComplexTypeClassModel): FixupOperations {
                    me.registerField(Attr.name, attr);
                    return [];
                }
                visitXsdAttributeGroupRef(groupRef: XsdAttributeGroupRef, me: ComplexTypeClassModel): FixupOperations {
                    me.registerField(groupRef.ref, groupRef);
                    return [];
                }
            }, this)),
            // TODO extract it to superclass, consider elements group
            particles.flatMap(part => part.apply(new class implements IXsdTypeDefParticleVisitor<ComplexTypeClassModel, FixupOperations> {
                visitSequenceGroup(seqGroup: XsdExplicitSequenceGroupImpl, me: ComplexTypeClassModel): FixupOperations {
                    return me.registerExplicitNestedMembers(seqGroup);
                }
                visitChoiceGroup(choiceGroup: XsdExplicitChoiceGroupImpl, me: ComplexTypeClassModel): FixupOperations {
                    return me.registerExplicitNestedMembers(choiceGroup);
                }
                visitAllGroup(allGroup: XsdAllImpl, me: ComplexTypeClassModel): FixupOperations {
                    console.error('not supported');
                    return [];
                }
                visitGroupRef(groupRef: XsdGroupRef, me: ComplexTypeClassModel): FixupOperations {
                    return me.registerExplicitNestedMembers(groupRef);
                }
            }, this))
        ].flat();
    }

    private registerExplicitNestedMembers(part: IXsdNestedParticle) : FixupOperations {
        return part.apply(new class implements IXsdNestedParticleVisitor<ComplexTypeClassModel, FixupOperations> {
            // TODO move it to superclass, IXsdNestedParticleVisitor for registerExplicitNestedMembers
        }, this);
    }

    protected override implementDefinitionsImpl(unit: TsSourceUnit) : void {
        const cd = unit.createClass(this.name, this._baseTypeModel ? TsTypeRef.makeCustom(this._baseTypeModel.name) : undefined);
        cd.annotations.addByType(XmlComplexType);

        // this.definition.mixed
        // TODO walk through this.definition.model, implement element complex type members and visitor application method if needed
    }
}

class NamespaceModel {
    public readonly complexTypes = new Map<string, ComplexTypeClassModel>();
    public readonly simpleTypes = new Map<string, XsdTopLevelSimpleType>();
    public readonly elements = new Map<string, XsdTopLevelElement>();
    public readonly attributes = new Map<string, XsdTopLevelAttribute>();
    public readonly groups = new Map<string, IGroupModel>();
    public readonly attributeGroups = new Map<string, XsdNamedAttributeGroup>();
    public readonly references = new Map<string, NamespaceModel>();

    public readonly allModels = new Array<DefinitionTypesModel>();

    constructor(
        public readonly schema: XsdSchema,
        public readonly outputFileName: string,
        public readonly inputFileName?: string,
        public readonly typeNamePrefix?: string
    ) {
    }

    public makeTypeName(name: string): string {
        if (this.typeNamePrefix) {
            if (this.typeNamePrefix.endsWith('_')) { // snake-like
                return this.typeNamePrefix + name; 
            } else { // pascal/camel-like
                return this.typeNamePrefix + name[0].toUpperCase() + name.substring(1);
            }
        } else { // as is
            return name;
        }
    }

    public createComplexType(name: string, definition: XsdComplexType, abstract: boolean, final: string, block: string ) {
        const model = new ComplexTypeClassModel(this, this.makeTypeName(name), definition, abstract, final, block);
        this.complexTypes.set(name, model);
        this.allModels.push(model);
    }

    public createSequenceGroup(name: string, seq: XsdExplicitSequenceGroupImpl|XsdSimpleExplicitSequenceGroup) : void {
        const model = new SeqGroupClassModel(this, this.makeTypeName(name), seq);
        this.groups.set(name, model);
        this.allModels.push(model);
    }

    public createChoiceGroup(name: string, seq: XsdExplicitChoiceGroupImpl|XsdSimpleExplicitChoiceGroup) : void {
        const model = new ChoiceGroupIfaceModel(this, this.makeTypeName(name), seq);
        this.groups.set(name, model);
        this.allModels.push(model);
    }
}

class SchemaDefinitionsCollector implements IXsdSchemaDeclarationVisitor<NamespaceModel, void>, IXsdSchemaDefinitionVisitor<NamespaceModel, void> {

    private _nsByName = new Map<string, NamespaceModel>();
    private _queue = new LinkedQueue<NamespaceModel>();
    private _log: IndentedStringBuilder;

    public constructor(log: IndentedStringBuilder) {
        this._log = log;
    }

    private log(msg: string, ctl?: number) : void {
        this._log.appendLine(msg);

        if (ctl) {
            const f = ctl > 0 ? () => this._log.push() : () => this._log.pop();
            for (let i = Math.abs(ctl); i > 0; i--) {
                f();
            }
        }
    }

    public importXsdFromFile(outputFilePath: string, xsdFilePath: string, typeNamePrefix?: string) : NamespaceModel {
        const schemaText = fs.readFileSync(xsdFilePath, 'utf-8');
        return this.importXsdText(outputFilePath, schemaText, xsdFilePath, typeNamePrefix);
    }

    public importXsdText(outputFilePath: string, xsdSchemaText: string, xsdFilePath?: string, typeNamePrefix?: string) : NamespaceModel {
        const schema = xs.deserialize(xsdSchemaText, XsdSchema);
        const info = new NamespaceModel(schema, outputFilePath, xsdFilePath, typeNamePrefix?.trim());
        this._nsByName.set(schema.targetNamespace, info);
        this._queue.enqueue(info);
        return info;
    }
    
    private getSchema(ns: string, location?: string) : NamespaceModel|undefined {
        const info = this._nsByName.get(ns);
        if (info) {
            return info;
        } else if (location) {
            if (fs.existsSync(location)) {
                return this.importXsdFromFile('', location);
            } else {
                this.log(`Failed to obtain schema '${ns}' from '${location}'`);
                return undefined;
            }
        } else {
            this.log(`Failed to obtain schema '${ns}'`);
            return undefined;
        }
    }

    public doWork() : NamespaceModel[] {
        let schemaInfo = this._queue.dequeue();
        const result = new Array<NamespaceModel>();
        while (schemaInfo) {
            this.collectDefinitions(schemaInfo.schema, schemaInfo);
            result.push(schemaInfo);
            schemaInfo = this._queue.dequeue();
        }
        return result;
    }

    private collectDefinitions(schema: XsdSchema, context: NamespaceModel): void {
        schema.declarations.forEach(d => d.apply(this, context));
        schema.definitions.forEach(d => d.apply(this, context));
    }

    visitXsdAnnotation(xannotation: XsdAnnotation, context: NamespaceModel): void {
        // do nothing
    }
    visitXsdRedefine(xredefine: XsdRedefine, context: NamespaceModel): void {
        this.log(`Redefine not supported`);
    }
    visitXsdInclude(xinclude: XsdInclude, context: NamespaceModel): void {
        if (fs.existsSync(xinclude.schemaLocation)) {
            const partText = fs.readFileSync(xinclude.schemaLocation, 'utf-8');
            const part = xs.deserialize(partText, XsdSchema);
            this.collectDefinitions(part, context);
        } else {
            this.log(`Failed to obtain included schema part ${xinclude.schemaLocation}`);
        }
    }
    visitXsdImport(ximport: XsdImport, context: NamespaceModel): void {
        const model = this.getSchema(ximport.namespace, ximport.schemaLocation);
        if (model) {
            context.references.set(ximport.namespace, model);
        }
    }
    
    visitXsdTopLevelElement(xelement: XsdTopLevelElement, context: NamespaceModel): void {
        context.elements.set(xelement.name, xelement);
    }
    visitXsdTopLevelAttribute(xattribute: XsdTopLevelAttribute, context: NamespaceModel): void {
        context.attributes.set(xattribute.name, xattribute);
    }
    visitXsdNotation(xnotation: XsdNotation, context: NamespaceModel): void {
        // do nothing
    }
    visitXsdTopLevelSimpleType(xsimpleType: XsdTopLevelSimpleType, context: NamespaceModel): void {
        context.simpleTypes.set(xsimpleType.name, xsimpleType);
    }
    visitXsdTopLevelComplexType(xcomplexType: XsdTopLevelComplexType, context: NamespaceModel): void {
        context.createComplexType(xcomplexType.name, xcomplexType, xcomplexType.abstract, xcomplexType.final, xcomplexType.block);
    }
    visitXsdNamedGroup(xnamedGroup: XsdNamedGroup, context: NamespaceModel): void {
        const sdc = this;
        xnamedGroup.particle.apply(new class implements IXsdNamedGroupParticleVisitor<undefined,  void>{
            visitAllGroupParticle(all: XsdNamedAllParticleGroup, arg: undefined): void {
                sdc.log('\"all\" named group not supported');
            }
            visitChoiceGroupParticle(choice: XsdSimpleExplicitChoiceGroup, arg: undefined): void {
                context.createChoiceGroup(xnamedGroup.name, choice);
            }
            visitSequenceGroupParticle(seq: XsdSimpleExplicitSequenceGroup, arg: undefined): void {
                context.createSequenceGroup(xnamedGroup.name, seq);
            }
        }, undefined);
    }
    visitXsdNamedAttributeGroup(xnamedAttrsGroup: XsdNamedAttributeGroup, context: NamespaceModel): void {
        context.attributeGroups.set(xnamedAttrsGroup.name, xnamedAttrsGroup);
    }
}

class SourceModelBuilder {
    private _log: IndentedStringBuilder;
    private _collector: SchemaDefinitionsCollector;

    public constructor(log: IndentedStringBuilder) {
        this._log = log;
        this._collector = new SchemaDefinitionsCollector(log);
    }

    public import(xsdFilePath: string, outFilePart: string, typeNamePrefix: string) : void{
        this._collector.importXsdFromFile(outFilePart, xsdFilePath, typeNamePrefix);
    }        

    public doWork() {
        // try {
            const nss = this._collector.doWork();

            const annotations = require('./annotations');
            const importStmt = `import { ${Object.keys(annotations).join(', ')} } from './annotations';\n\n`;

            for (const ns of nss) {
                // try {
                    const q = new LinkedQueue<FixupOperation>();
                    ns.allModels.flatMap(m => m.getDelayedOperations()).forEach(op => q.enqueue(op));
                    while (q.count > 0) {
                        q.dequeue()?.().forEach(o => q.enqueue(o));
                    }

                    const unit = this.translateNsModel(ns);

                    const text = TsSourceTextBuilder.format(unit);
                    
                    fs.writeFileSync(ns.outputFileName, importStmt + text, 'utf-8');

                    console.log(`${ns.outputFileName} written.`);
                // } catch (e) {
                //     console.error(`Error generating XML document model for namespace '${ns.schema.targetNamespace}' ('${ns.inputFileName}' --> '${ns.outputFileName}')\n${e}`);
                // }
            }
        // } catch (e) {
        //     console.error(`Error preparing XML document model generation\n${e}`);
        // }
    }

    private translateNsModel(ns: NamespaceModel) : TsSourceUnit {
        const unit = new TsSourceUnit(ns.outputFileName); 
        // const modelByTypeName = new Map<string, ComplexTypeClassModel>();

        for (const m of ns.allModels) {
            m.implementDefinitions(unit);
        }

        return unit;
    }

    public static collect(ns: XmlDataModel): TsSourceUnit {
        throw new Error('SourceModelBuilder not implemented');
    }
}

export interface XmlModelGeneratorSpec {
    xsdFilePath: string;
    outFilePath: string;
    typeNamePrefix: string;
}

export default {
    generateXmlModelTypes: (spec: XmlModelGeneratorSpec) : void => {

        const log = new IndentedStringBuilder();
        const smb = new SourceModelBuilder(log);
        smb.import(spec.xsdFilePath, spec.outFilePath, spec.typeNamePrefix);
        smb.doWork();

        console.log(log.stringify());
    }
};
