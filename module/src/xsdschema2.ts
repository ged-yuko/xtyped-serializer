import { XmlComplexType, XmlRoot, XmlAttribute, XmlSimpleType, XmlEnumerationValues, XmlElement, XmlChoice, XmlElementsGroup, XmlElementsGroupEntry } from "./annotations";


//   <xs:group name="redefinable">
//     <xs:choice>
//       <xs:element ref="xs:simpleType"/>
//       <xs:element ref="xs:complexType"/>
//       <xs:element ref="xs:group"/>
//       <xs:element ref="xs:attributeGroup"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdRedefinable {
    // TODO IXsdRedefinable
}

//   <xs:group name="schemaTop">
//     <xs:choice>
//       <xs:group ref="xs:redefinable"/>
//       <xs:element ref="xs:element"/>
//       <xs:element ref="xs:attribute"/>
//       <xs:element ref="xs:notation"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdSchemaTop extends IXsdRedefinable {
    // TODO IXsdSchemaTop
}

//   <xs:group name="identityConstraint">
//     <xs:choice>
//       <xs:element ref="xs:unique"/>
//       <xs:element ref="xs:key"/>
//       <xs:element ref="xs:keyref"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdIdentityContraint {
}

//   <xs:group name="complexTypeModel">
//     <xs:choice>
//       <xs:element ref="xs:simpleContent" minOccurs="0"/>
//       <xs:element ref="xs:complexContent" minOccurs="0"/>
//       <xs:sequence>
//         <xs:group ref="xs:typeDefParticle" minOccurs="0"/>
//         <xs:group ref="xs:attrDecls"/>
//       </xs:sequence>
//     </xs:choice>
//   </xs:group>
export interface XsdComplexTypeModel {
}

//   <xs:element name="annotation" id="annotation">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-annotation"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:openAttrs">
//           <xs:choice minOccurs="0" maxOccurs="unbounded">
//             <xs:element ref="xs:appinfo"/>
//             <xs:element ref="xs:documentation"/>
//           </xs:choice>
//           <xs:attribute name="id" type="xs:ID"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({ name: 'annotation' })
export class XsdAnnotation { // extends XsdOpenAttrs {
    // TODO XsdAnnotation
}


//   <xs:complexType name="localComplexType">
//     <xs:complexContent>
//       <xs:restriction base="xs:complexType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:complexTypeModel"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="prohibited"/>
//         <xs:attribute name="abstract" use="prohibited"/>
//         <xs:attribute name="final" use="prohibited"/>
//         <xs:attribute name="block" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
export class XsdLocalComplexType {
    
    @XmlElement({order: 1})
    annotation: XsdAnnotation;

    @XmlElement({order: 2})
    @XmlElement({name: 'simpleContent'})
    @XmlElement({name: 'complexContent'})
    @XmlElementsGroupEntry({name: 'complexTypeModel'})
    model: XsdComplexTypeModel;

    @XmlAttribute()
    mixed: boolean = false;
}

//   <xs:element name="element" type="xs:topLevelElement" id="element">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-element"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="topLevelElement">
//     <xs:complexContent>
//       <xs:restriction base="xs:element">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
//           </xs:choice>
export interface IXsdTopLevelElementLocalType {
    // TODO IXsdTopLevelElementLocalType
}
//           <xs:group ref="xs:identityConstraint" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="ref" use="prohibited"/>
//         <xs:attribute name="form" use="prohibited"/>
//         <xs:attribute name="minOccurs" use="prohibited"/>
//         <xs:attribute name="maxOccurs" use="prohibited"/>
//         <xs:attribute name="name" use="required" type="xs:NCName"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelElement'})
export class XsdTopLevelElement implements IXsdSchemaTop {

    @XmlElement({order: 1, name: 'annotation', type: { ctor: () => XsdAnnotation }})
    annotation: XsdAnnotation;

    @XmlElement({order: 2})
    @XmlElement({name: 'simpleType', type: { ctor: () => XsdLocalComplexType }})
    @XmlElement({name: 'complexType'})
    type: IXsdTopLevelElementLocalType;

    @XmlChoice({order: 3})
    @XmlElement({name: 'unique'})
    @XmlElement({name: 'key'})
    @XmlElement({name: 'keyref'})
    identityConstraints = new Array<IXsdIdentityContraint>();

    // TODO XsdTopLevelElement dependencies

    @XmlAttribute({name: 'type'})
    typeName: string;
    @XmlAttribute()
    substitutionGroup: string;
    @XmlAttribute()
    default: string;
    @XmlAttribute()
    fixed: string;
    @XmlAttribute()
    nillable: boolean = false;
    @XmlAttribute()
    abstract: boolean = false;
    @XmlAttribute()
    // final: derivationSet;
    // @XmlAttribute()
    // block: blockSet;
    @XmlAttribute()
    name: string;
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
export interface IXsdSchemaDeclaration {
    // TODO IXsdSchemaDeclaration
}
//             <xs:sequence minOccurs="0" maxOccurs="unbounded">
//               <xs:group ref="xs:schemaTop"/>
//               <xs:element ref="xs:annotation" minOccurs="0" maxOccurs="unbounded"/>
//             </xs:sequence>
export interface IXsdSchemaDefinition extends IXsdSchemaTop {
    // TODO IXsdSchemaDefinition
}
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
    // TODO XsdSchema dependencies

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

    @XmlChoice({order: 1})      
    @XmlElement({name:'include'})
    @XmlElement({name:'import'})
    @XmlElement({name:'redefine'})
    @XmlElement({name:'annotation'})
    declarations = new Array<IXsdSchemaDeclaration>();

    @XmlChoice({order: 2})
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
