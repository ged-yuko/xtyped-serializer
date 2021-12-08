import { XsdSchema } from './xsdschema2'
import xs from './serializer'
import * as ts from './ts-dom'
import { foreachSeparating, IndentedStringBuilder } from './utils'
import { XmlNamespaceModel } from './content-model'


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

class ContentModelBuilder {

    public static collect(schema: XsdSchema): XmlNamespaceModel[] {
        throw new Error('ContentModelBuilder not implemented');
    }
}

class SourceModelBuilder {

    public static collect(ns: XmlNamespaceModel): ts.TsSourceUnit {
        throw new Error('SourceModelBuilder not implemented');
    }
}

export default {
    // schemaText: xsdschemaText,
    generate: (schemaText: string) : string => {
        const schema = xs.deserialize(schemaText, XsdSchema);
        const models = ContentModelBuilder.collect(schema);
        const sources = models.map(m => SourceModelBuilder.collect(m));
        const sourceText = sources.map(s => SourceTextBuilder.format(s)).join('');
        return sourceText;
    }
};
