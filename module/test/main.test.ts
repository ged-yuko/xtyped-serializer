import { XmlRoot, XmlAttribute, XmlComplexType, XmlElement, IDefaultCtor, ICtor } from './../src/annotations';
import xs from './../src/serializer'

const simpleXmlText = `<nx attr1="A1" attr2="A2">
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

    // @XmlElement(0)
    // part: Part;
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

test('POC deserialize', () => {
    expect(xs.deserialize(simpleXmlText, Root)).toEqual(simpleXmlModel);
});
test('POC serialize', () => {
    expect(xs.deserialize(xs.serialize(simpleXmlModel), Root)).toEqual(simpleXmlModel);
});
