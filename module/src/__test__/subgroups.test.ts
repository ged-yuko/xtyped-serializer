import { makeInstanceOf } from '../utils';
import { XmlRoot, XmlAttribute, XmlComplexType, XmlElement, CtorOf, XmlChoice, XmlElementsGroup, XmlElementsGroupEntry, XmlAttributesGroup, XmlAttributesGroupEntry } from '../annotations';
import xs from '../serializer'

@XmlAttributesGroup()
class Attrs {
    @XmlAttribute()
    b: string;
    @XmlAttribute()
    c: string;
}

@XmlComplexType()
class X {
}

@XmlComplexType()
class  Part {
    @XmlAttribute()
    a: string;
}

@XmlComplexType()
class Subpart extends Part {
    @XmlAttributesGroupEntry({ctor: () => Attrs})
    attrs: Attrs
}


@XmlElementsGroup()
class ElsSubgroup {
    @XmlElement({type: {ctor: () => Part}})
    part: Part;
    @XmlElement({type: {ctor: () => Subpart}})
    subpart: Subpart;
 }

@XmlElementsGroup()
class ElsGroup {
    @XmlElement({type: {ctor: () => Part}})
    part: Part;
    @XmlElementsGroupEntry({ctor: () => ElsSubgroup})
    subgroup: ElsSubgroup;
    @XmlElement({type: {ctor: () => Subpart}})
    subpart: Subpart;
}

@XmlRoot({name: 'r'})
class Root {
    @XmlElement({type: {ctor: () => X}})
    a: X;
    @XmlElementsGroupEntry({ctor: () => ElsGroup})
    grp: ElsGroup;
    @XmlElement({type: {ctor: () => X}})
    b: X;
}

const text = `<r>
    <a />
    <part a="pX1"/>
    <part a="pX2"/>
    <subpart a="sX3" b="aY1" c="aZ1"/>
    <subpart a="sX4" b="aY2" c="aZ2"/>
    <b />
</r>`;

const model = makeInstanceOf(Root, {
    a: makeInstanceOf(X, { }),
    grp: makeInstanceOf(ElsGroup, {
         part: makeInstanceOf(Part, {
            a: 'pX1'
         }),
         subgroup: makeInstanceOf(ElsSubgroup, {
            part: makeInstanceOf(Part, {
                a: 'pX2'
             }),
             subpart: makeInstanceOf(Subpart, {
                a: 'sX3',
                attrs: makeInstanceOf(Attrs, {
                    b: 'aY1',
                    c: 'aZ1'
                })
             }),
         }),
         subpart: makeInstanceOf(Subpart, {
            a: 'sX4',
            attrs: makeInstanceOf(Attrs, {
                b: 'aY2',
                c: 'aZ2'
            })
         }),
    }),
    b: makeInstanceOf(X, { })
});


function testCase<T>(modelType: CtorOf<T>, text: string, model: T, title: string) {
    return {modelType, text, model, title};
}
const cases = [
    testCase(Root, text, model, 'subgroups')
];


for (const c of cases) {
    test('Deserialize ' + c.title, () => {
        expect(xs.deserialize<any>(c.text, c.modelType)).toEqual(c.model);
    });
    test('Serialize ' + c.title, () => {
        expect(xs.deserialize<any>(xs.serialize(c.model), c.modelType)).toEqual(c.model);
    });
}


