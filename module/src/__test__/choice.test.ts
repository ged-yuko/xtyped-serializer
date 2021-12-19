import { makeInstanceOf } from '../utils';
import { XmlRoot, XmlAttribute, XmlComplexType, XmlElement, CtorOf, XmlChoice } from '../annotations';
import xs from '../serializer'


interface I {
}
@XmlComplexType()
class X implements I {
    @XmlAttribute()
    a: string;
}
@XmlComplexType()
class Y implements I {
    @XmlAttribute()
    b: string;
}

@XmlRoot({name: 'r'})
class RootOnePart {
    @XmlChoice()
    @XmlElement({name: 'x', type: {ctor: () => X}})
    @XmlElement({name: 'y', type: {ctor: () => Y}})
    part: I;
}

@XmlRoot({name: 'r'})
class RootManyParts {
    @XmlChoice({minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'x', type: {ctor: () => X}})
    @XmlElement({name: 'y', type: {ctor: () => Y}})
    parts = new Array<I>();
}

@XmlRoot({name: 'r'})
class RootManyPartsNoChoice {
    @XmlElement({name: 'x', minOccurs: 3, maxOccurs: 5, type: {ctor: () => X}})
    xx = new Array<X>();
    @XmlElement({name: 'y', minOccurs: 0, maxOccurs: 'unbounded', type: {ctor: () => Y}})
    yy = new Array<Y>();
}


const rootOne1Text = `<r><x a="A"/></r>`;
const rootOne2Text = `<r><y b="B"/></r>`;
const rootManyText = `<r>
    <x a="A1"/>
    <y b="B2"/>
    <x a="A3"/>
    <x a="A4"/>
    <y b="B5"/>
</r>`;
const rootNoChoiceText = `<r>
<x a="A1"/>
<x a="A2"/>
<x a="A3"/>
<x a="A4"/>
<x a="A5"/>
<y b="B6"/>
<y b="B7"/>
<y b="B8"/>
<y b="B9"/>
</r>`;


const rootOne1Model = makeInstanceOf(RootOnePart, {
    part: makeInstanceOf(X, { a: 'A' })
});
const rootOne2Model = makeInstanceOf(RootOnePart, {
    part: makeInstanceOf(Y, { b: 'B' })
});
const rootManyModel = makeInstanceOf(RootManyParts, {
    parts: [
        makeInstanceOf(X, { a: 'A1' }),
        makeInstanceOf(Y, { b: 'B2' }),
        makeInstanceOf(X, { a: 'A3' }),
        makeInstanceOf(X, { a: 'A4' }),
        makeInstanceOf(Y, { b: 'B5' }),
    ]
});
const rootNoChoiceModel = makeInstanceOf(RootManyPartsNoChoice, {
    xx: [
        makeInstanceOf(X, { a: 'A1' }),
        makeInstanceOf(X, { a: 'A2' }),
        makeInstanceOf(X, { a: 'A3' }),
        makeInstanceOf(X, { a: 'A4' }),
        makeInstanceOf(X, { a: 'A5' }),
    ],
    yy: [
        makeInstanceOf(Y, { b: 'B6' }),
        makeInstanceOf(Y, { b: 'B7' }),
        makeInstanceOf(Y, { b: 'B8' }),
        makeInstanceOf(Y, { b: 'B9' }),
    ]
});


function testCase<T>(modelType: CtorOf<T>, text: string, model: T, title: string) {
    return {modelType, text, model, title};
}
const cases = [
    testCase(RootOnePart, rootOne1Text, rootOne1Model, 'choice one part case 1'),
    testCase(RootOnePart, rootOne2Text, rootOne2Model, 'choice one part case 2'),
    testCase(RootManyParts, rootManyText, rootManyModel, 'choice multiple parts'),
    testCase(RootManyPartsNoChoice, rootNoChoiceText, rootNoChoiceModel, 'no choice but occurences')
];


for (const c of cases) {
    test('Deserialize ' + c.title, () => {
        expect(xs.deserialize<any>(c.text, c.modelType)).toEqual(c.model);
    });
    test('Serialize ' + c.title, () => {
        expect(xs.deserialize<any>(xs.serialize(c.model), c.modelType)).toEqual(c.model);
    });
}


