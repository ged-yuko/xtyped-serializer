import { IXsdAttrsDeclsVisitor, IXsdComplexContentVisitor, IXsdComplexTypeModelVisitor, IXsdLocalType, IXsdNamedGroupParticle, IXsdNamedGroupParticleVisitor, IXsdNestedParticle, IXsdNestedParticleVisitor, IXsdSchemaDeclarationVisitor, IXsdSchemaDefinition, IXsdSchemaDefinitionVisitor, IXsdTopLevelElementLocalType, IXsdTypeDefParticle, IXsdTypeDefParticleVisitor, XsdAllImpl, XsdAnnotation, XsdAny, XsdAttrDecls, XsdAttributeGroup, XsdAttributeGroupRef, XsdAttributeImpl, XsdAttributeUse, XsdComplexContent, XsdComplexRestrictionType, XsdComplexType, XsdExplicitChoiceGroupImpl, XsdExplicitSequenceGroupImpl, XsdExtensionTypeImpl, XsdFormChoice, XsdGroupRef, XsdImplicitComplexTypeModel, XsdImport, XsdInclude, XsdLocalComplexType, XsdLocalElement, XsdNamedAllParticleGroup, XsdNamedAttributeGroup, XsdNamedGroup, XsdNotation, XsdOccursAttrGroup, XsdRedefine, XsdSchema, XsdSimpleContent, XsdSimpleExplicitChoiceGroup, XsdSimpleExplicitSequenceGroup, XsdTopLevelAttribute, XsdTopLevelComplexType, XsdTopLevelElement, XsdTopLevelSimpleType } from './xsdschema'
import xs from './serializer'
import { ITsClassMemberVisitor, ITsExprVisitor, ITsSourceUnitMemberVisitor, ITsTypeRefVisitor, TsAnnotationsCollection, TsArrayLiteralExpr, TsArrayTypeRef, TsBooleanExpr, TsBuiltinTypeKind, TsBuiltinTypeRef, TsClassDef, TsCtorRefExpr, TsCustomTypeRef, TsEnumDef, TsExpr, TsFieldDef, TsLambdaExpr as TsLambdaExpr, TsInterfaceDef, TsMethodDef, TsMethodSignature, TsNullExpr, TsNumberExpr, TsObjLiteralExpr, TsSourceUnit, TsStringExpr, TsTypeRef, TsUndefinedExpr, TsGenericParameterDef } from './ts-dom'
import * as ts from 'typescript'
import * as fs from 'fs'
import { foreachSeparating, IndentedStringBuilder, LinkedQueue } from './utils'
import { XmlDataModel, XmlElementChoiceGroupModel } from './content-model'
import { XmlComplexType, XmlElementsGroup, XmlAttributesGroup, XmlAttribute, XmlAttributesGroupEntry, IXmlAttributeParameters, XmlElementsGroupEntry, XmlElement, XmlRoot } from './annotations'

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

    private formatGenericParams(genericParams: ReadonlyArray<TsGenericParameterDef>|undefined, sb: IndentedStringBuilder): void {
        if (genericParams && genericParams.length > 0) {
            sb.append('<');
            foreachSeparating(genericParams, p => { 
                sb.append(p.name);
                if (p.baseTypes) {
                    sb.append(' extends ');
                    foreachSeparating(p.baseTypes, r => r.apply(this, sb), () => sb.append(', '));
                }
            }, () => sb.append(', '));
            sb.append('>');
        }
    }

    private formatMethodHead(name: string, signature: TsMethodSignature, sb: IndentedStringBuilder): void {
        sb.append(name).append('(')
        this.formatGenericParams(signature.genericParams, sb);
        if (signature.parameters) {
            foreachSeparating(signature.parameters, p => { sb.append(p.name).append(': '); p.paramType.apply(this, sb); }, () => sb.append(', '));
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
        sb.append('export interface ').append(ifaceDef.name);
        this.formatGenericParams(ifaceDef.genericParams, sb);
        sb.appendLine(' {').push();
        for (const m of ifaceDef.members) {
            this.formatMethodHead(m.name, m.signature, sb);
            sb.appendLine(';');
        }
        sb.pop().appendLine('}').appendLine();
    }
    visitClassDef(classDef: TsClassDef, sb: IndentedStringBuilder): void {
        this.formatAnnotations(classDef.annotations, sb);
        sb.append('export class ').append(classDef.name);
        this.formatGenericParams(classDef.genericParams, sb);
        sb.appendLine(' {').push();
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
        sb.append('"').append(str.value?.replace('"', '\\"') ?? '').append('"');  // TODO replaceAll?
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
    name: string;
}

abstract class DefinitionTypesModel {
    private _delayedOperationsCollected = false;

    public constructor(
        public readonly context: NamespaceModel
    ) {
    }

    public implementDefinitions(unit: TsSourceUnit) : void {
        this.implementDefinitionsImpl(unit);
    }

    protected abstract implementDefinitionsImpl(unit: TsSourceUnit) : void;

    public getDelayedOperations() : FixupOperations {
        if (this._delayedOperationsCollected) {
            return [];
        } else {
            this._delayedOperationsCollected = true;
            return this.getDelayedOperationsImpl();
        }
    }
    
    protected getDelayedOperationsImpl() : FixupOperations { return []; } 
}

class ChoiceGroupIfaceModel extends DefinitionTypesModel implements IGroupModel {
    private _alternatives = new Array<ClassModel>();

    public constructor(
        context: NamespaceModel,
        public readonly name: string,
        private readonly definition: XsdExplicitChoiceGroupImpl|XsdSimpleExplicitChoiceGroup
    ) {
        super(context);
    }

    protected override implementDefinitionsImpl(unit: TsSourceUnit) : void {
        // TODO watch for implementing types

        const argType = TsTypeRef.makeCustom('T');
        const retType = TsTypeRef.makeCustom('TRet');
        const genParams = [argType.name, retType.name];

        const vifaceDef = unit.createGenericInterface(this.name + 'Visitor', genParams);
        for (const c of this._alternatives) {
            vifaceDef.createMethodOf(`visit${c.name}`, [
                ['obj', TsTypeRef.makeCustom(c.name)],
                ['arg', argType]
            ], retType);
        }

        const ifaceDef = unit.createInterface(this.name);
        ifaceDef.createGenericMethodOf('apply', genParams, [
            ['visitor', TsTypeRef.makeCustom(vifaceDef.name, [argType, retType])],
            ['arg', argType]
        ], retType);
    }
}

abstract class ClassFieldModel {
    public constructor(
        public readonly name: string,
        private readonly itemOccurs: XsdOccursAttrGroup,
        protected readonly itemTypeRef: TsTypeRef
    ) {
    }

    public implement(classDef: TsClassDef) : void {
        const min = this.itemOccurs.min ?? 1;
        const max = this.itemOccurs.max ?? 1;

        let itemTypeRef = max === 1 ? this.itemTypeRef : TsTypeRef.makeArray(this.itemTypeRef);
        let isOptional = min === 0 && max === 1;

        const fieldDef = classDef.createField(this.name, itemTypeRef, isOptional);
        return this.implementImpl(fieldDef);
    }

    protected abstract implementImpl(classDef: TsFieldDef) : void;

    protected makeOccursAnnotationParams() : [string, TsExpr][] {
        const arr = new Array<[string, TsExpr]>();
        if (this.itemOccurs.min) {
            arr.push(['minOccurs', TsExpr.literalFromExample(this.itemOccurs.min)]);
        }
        if (this.itemOccurs.max) {
            arr.push(['minOccurs', TsExpr.literalFromExample(this.itemOccurs.max)]);
        }
        return arr;
    }
}
class ClassAttributeFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly attrDef: XsdAttributeImpl,
        public readonly topLevelDef?: XsdTopLevelAttribute
    ) {
        super(name, { min: attrDef.use === XsdAttributeUse.Optional ? 0 : 1 }, TsTypeRef.makeBuiltin(TsBuiltinTypeKind.String)); // TODO simple types
    }
    
    protected override implementImpl(fieldDef: TsFieldDef) : void {
        const attr = this.attrDef;
        const isOptional = attr.use === XsdAttributeUse.Optional || !attr.use;

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
        fieldDef.annotations.addByName(XmlAttribute.name, aargs);
    }
}
class ClassAttributeGroupFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly groupRef: XsdAttributeGroupRef,
        public readonly groupModel: IGroupModel
    ) {
        super(name, { }, TsTypeRef.makeCustom(groupModel.name));
    }
    
    protected override implementImpl(fieldDef: TsFieldDef) : void {
        fieldDef.annotations.addByName(XmlAttributesGroupEntry.name, TsExpr.object([
            ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(this.groupModel.name))]
        ]));
    }
}
class ClassLocalElementFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly element: XsdLocalElement,
        public readonly topLevelelement: XsdTopLevelElement|undefined,
        public readonly elementModel: ComplexTypeClassModel
    ) {
        super(name, element.occurs, TsTypeRef.makeCustom(elementModel.name));
    }
    
    protected override implementImpl(fieldDef: TsFieldDef) : void {
        fieldDef.annotations.addByName(XmlElement.name, TsExpr.object([
            ['type', TsExpr.object([
                ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(this.elementModel.name))]
            ])],
            ... this.makeOccursAnnotationParams()
        ]));
    }
}
class ClassElementsGroupFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly groupRefOrSeq: XsdGroupRef|XsdExplicitSequenceGroupImpl,
        public readonly groupModel: IGroupModel
    ) {
        super(name, groupRefOrSeq.occurs, TsTypeRef.makeCustom(groupModel.name));
    }
    
    protected override implementImpl(fieldDef: TsFieldDef) : void {
        fieldDef.annotations.addByName(XmlElementsGroupEntry.name, TsExpr.object([
            ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(this.groupModel.name))]
        ]));
    }
}
class ClassElementsChoiceFieldModel extends ClassFieldModel {
    public constructor(
        name: string,
        public readonly choiceDef: XsdExplicitChoiceGroupImpl,
        public readonly choiceModel: IGroupModel
    ) {
        super(name, choiceDef.occurs, TsTypeRef.makeCustom(choiceModel.name));
    }
    
    protected override implementImpl(fieldDef: TsFieldDef) : void {
        // TODO pre-resolve all type refs and generate a number of annotations each for possible member instance type

        // TODO generalize typeref-able annotations implementation

        // fieldDef.annotations.addByName(XmlElementsGroupEntry.name, TsExpr.object([
        //     ['type', TsExpr.object([
        //         ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(this.seqModel.name))]
        //     ])],
        //     ... this.makeOccursAnnotationParams()
        // ]));
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
        public readonly name: string,
        protected readonly abstract: boolean
    ) {
        super(context);
    }

    protected registerField(fieldModel: ClassFieldModel) : ClassFieldModel {
        console.log(`registering field '${fieldModel.name}' for type '${this.name}' of '${fieldModel.constructor.name}' kind`);
        if (this._fields.get(fieldModel.name)) {
            throw new Error(`Field '${fieldModel.name}' already registered in type '${this.name}'`);
        } else {
            this._fields.set(fieldModel.name, fieldModel);
        }
        return fieldModel;
    }
    
    protected dispatchAttributeDefinitions(attrDecls: XsdAttrDecls) : FixupOperations {
        return attrDecls.decls.flatMap(attrPart => attrPart.apply(new class implements IXsdAttrsDeclsVisitor<ClassModel, FixupOperations> {
            visitXsdAttribute(attr: XsdAttributeImpl, me: ClassModel): FixupOperations {
                if (attr.defRef.ref) {
                    const topLevelAttr = me.context.attributes.get(attr.defRef.ref);
                    if (topLevelAttr) {
                        me.registerField(new ClassAttributeFieldModel(topLevelAttr.name, attr, topLevelAttr));
                    } else {
                        console.error('missing top level attr reference');
                    }
                } else if (attr.defRef.name) {
                    me.registerField(new ClassAttributeFieldModel(attr.defRef.name, attr));
                } else {
                    console.error('invalid attr def');
                }
                return [];
            }
            visitXsdAttributeGroupRef(groupRef: XsdAttributeGroupRef, me: ClassModel): FixupOperations {
                const topLevelGroup = me.context.attributeGroups.get(groupRef.ref);
                if (topLevelGroup) {
                    me.registerField(new ClassAttributeGroupFieldModel(groupRef.ref, groupRef, topLevelGroup));
                } else {
                    console.error('missing top level group reference ' + groupRef.ref);
                }
                return [];
            }
        }, this));
    }

    protected dispatchExplicitNestedMembers(part: IXsdNestedParticle) : FixupOperations {
        return part.apply(new class implements IXsdNestedParticleVisitor<ClassModel, FixupOperations> {
            visitLocalElement(localElement: XsdLocalElement, me: ClassModel): FixupOperations {
                if (localElement.defRef.ref) {
                    const topLevelElement = me.context.elements.get(localElement.defRef.ref);
                    if (topLevelElement) {
                        const elementModel = me.context.obtainElementTypeModel(me.name, topLevelElement.typeName ?? topLevelElement.name, topLevelElement.localType);
                        me.registerField(new ClassLocalElementFieldModel(localElement.defRef.ref, localElement, topLevelElement, elementModel));
                        return elementModel.getDelayedOperations();
                    } else {
                        console.error('missing top level element def ' + localElement.defRef.ref);
                        return [];
                    }
                } else if (localElement.defRef.name) {
                    const elementModel = me.context.obtainElementTypeModel(me.name, localElement.typeName ?? localElement.defRef.name, localElement.localType);
                    me.registerField(new ClassLocalElementFieldModel(localElement.defRef.name, localElement, undefined, elementModel));
                    return elementModel.getDelayedOperations();
                } else {
                    console.error('invalid element def');
                    return [];
                }
            }
            visitAnyElement(anyElement: XsdAny, me: ClassModel): FixupOperations {
                throw new Error('nested any element part not implemented.')
            }
            visitGroupRef(groupRef: XsdGroupRef, me: ClassModel): FixupOperations {
                const topLevelGroup = me.context.groups.get(groupRef.ref);
                if (topLevelGroup) {
                    me.registerField(new ClassElementsGroupFieldModel(groupRef.ref, groupRef, topLevelGroup));
                } else {
                    console.error('missing top level grop def ' + groupRef.ref);
                }
                return [];
            }
            visitChoiceGroup(choiceGroup: XsdExplicitChoiceGroupImpl, me: ClassModel): FixupOperations {
                const num =  me._fields.size;
                const choiceModel = me.context.createChoiceGroup(me.name + 'Choice' + num, choiceGroup);
                me.registerField(new ClassElementsChoiceFieldModel('choice' + num, choiceGroup, choiceModel));
                return choiceModel.getDelayedOperations();
            }
            visitSequenceGroup(seqGroup: XsdExplicitSequenceGroupImpl, me: ClassModel): FixupOperations {
                if (seqGroup.occurs.max ?? 1 > 1) {
                    const num =  me._fields.size;
                    const groupModel = me.context.createSequenceGroup(me.name + 'ContentGroup' + num, seqGroup);
                    me.registerField(new ClassElementsGroupFieldModel('contentGroup' + num, seqGroup, groupModel));
                    return groupModel.getDelayedOperations();
                } else {
                    return seqGroup.particles.flatMap(p => me.dispatchExplicitNestedMembers(p));
                }
            }
        }, this);
    }

    protected override implementDefinitionsImpl(unit: TsSourceUnit) : void {
        const baseClassRef = this._baseTypeModel ? TsTypeRef.makeCustom(this._baseTypeModel.name) : undefined;
        const ifaceRefs = this._choiceIfaces.map(i => TsTypeRef.makeCustom(i.name));

        const classDef = unit.createClass(this.name, baseClassRef, ... ifaceRefs);
        this._fields.forEach((fmodel) => fmodel.implement(classDef));

        // this.definition.mixed
        // TODO implement visitor application method if needed

        this.implementDefinitionAnnotations(classDef);
    }

    protected abstract implementDefinitionAnnotations(classDef: TsClassDef) : void;
}

class AttributeGroupClassModel extends ClassModel implements IGroupModel {
    public constructor(
        context: NamespaceModel,
        name: string,
        private readonly definition: XsdNamedAttributeGroup
    ) {
        super(context, name, false);
    }

    protected override getDelayedOperationsImpl() : FixupOperations { 
        return this.dispatchAttributeDefinitions(this.definition.attrDecls);
    } 

    protected override implementDefinitionAnnotations(classDef: TsClassDef) : void {
        classDef.annotations.addByType(XmlAttributesGroup);
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
        return this.definition.particles.flatMap(p => this.dispatchExplicitNestedMembers(p));
    } 

    protected override implementDefinitionAnnotations(classDef: TsClassDef) : void {
        classDef.annotations.addByType(XmlElementsGroup);
    }
}

enum InheritanceMode {
    None,
    Extension,
    Restriction
}

class ComplexTypeClassModel extends ClassModel {
    private readonly _rootElementDefs = new Array<XsdTopLevelElement>();

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

    public registerRootElement(el: XsdTopLevelElement) {
        this._rootElementDefs.push(el);
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
                        return me.dispatchExplicitMembers(ctext.base, InheritanceMode.Extension, ctext.particle, ctext.attrDecls);
                    }
                    visitComplexRestrictionModel(ctrst: XsdComplexRestrictionType, me: ComplexTypeClassModel): FixupOperations {
                        return me.dispatchExplicitMembers(ctrst.base, InheritanceMode.Restriction, ctrst.particle, ctrst.attrDecls);
                    }
                }, me);
            }
            visitSimpleContentModel(smodel: XsdSimpleContent, me: ComplexTypeClassModel): FixupOperations {
                return [];
            }
            visitImplicitComplexTypeModel(icmodel: XsdImplicitComplexTypeModel, me: ComplexTypeClassModel): FixupOperations {
                return me.dispatchExplicitMembers(undefined, InheritanceMode.None, icmodel.particle, icmodel.attrDecls);
            }
        }, this);
    }

    private dispatchExplicitMembers(baseComplexTypeName: string|undefined, inheritanceMode: InheritanceMode, particle: IXsdTypeDefParticle|undefined, attrDecls: XsdAttrDecls) : FixupOperations {
        if (baseComplexTypeName) {
            this._baseTypeModel = this.context.complexTypes.get(baseComplexTypeName);
            this._inheritanceMode = inheritanceMode;
        }
        
        return [ 
            // TODO extract it to superclass, consider attribute group model
            this.dispatchAttributeDefinitions(attrDecls),
            // TODO extract it to superclass, consider elements group
            particle?.apply(new class implements IXsdTypeDefParticleVisitor<ComplexTypeClassModel, FixupOperations> {
                visitSequenceGroup(seqGroup: XsdExplicitSequenceGroupImpl, me: ComplexTypeClassModel): FixupOperations {
                    return me.dispatchExplicitNestedMembers(seqGroup);
                }
                visitChoiceGroup(choiceGroup: XsdExplicitChoiceGroupImpl, me: ComplexTypeClassModel): FixupOperations {
                    return me.dispatchExplicitNestedMembers(choiceGroup);
                }
                visitAllGroup(allGroup: XsdAllImpl, me: ComplexTypeClassModel): FixupOperations {
                    console.error('explicit all part not supported');
                    return [];
                }
                visitGroupRef(groupRef: XsdGroupRef, me: ComplexTypeClassModel): FixupOperations {
                    return me.dispatchExplicitNestedMembers(groupRef);
                }
            }, this) ?? []
        ].flat();
    }

    protected override implementDefinitionAnnotations(classDef: TsClassDef) : void {
        classDef.annotations.addByType(XmlComplexType);

        for (const el of this._rootElementDefs) {
            classDef.annotations.addByType(XmlRoot, [{name: el.name, namespace: this.context.schema.targetNamespace}]);
        }
    }
}

class NamespaceModel {
    public readonly complexTypes = new Map<string, ComplexTypeClassModel>();
    public readonly simpleTypes = new Map<string, XsdTopLevelSimpleType>();
    public readonly elements = new Map<string, XsdTopLevelElement>();
    public readonly attributes = new Map<string, XsdTopLevelAttribute>();
    public readonly groups = new Map<string, IGroupModel>();
    public readonly attributeGroups = new Map<string, IGroupModel>();
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
    
    public obtainElementTypeModel(contextName: string, complexTypeName: string, localType?: IXsdTopLevelElementLocalType|IXsdLocalType) : ComplexTypeClassModel {
        if (localType) {
            complexTypeName = complexTypeName ?? (contextName + 'Content');
            if (this.complexTypes.get(complexTypeName)) {
                complexTypeName = contextName + '_' + complexTypeName;
            }
            if (this.complexTypes.get(complexTypeName)) {
                console.warn('TODO: resolve generated type name conflicts');  // TODO: resolve generated type name conflicts'
            }
            
            if (localType instanceof XsdLocalComplexType) {
                const fakeComplexType = new XsdComplexType();
                fakeComplexType.annotation = localType.annotation;
                fakeComplexType.id = localType.id;
                fakeComplexType.mixed = localType.mixed;
                fakeComplexType.model = localType.model;
                fakeComplexType.rawNode = localType.rawNode;

                const model = this.createComplexType(complexTypeName, fakeComplexType, false, '', '');
                return model;
            } else {
                throw new Error('unsupported local type kind'); // TODO fix local type visitor
            }
        } else {
            const model = this.complexTypes.get(complexTypeName);
            if (model) {
                return model;
            } else {
                throw new Error('unknown top level complex type ' + complexTypeName);
            }
        }
    }

    public createComplexType(name: string, definition: XsdComplexType, abstract: boolean, final: string, block: string) : ComplexTypeClassModel {
        const model = new ComplexTypeClassModel(this, this.makeTypeName(name), definition, abstract, final, block);
        this.complexTypes.set(name, model);
        this.allModels.push(model);
        return model;
    }

    public createSequenceGroup(name: string, seq: XsdExplicitSequenceGroupImpl|XsdSimpleExplicitSequenceGroup) : SeqGroupClassModel {
        const model = new SeqGroupClassModel(this, this.makeTypeName(name), seq);
        this.groups.set(name, model);
        this.allModels.push(model);
        return model;
    }

    public createChoiceGroup(name: string, seq: XsdExplicitChoiceGroupImpl|XsdSimpleExplicitChoiceGroup) : ChoiceGroupIfaceModel {
        const model = new ChoiceGroupIfaceModel(this, this.makeTypeName(name), seq);
        this.groups.set(name, model);
        this.allModels.push(model);
        return model;
    }

    public createAttributeGroup(xnamedAttrsGroup: XsdNamedAttributeGroup) : AttributeGroupClassModel {
        const model = new AttributeGroupClassModel(this, this.makeTypeName(xnamedAttrsGroup.name), xnamedAttrsGroup);
        this.attributeGroups.set(xnamedAttrsGroup.name, model);
        this.allModels.push(model);
        return model;
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
        // console.log(JSON.stringify(schema, undefined, '  '));
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

        context.elements.forEach(el => {
            const typeModel = context.obtainElementTypeModel(el.name, el.typeName, el.localType);
            typeModel.registerRootElement(el);
        });
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
        context.createAttributeGroup(xnamedAttrsGroup);
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
