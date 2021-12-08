import { XmlRoot, XmlAttribute, XmlComplexType, XmlElement, IDefaultCtor, ICtor } from '../annotations';
import xs from '../serializer'
import g from '../mapping-generator'
import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { XmlNamespaceModel } from 'content-model';
import { isArrayInstanceOf } from 'utils';

const simpleXsdText = `
<?xml version="1.0" encoding="utf-8" ?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

    <xs:element name="nx">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="part1" type="X" />
                <xs:element name="part2" type="Y" />
            </xs:sequence>
            <xs:attribute name="attr1" type="xs:string" />
            <xs:attribute name="attr2" type="xs:string" />
        </xs:complexType>
    </xs:element>

    <xs:complexType name="X">
        <xs:attribute name="a" type="xs:string" />
    </xs:complexType>

    <xs:complexType name="Y">
        <xs:attribute name="b" type="xs:string" />
    </xs:complexType>

</xs:schema>
`;

const simpleXmlText = `
<nx attr1="A1" attr2="A2">
    <part1 a="p1aV" />
    <part2 b="p2bV" />
</nx>`;

@XmlComplexType()
class X {
    @XmlAttribute()
    a: string;
}

@XmlComplexType()
class Y {
    @XmlAttribute()
    b: string;
}

@XmlRoot({name: 'nx'})
class Root {
    @XmlAttribute()
    attr1: string;
    @XmlAttribute()
    attr2: string;

    @XmlElement({order: 1, name: 'part1', type: {ctor: ()=>X}})
    part1: X;
    @XmlElement({order: 2, name: 'part2', type: {ctor: ()=>Y}})
    part2: Y;
}

function makeInstanceOf<T>(ctor: ICtor<T>, data: Required<T>) : T {
    return Object.assign(new ctor(), data);
}
const simpleXmlModel = makeInstanceOf(Root, {
    attr1: 'A1',
    attr2: 'A2',
    part1: makeInstanceOf(X, { a: 'p1aV' }),
    part2: makeInstanceOf(Y, { b: 'p2bV' }),
});

function parseAnnotatedModelText(fname: string, text: string): XmlNamespaceModel {
    const tsAst = ts.createSourceFile(fname, text, ts.ScriptTarget.Latest);

    // ts.factory.createIdentifier(
    // const ifaceNodes = tsAst.getChildren().filter(n => ts.isInterfaceDeclaration(n));// as ts.InterfaceDeclaration[];

    const ifa = ts.factory.createInterfaceDeclaration(undefined, undefined, 'ifaceName', undefined, undefined, 
        ['m1', 'm2'].map(s => ts.factory.createMethodSignature(undefined, s, undefined, undefined, [ts.factory.createParameterDeclaration(undefined, undefined, undefined, 'x')], undefined))
    );
    
    const resultFile = ts.createSourceFile("someFileName.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printNode(ts.EmitHint.Unspecified, ifa, resultFile);
    console.warn(result);
    
    throw new Error('not implemented');
}

test('POC deserialize', () => {
    expect(xs.deserialize(simpleXmlText, Root)).toEqual(simpleXmlModel);
});
test('POC serialize', () => {
    expect(xs.deserialize(xs.serialize(simpleXmlModel), Root)).toEqual(simpleXmlModel);
});
test('POC generator', () => {
    const fname = 'test.xsd';
    // const text = fs.readFileSync(fname, 'utf8');
    // const tsModelText = g.generate(simpleXsdText);
    const generatedModel = parseAnnotatedModelText(fname, '');
    // const givenSimpleModel = XmlNamespaceModel.makeForType(Root);
    // expect(generatedModel).toEqual(givenSimpleModel);
});
