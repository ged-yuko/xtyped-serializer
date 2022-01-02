import { IXsdAttrsDeclsVisitor, IXsdComplexContentVisitor, IXsdComplexTypeModelVisitor, IXsdNamedGroupParticle, IXsdNamedGroupParticleVisitor, IXsdSchemaDeclarationVisitor, IXsdSchemaDefinition, IXsdSchemaDefinitionVisitor, IXsdTypeDefParticleVisitor, XsdAnnotation, XsdAttrDecls, XsdAttributeGroupRef, XsdAttributeImpl, XsdAttributeUse, XsdComplexContent, XsdComplexRestrictionType, XsdExtensionTypeImpl, XsdFormChoice, XsdImplicitComplexTypeModel, XsdImport, XsdInclude, XsdNamedAllParticleGroup, XsdNamedAttributeGroup, XsdNamedGroup, XsdNotation, XsdRedefine, XsdSchema, XsdSimpleContent, XsdSimpleExplicitChoiceGroup, XsdSimpleExplicitSequenceGroup, XsdTopLevelAttribute, XsdTopLevelComplexType, XsdTopLevelElement, XsdTopLevelSimpleType } from './xsdschema2'
import xs from './serializer'
import { ITsClassMemberVisitor, ITsExprVisitor, ITsSourceUnitMemberVisitor, ITsTypeRefVisitor, TsAnnotationsCollection, TsArrayLiteralExpr, TsArrayTypeRef, TsBooleanExpr, TsBuiltinTypeKind, TsBuiltinTypeRef, TsClassDef, TsCtorRefExpr, TsCustomTypeRef, TsEnumDef, TsExpr, TsFieldDef, TsLambdaExpr as TsLambdaExpr, TsInterfaceDef, TsMethodDef, TsMethodSignature, TsNullExpr, TsNumberExpr, TsObjLiteralExpr, TsSourceUnit, TsStringExpr, TsTypeRef, TsUndefinedExpr } from './ts-dom'
import * as fs from 'fs'
import { foreachSeparating, IndentedStringBuilder, LinkedQueue } from './utils'
import { XmlDataModel } from './content-model'
import { XmlComplexType, XmlElementsGroup, XmlAttributesGroup, XmlAttribute, XmlAttributesGroupEntry, IXmlAttributeParameters } from './annotations'


class SourceTextBuilder implements ITsSourceUnitMemberVisitor<IndentedStringBuilder, void>,
                                   ITsClassMemberVisitor<IndentedStringBuilder, void>,
                                   ITsTypeRefVisitor<IndentedStringBuilder, void>,
                                   ITsExprVisitor<IndentedStringBuilder, void> {

    private static _instance = new SourceTextBuilder();

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
            m.apply(SourceTextBuilder._instance, sb);
        }

        sb.appendLine();
        sb.appendLine();
        return sb.stringify();
    }
}

class NamespaceModel {
    public readonly complexTypes = new Map<string, XsdTopLevelComplexType>();
    public readonly simpleTypes = new Map<string, XsdTopLevelSimpleType>();
    public readonly elements = new Map<string, XsdTopLevelElement>();
    public readonly attributes = new Map<string, XsdTopLevelAttribute>();
    public readonly groups = new Map<string, XsdNamedGroup>();
    public readonly attributeGroups = new Map<string, XsdNamedAttributeGroup>();
    public readonly references = new Map<string, NamespaceModel>();

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
        context.complexTypes.set(xcomplexType.name, xcomplexType);
    }
    visitXsdNamedGroup(xnamedGroup: XsdNamedGroup, context: NamespaceModel): void {
        context.groups.set(xnamedGroup.name, xnamedGroup);
    }
    visitXsdNamedAttributeGroup(xnamedAttrsGroup: XsdNamedAttributeGroup, context: NamespaceModel): void {
        context.attributeGroups.set(xnamedAttrsGroup.name, xnamedAttrsGroup);
    }
}

class ClassModelCollector implements IXsdComplexTypeModelVisitor<number, number>,
                                     IXsdTypeDefParticleVisitor<number, number>,
                                     IXsdNamedGroupParticleVisitor<undefined, void>,
                                     IXsdAttrsDeclsVisitor<undefined, void> {
    private readonly _ns: NamespaceModel;
    private readonly _classDef: TsClassDef;

    public constructor(ns: NamespaceModel, cd: TsClassDef) {
        this._ns = ns;
        this._classDef = cd;
    }

    visitSimpleContentModel(smodel: XsdSimpleContent, index: number): number {
        console.warn('Simple content model ignored');
        return index;
    }
    visitComplexContentModel(cmodel: XsdComplexContent, index: number): number {
        // TODO expand inheritance chain
        // cmodel.content.apply(new class implements IXsdComplexContentVisitor<undefined, void> {
        //     visitComplexExtensionModel(ctext: XsdExtensionTypeImpl, index: number): number {
        //         return index;
        //     }
        //     visitComplexRestrictionModel(ctrst: XsdComplexRestrictionType, index: number): number {
        //         return index;
        //     }
        
        // }, undefined);
        // TODO implement explicit content model derived from inheritance chain
        // SourceModelBuilder.implementComplexContentPart(ctext., cd, 0);
        return index;
    }
    visitImplicitComplexTypeModel(icmodel: XsdImplicitComplexTypeModel, index: number): number {
        this.collectAttributes(icmodel.attrDecls);
        // SourceModelBuilder.implementComplexContentPart(seq, this._classDef, 0);
        
        //return icmodel.particles.apply(this, index);
        return index;
    }

    public collectComplexType(t: XsdTopLevelComplexType) {
        t.model.apply(this, 0);
    }

    public collectAttributes(attrs: XsdAttrDecls): void {
        attrs.decls.forEach(a => a.apply(this, undefined));
    }

    visitXsdAttribute(attr: XsdAttributeImpl, arg: undefined): void {
        if (attr.defRef.ref) {
            throw new Error('attr ref not implemented');
        } else if (attr.defRef.name) {
            const isOptional = attr.use === XsdAttributeUse.Optional || !attr.use;
            const fd = this._classDef.createField(attr.defRef.name, TsTypeRef.makeBuiltin(TsBuiltinTypeKind.String), isOptional);

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

    visitXsdAttributeGroupRef(groupRef: XsdAttributeGroupRef, arg: undefined): void {
        const fd = this._classDef.createField(groupRef.ref, TsTypeRef.makeCustom(groupRef.ref));
        fd.annotations.addByName(XmlAttributesGroupEntry.name, TsExpr.object([
            ['ctor', TsExpr.lambda(TsMethodSignature.nothingToUnpsecified(), TsExpr.ctorRef(groupRef.ref))]
        ]));
    }

    public collectNamedGroup(particle: IXsdNamedGroupParticle): void {
        particle.apply(this, undefined);
    }
    visitAllGroupParticle(all: XsdNamedAllParticleGroup, arg: undefined): void {
        console.error('top level all group not implemented');
    }
    visitChoiceGroupParticle(choice: XsdSimpleExplicitChoiceGroup, arg: undefined): void {
        console.error('top level choice group not implemeneted');
    }
    visitSequenceGroupParticle(seq: XsdSimpleExplicitSequenceGroup, arg: undefined): void {
        console.error('top level sequence group not implemeneted');
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
                    const unit = this.translateNsModel(ns);

                    const text = SourceTextBuilder.format(unit);
                    
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

        ns.attributeGroups.forEach(g => {
            const cd = unit.createClass(ns.makeTypeName(g.name));
            cd.annotations.addByType(XmlAttributesGroup);

            const collector = new ClassModelCollector(ns, cd);
            collector.collectAttributes(g.attrDecls);
        });
        
        ns.groups.forEach(g => {
            const cd = unit.createClass(ns.makeTypeName(g.name));
            cd.annotations.addByType(XmlElementsGroup);

            const ctcollector = new ClassModelCollector(ns, cd);
            ctcollector.collectNamedGroup(g.particle);
        });
        ns.complexTypes.forEach(t => {
            const cd = unit.createClass(ns.makeTypeName(t.name));
            cd.annotations.addByType(XmlComplexType);

            if (t.abstract || t.mixed || t.final || t.block) {
                console.error('type attributes not implemeneted');
            }
            
            const ctcollector = new ClassModelCollector(ns, cd);
            ctcollector.collectComplexType(t);
        });

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
