import { XmlComplexType, XmlRoot, XmlAttribute, XmlSimpleType, XmlEnumerationValues, XmlElement, XmlArray } from "./xml-modeling";

export interface IXsdSchemaDeclaration {
    
}

export interface IXsdSchemaDefinition {

}

//   <xs:simpleType name="formChoice" vs:nonbrowsable="true">
//     <xs:restriction base="xs:NMTOKEN">
//       <xs:enumeration value="qualified"/>
//       <xs:enumeration value="unqualified"/>
//     </xs:restriction>
//   </xs:simpleType>
export enum XsdFormChoice {
    Qualified = 'qualified',
    Unqualified = 'unqualified'
}
@XmlSimpleType({name: 'formChoice'})
class XsdFormChoiceType {
    @XmlEnumerationValues(XsdFormChoice)
    enumeration: XsdFormChoice;
}


//   <xs:element name="schema" id="schema">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-schema"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:openAttrs">
//           <xs:sequence>
//             <xs:choice minOccurs="0" maxOccurs="unbounded">
//               <xs:element ref="xs:include"/>
//               <xs:element ref="xs:import"/>
//               <xs:element ref="xs:redefine"/>
//               <xs:element ref="xs:annotation"/>
//             </xs:choice>
//             <xs:sequence minOccurs="0" maxOccurs="unbounded">
//               <xs:group ref="xs:schemaTop"/>
//               <xs:element ref="xs:annotation" minOccurs="0" maxOccurs="unbounded"/>
//             </xs:sequence>
//           </xs:sequence>
//           <xs:attribute name="targetNamespace" type="xs:anyURI"/>
//           <xs:attribute name="version" type="xs:token"/>
//           <xs:attribute name="finalDefault" type="xs:fullDerivationSet" use="optional" default=""/>
//           <xs:attribute name="blockDefault" type="xs:blockSet" use="optional" default=""/>
//           <xs:attribute name="attributeFormDefault" type="xs:formChoice" use="optional" default="unqualified"/>
//           <xs:attribute name="elementFormDefault" type="xs:formChoice" use="optional" default="unqualified"/>
//           <xs:attribute name="id" type="xs:ID"/>
//           <xs:attribute ref="xml:lang"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
@XmlRoot({name: 'schema'})
export class XsdSchema { // extends XsdOpenAttrs {
    @XmlAttribute()
    targetNamespace: string;
    @XmlAttribute()
    version: string;
    @XmlAttribute()
    finalDefault?: string;
    @XmlAttribute()
    blockDefault?: string;
    @XmlAttribute({type: {ctor: () => XsdFormChoiceType}})
    attributeFormDefault?: XsdFormChoice;
    @XmlAttribute({type: {ctor: () => XsdFormChoiceType}})
    elementFormDefault?: XsdFormChoice;
    @XmlAttribute()
    id: string;
    @XmlAttribute()
    lang: string;

    @XmlArray({order: 0})      
    @XmlElement({name:'include'})
    @XmlElement({name:'import'})
    @XmlElement({name:'redefine'})
    @XmlElement({name:'annotation'})
    declarations = new Array<IXsdSchemaDeclaration>();

    @XmlArray({order: 1})
    @XmlElement({name: 'annotation'})
    @XmlElement({name: 'element'})
    @XmlElement({name: 'attribute'})
    @XmlElement({name: 'notation'})
    @XmlElement({name: 'complexType'})
    @XmlElement({name: 'simpleType'})
    @XmlElement({name: 'group'})
    @XmlElement({name: 'attributeGroup'})
    definitions = new Array<IXsdSchemaDefinition>();
}
//
//     <xs:key name="element">
//       <xs:selector xpath="xs:element"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="attribute">
//       <xs:selector xpath="xs:attribute"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="type">
//       <xs:selector xpath="xs:complexType|xs:simpleType"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="group">
//       <xs:selector xpath="xs:group"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="attributeGroup">
//       <xs:selector xpath="xs:attributeGroup"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="notation">
//       <xs:selector xpath="xs:notation"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//     <xs:key name="identityConstraint">
//       <xs:selector xpath=".//xs:key|.//xs:unique|.//xs:keyref"/>
//       <xs:field xpath="@name"/>
//     </xs:key>
//
//   </xs:element>
