import { IXsdSchemaDeclarationVisitor, IXsdSchemaDefinition, IXsdSchemaDefinitionVisitor, XsdAnnotation, XsdImport, XsdInclude, XsdNamedAttributeGroup, XsdNamedGroup, XsdNotation, XsdRedefine, XsdSchema, XsdTopLevelAttribute, XsdTopLevelComplexType, XsdTopLevelElement, XsdTopLevelSimpleType } from './xsdschema2'
import xs from './serializer'
import * as fs from 'fs'
import * as ts from './ts-dom'
import { foreachSeparating, IndentedStringBuilder, LinkedQueue } from './utils'
import { XmlDataModel } from './content-model'
import { XmlComplexType } from 'annotations'


class SourceTextBuilder implements ts.ITsSourceUnitMemberVisitor<IndentedStringBuilder, void>,
                                   ts.ITsClassMemberVisitor<IndentedStringBuilder, void>,
                                   ts.ITsTypeRefVisitor<IndentedStringBuilder, void> {

    private static _instance = new SourceTextBuilder();

    private constructor() {
    }

    visitBuiltinTypeRef(builtinTypeRef: ts.TsBuiltinTypeRef, sb: IndentedStringBuilder): void {
        sb.append(builtinTypeRef.kind);
    }
    visitArrayTypeRef(arrayTypeRef: ts.TsArrayTypeRef, sb: IndentedStringBuilder): void {
        sb.append('Array').append('<');
        arrayTypeRef.elementType.apply(this, sb);
        sb.append('>');
    }
    visitCustomTypeRef(customTypeRef: ts.TsCustomTypeRef, sb: IndentedStringBuilder): void {
        sb.append(customTypeRef.name);
        if (customTypeRef.genericArgs) {
            foreachSeparating(customTypeRef.genericArgs, p => p.apply(this, sb), () => sb.append(', '));
        }
    }

    private formatMethodHead(name: string, signature: ts.TsMethodSignature, sb: IndentedStringBuilder): void {
        sb.append(name).append('(')
        foreachSeparating(signature.paramTypes, p => p.apply(this, sb), () => sb.append(', '));
        sb.append('): ');
        signature.returnType.apply(this, sb);
    }

    visitMethodDef(methodDef: ts.TsMethodDef, sb: IndentedStringBuilder): void {
        // this.formatMethodHead(methodDef.name, methodDef.signature, sb);
        // sb.appendLine(';');
        throw new Error('Method definition formatting not implemented');
    }
    visitFieldDef(fieldDef: ts.TsFieldDef, sb: IndentedStringBuilder): void {
        sb.append(fieldDef.name);
        
        if (fieldDef.fieldType) {
            sb.append(': ');
            fieldDef.fieldType.apply(this, sb);
        }

        sb.appendLine(';');
    }
    
    visitInterfaceDef(ifaceDef: ts.TsInterfaceDef, sb: IndentedStringBuilder): void {
        sb.appendLine(`export interface ${ifaceDef.name} {`).push();
        for (const m of ifaceDef.members) {
            this.formatMethodHead(m.name, m.signature, sb);
            sb.appendLine(';');
        }
        sb.pop().appendLine('}');
    }
    visitClassDef(classDef: ts.TsClassDef, sb: IndentedStringBuilder): void {
        sb.appendLine(`export class ${classDef.name} {`).push();
        for (const m of classDef.members) {
            if (m.access) {
                sb.append(m.access).append(' ');
            }
            m.apply(this, sb);
        }
        sb.pop().appendLine('}');
    }
    visitEnumDef(enumDef: ts.TsEnumDef, sb: IndentedStringBuilder): void {
        sb.appendLine(`export enum ${enumDef.name} {`).push();
        for (const m of enumDef.members) {
            if (m.value) {
                sb.append(`${m.name} = ${m.value.format()}`);
            } else {
                sb.append(m.name);
            }
            sb.appendLine(',');
        }
        sb.pop().appendLine('}');
    }

    public static format(unit: ts.TsSourceUnit): string {
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
}

class SchemaDefinitionsCollector implements IXsdSchemaDeclarationVisitor<NamespaceModel, void>, IXsdSchemaDefinitionVisitor<NamespaceModel, void> {

    private _nsByName = new Map<string, NamespaceModel>();
    private _queue = new LinkedQueue<NamespaceModel>();

    constructor() {
    }

    public importXsdFromFile(outputFilePath: string, xsdFilePath: string, typeNamePrefix?: string) : NamespaceModel {
        const schemaText = fs.readFileSync(xsdFilePath, 'utf-8');
        return this.importXsdText(outputFilePath, schemaText, xsdFilePath, typeNamePrefix);
    }

    public importXsdText(outputFilePath: string, xsdSchemaText: string, xsdFilePath?: string, typeNamePrefix?: string) : NamespaceModel {
        const schema = xs.deserialize(xsdSchemaText, XsdSchema);
        const info = new NamespaceModel(schema, outputFilePath, xsdFilePath, typeNamePrefix);
        this._nsByName.set(schema.targetNamespace, info);
        this._queue.enqueue(info);
        return info;
    }
    
    private getSchema(ns: string, location?: string) : NamespaceModel {
        const info = this._nsByName.get(ns);
        if (info) {
            return info;
        } else if (location) {
            if (fs.existsSync(location)) {
                return this.importXsdFromFile('', location);
            } else {
                throw new Error(`Failed to obtain schema '${ns}' from '${location}'`);
            }
        } else {
            throw new Error(`Failed to obtain schema '${ns}'`);
        }
    }

    public doWork() : NamespaceModel[] {
        let schemaInfo = this._queue.dequeue();
        const result = new Array<NamespaceModel>();
        while (schemaInfo) {
            this.collectDefinitions(schemaInfo.schema, schemaInfo);
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
        throw new Error(`Redefine not supported`);
    }
    visitXsdInclude(xinclude: XsdInclude, context: NamespaceModel): void {
        if (fs.existsSync(xinclude.schemaLocation)) {
            const partText = fs.readFileSync(xinclude.schemaLocation, 'utf-8');
            const part = xs.deserialize(partText, XsdSchema);
            this.collectDefinitions(part, context);
        } else {
            throw new Error(`Failed to obtain included schema part ${xinclude.schemaLocation}`);
        }
    }
    visitXsdImport(ximport: XsdImport, context: NamespaceModel): void {
        const model = this.getSchema(ximport.namespace, ximport.schemaLocation);
        context.references.set(ximport.namespace, model);
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

class SourceModelBuilder {

    public constructor() {
    }

    public doWork() {
        const collector = new SchemaDefinitionsCollector();
        const nss = collector.doWork();

        

    }

    private translateNsModel(ns: NamespaceModel) : ts.TsSourceUnit {
        const unit = new ts.TsSourceUnit(ns.outputFileName);
        
        ns.groups.forEach(g => {
            const cd = unit.createClass(ns.typeNamePrefix + g.name);
            
        });
        ns.complexTypes.forEach(t => {
            const cd = unit.createClass(ns.typeNamePrefix + t.name);
            cd.createAnnotation(XmlComplexType.name);
        });

        return unit;
    }


    public static collect(ns: XmlDataModel): ts.TsSourceUnit {
        throw new Error('SourceModelBuilder not implemented');
    }
}


export default {
    // schemaText: xsdschemaText,
    generate: (schemaText: string) : string => {
       
        /*
        const schema = xs.deserialize(schemaText, XsdSchema);
        const models = ContentModelBuilder.collect(schema);
        const sources = models.map(m => SourceModelBuilder.collect(m));
        const sourceText = sources.map(s => SourceTextBuilder.format(s)).join('');
        */
        const xsd = xs.deserialize(schemaText, XsdSchema);
        // console.warn(JSON.stringify(xsd, null, '  '));
        // fs.writeFileSync(".\\out.json", JSON.stringify(xsd, null, '  '));
        const sourceText = xs.serialize(xsd);
        return sourceText;
    }
};
