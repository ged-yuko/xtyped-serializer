import { XmlRoot, XmlAttribute, XmlElement, XmlComplexType, XmlSimpleType, XmlEnumerationValues } from "./xml-modeling";

// XmlAttributeGroup, XmlElementGroup, XmlInclude, XmlAttributeGroupRef

/*

// TODO: introduce choice group interfaces  {
    
// XsdTypeDefParticleChoiceGroup
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:all"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>

// interface XsdNestedParticleChoiceGroup {
//       <xs:element name="element" type="xs:localElement"/>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//       <xs:element ref="xs:any"/>


// interface XsdParticleChoiceGroup {
//       <xs:element name="element" type="xs:localElement"/>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:all"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//       <xs:element ref="xs:any"/>


// XsdComplexTypeModelChoiceGroup
//       <xs:element ref="xs:simpleContent" minOccurs="0"/>
//       <xs:element ref="xs:complexContent" minOccurs="0"/>

// }


// <?xml version="1.0" encoding="utf-8"?>
// <!-- 
// Copyright © 2001 World Wide Web Consortium, (Massachusetts Institute of 
// Technology, European Research Consortium for Informatics and Mathematics,
// Keio University). All Rights Reserved. This work is distributed under
// the W3C® Software License [1] .  
 
// [1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
 
// Portions © 2004-2007 Microsoft Corporation.  All rights reserved.  
//   This file was derived from http://www.w3.org/2001/XMLSchema.xsd.
  
//   Change History: April 4th 2007
//   1) Remove DTD since the XML Editor does not need DTD portion and since this is unnecessary 
//      overhead in XML processing this was removed. 
//   2) Make schemaLocation on <xs:import namespace="http://www.w3.org/XML/1998/namespace"> 
//      relative so that editor uses the local copy of xml.xsd. 
//   3) Add minOccurs="0" to simpleContent and complexContent in complexTypeModel group
//   4) Remove xpath pattern facets and replace them with simpleType xs:string since the patterns 
//      were failing some of the XSD schema test suites and also create performance probems
//   5) Remove hpf:hasFacet and hpf:hasProperty appInfos since XML editor does not recognize them anyway.
//   6) Add vs:nonbrowsable="true" attributes on simpleTypes that should not be prompted in XSD intellisense
//   6) Removed xs:documentation since it is not localized.
//   7) Reformatted the document.
//   8) Reverted (2) since the local copy would be taken anyway and having schemaLocation creates a problem
//      when other schemas in the same schema collection include or import a different version of xml.xsd.
// -->

// <!-- XML Schema schema for XML Schemas: Part 1: Structures -->
// <!-- Note this schema is NOT the normative structures schema. -->
// <!-- The prose copy in the structures REC is the normative -->
// <!-- version (which shouldn't differ from this one except for -->
// <!-- this comment and entity expansions, but just in case -->
// <xs:schema targetNamespace="http://www.w3.org/2001/XMLSchema" blockDefault="#all" elementFormDefault="qualified" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xml:lang="EN" 
//            xmlns:vs="http://schemas.microsoft.com/Visual-Studio-Intellisense">

//   <xs:import namespace="http://www.w3.org/XML/1998/namespace"/>

type XsdAnySimpleType = string;

//   <xs:group name="schemaTop">
//     <xs:choice>
//       <xs:group ref="xs:redefinable"/>
//       <xs:element ref="xs:element"/>
//       <xs:element ref="xs:attribute"/>
//       <xs:element ref="xs:notation"/>
//     </xs:choice>
//   </xs:group>
export interface XsdSchemaTopChoiceGroup extends XsdRedefinableChoiceGroup {
}
export interface XsdSchemaTopChoiceVisitor extends XsdRedefinableChoiceVisitor {
}

//   <xs:group name="redefinable">
//     <xs:choice>
//       <xs:element ref="xs:simpleType"/>
//       <xs:element ref="xs:complexType"/>
//       <xs:element ref="xs:group"/>
//       <xs:element ref="xs:attributeGroup"/>
//     </xs:choice>
//   </xs:group>
export interface XsdRedefinableChoiceGroup {
}
export interface XsdRedefinableChoiceVisitor {
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
@XmlSimpleType('formChoice')
class XsdFormChoiceType {
    @XmlEnumerationValues(XsdFormChoice)
    enumeration: XsdFormChoice;
}

//   <xs:simpleType name="derivationControl" vs:nonbrowsable="true">
//     <xs:restriction base="xs:NMTOKEN">
//       <xs:enumeration value="substitution"/>
//       <xs:enumeration value="extension"/>
//       <xs:enumeration value="restriction"/>
//       <xs:enumeration value="list"/>
//       <xs:enumeration value="union"/>
//     </xs:restriction>
//   </xs:simpleType>
export enum XsdDerivationControl {
    Substitution = 'substitution',
    Extension = 'extension',
    Restriction = 'restriction',
    List = 'list',
    Union = 'union'
}
@XmlSimpleType('derivationControl')
class XsdDerivationControlType {
    @XmlEnumerationValues(XsdDerivationControl)
    enumeration: XsdDerivationControl;
}

//   <xs:simpleType name="reducedDerivationControl" vs:nonbrowsable="true">
//     <xs:restriction base="xs:derivationControl">
//       <xs:enumeration value="extension"/>
//       <xs:enumeration value="restriction"/>
//     </xs:restriction>
//   </xs:simpleType>
export enum XsdReducedDerivationControl {
    Extension = 'extension',
    Restriction = 'restriction'
}
@XmlSimpleType('reducedDerivationControl')
class XsdReducedDerivationControlType {
    @XmlEnumerationValues(XsdReducedDerivationControl)
    enumeration: XsdReducedDerivationControl;
}

//   <xs:simpleType name="derivationSet" vs:nonbrowsable="true">
//     <xs:union>
//       <xs:simpleType>
//         <xs:restriction base="xs:token">
//           <xs:enumeration value="#all"/>
//         </xs:restriction>
//       </xs:simpleType>
//       <xs:simpleType>
//         <xs:list itemType="xs:reducedDerivationControl"/>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdDerivationSet = XsdToken;

//   <xs:simpleType name="typeDerivationControl" vs:nonbrowsable="true">
//     <xs:restriction base="xs:derivationControl">
//       <xs:enumeration value="extension"/>
//       <xs:enumeration value="restriction"/>
//       <xs:enumeration value="list"/>
//       <xs:enumeration value="union"/>
//     </xs:restriction>
//   </xs:simpleType>
export enum XsdTypeDerivationControl {
    Extension = 'extension',
    Restriction = 'restriction',
    List = 'list',
    Union = 'union'
}
@XmlSimpleType('typeDerivationControl')
class XsdTypeDerivationControlType {
    @XmlEnumerationValues(XsdTypeDerivationControl)
    enumeration: XsdTypeDerivationControl;
}

//   <xs:simpleType name="fullDerivationSet" vs:nonbrowsable="true">
//     <xs:union>
//       <xs:simpleType>
//         <xs:restriction base="xs:token">
//           <xs:enumeration value="#all"/>
//         </xs:restriction>
//       </xs:simpleType>
//       <xs:simpleType>
//         <xs:list itemType="xs:typeDerivationControl"/>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdfullDerivationSet = XsdToken | XsdTypeDerivationControl;

//   <xs:simpleType name="allNNI" vs:nonbrowsable="true">
//     <xs:union memberTypes="xs:nonNegativeInteger">
//       <xs:simpleType>
//         <xs:restriction base="xs:NMTOKEN">
//           <xs:enumeration value="unbounded"/>
//         </xs:restriction>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdAllNNI = XsdNMTOKEN;

//   <xs:attributeGroup name="occurs">
//     <xs:attribute name="minOccurs" type="xs:nonNegativeInteger" use="optional" default="1"/>
//     <xs:attribute name="maxOccurs" type="xs:allNNI" use="optional" default="1"/>
//   </xs:attributeGroup>
@XmlAttributeGroup({ name: 'occurs' })
export class XsdOccursAttrGroup {
    @XmlAttribute('minOccurs')
    min: number = 1;
    @XmlAttribute('maxOccurs')
    max: number = 1;
}

//   <xs:attributeGroup name="defRef">
//     <xs:attribute name="name" type="xs:NCName" vs:snippet="yes"/>
//     <xs:attribute name="ref" type="xs:QName"/>
//   </xs:attributeGroup>
@XmlAttributeGroup({ name: 'defRef' })
export class XsdDefRefAttrGroup {
    @XmlAttribute()
    name: string;
    @XmlAttribute()
    ref: string;
}

//   <xs:group name="typeDefParticle">
//     <xs:choice>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:all"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//     </xs:choice>
//   </xs:group>
export interface XsdTypeDefParticleChoiceGroup {
}
export interface XsdTypeDefParticleChoiceVisitor {
}

//   <xs:group name="nestedParticle">
//     <xs:choice>
//       <xs:element name="element" type="xs:localElement"/>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//       <xs:element ref="xs:any"/>
//     </xs:choice>
//   </xs:group>
export interface XsdNestedParticleChoiceGroup {
}
export interface XsdNestedParticleChoiceVisitor {
}

//   <xs:group name="particle">
//     <xs:choice>
//       <xs:element name="element" type="xs:localElement"/>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:all"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//       <xs:element ref="xs:any"/>
//     </xs:choice>
//   </xs:group>
export interface XsdParticleChoiceGroup {
    
}
export interface XsdParticleChoiceVisitor {
    
}

//   <xs:element name="attribute" type="xs:topLevelAttribute" id="attribute">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-attribute"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="topLevelAttribute">
//     <xs:complexContent>
//       <xs:restriction base="xs:attribute">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:element name="simpleType" minOccurs="0" type="xs:localSimpleType"/>
//         </xs:sequence>
//         <xs:attribute name="ref" use="prohibited"/>
//         <xs:attribute name="form" use="prohibited"/>
//         <xs:attribute name="use" use="prohibited"/>
//         <xs:attribute name="name" use="required" type="xs:NCName"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelAttribute'})
export class XsdTopLevelAttribute implements XsdSchemaTopChoiceGroup {
    @XmlElement()
    simpleType?: XsdLocalSimpleType;
}

//   <xs:group name="attrDecls">
//     <xs:sequence>
//       <xs:choice minOccurs="0" maxOccurs="unbounded">
//         <xs:element name="attribute" type="xs:attribute"/>
//         <xs:element name="attributeGroup" type="xs:attributeGroupRef"/>
//       </xs:choice>
//       <xs:element ref="xs:anyAttribute" minOccurs="0"/>
//     </xs:sequence>
//   </xs:group>
@XmlElementGroup({name: 'attrsDecl'})
export class XsdAttrsDeclElementGroup {
    @XmlElement(0, 'attribute', {type: () => XsdAttribute})
    @XmlElement(0, 'attributeGroup', {type: () => XsdAttributeGroupRef})
    members = new Array<XsdAttrsDeclGroupMemberChoiceGroup>();

    anyAttribute = new Array<XsdWildcard>();
}
export interface XsdAttrsDeclGroupMemberChoiceGroup {
}
export interface XsdAttrsDeclGroupMemberChoiceVisitor {
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
export interface XsdComplexTypeModelChoiceGroup {
}
export interface XsdComplexTypeModelChoiceVisitor {
}
export class XsdComplexTypeImplicitModel implements XsdComplexTypeModelChoiceGroup {
}

//   <xs:complexType name="simpleRestrictionType">
//     <xs:complexContent>
//       <xs:restriction base="xs:restrictionType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:group ref="xs:simpleRestrictionModel"/>
//           </xs:choice>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'simpleRestrictionType'})
export class XsdSimpleRestrictionType extends XsdRestrictionType {

}

//   <xs:complexType name="simpleExtensionType">
//     <xs:complexContent>
//       <xs:restriction base="xs:extensionType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'simpleExtensionType'})
export class XsdSimpleExtensionType extends XsdExtensionType {

}

//   <xs:simpleType name="blockSet" vs:nonbrowsable="true">
//     <xs:union>
//       <xs:simpleType>
//         <xs:restriction base="xs:token">
//           <xs:enumeration value="#all"/>
//         </xs:restriction>
//       </xs:simpleType>
//       <xs:simpleType>
//         <xs:list>
//           <xs:simpleType>
//             <xs:restriction base="xs:derivationControl">
//               <xs:enumeration value="extension"/>
//               <xs:enumeration value="restriction"/>
//               <xs:enumeration value="substitution"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:list>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdBlockSet = XsdToken | XsdDerivationControl;

//   <xs:group name="allModel">
//     <xs:sequence>
//       <xs:element ref="xs:annotation" minOccurs="0"/>
//       <xs:choice minOccurs="0" maxOccurs="unbounded">
//         <xs:element name="element" type="xs:narrowMaxMin"/>
//       </xs:choice>
//     </xs:sequence>
//   </xs:group>
@XmlElementGroup({name: 'allModel'})
export class XsdAllModelElementGroup {
    annotation: XsdAnnotation;
}

//   <xs:complexType name="narrowMaxMin">
//     <xs:complexContent>
//       <xs:restriction base="xs:localElement">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
//           </xs:choice>
//           <xs:group ref="xs:identityConstraint" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="minOccurs" use="optional" default="1">
//           <xs:simpleType>
//             <xs:restriction base="xs:nonNegativeInteger">
//               <xs:enumeration value="0"/>
//               <xs:enumeration value="1"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//         <xs:attribute name="maxOccurs" use="optional" default="1">
//           <xs:simpleType>
//             <xs:restriction base="xs:allNNI">
//               <xs:enumeration value="0"/>
//               <xs:enumeration value="1"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="all">
//     <xs:complexContent>
//       <xs:restriction base="xs:explicitGroup">
//         <xs:group ref="xs:allModel"/>
//         <xs:attribute name="minOccurs" use="optional" default="1">
//           <xs:simpleType>
//             <xs:restriction base="xs:nonNegativeInteger">
//               <xs:enumeration value="0"/>
//               <xs:enumeration value="1"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//         <xs:attribute name="maxOccurs" use="optional" default="1">
//           <xs:simpleType>
//             <xs:restriction base="xs:allNNI">
//               <xs:enumeration value="1"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:element name="all" id="all" type="xs:all">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-all"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="choice" type="xs:explicitGroup" id="choice">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-choice"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="sequence" type="xs:explicitGroup" id="sequence">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-sequence"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:simpleType name="namespaceList" vs:nonbrowsable="true">
//     <xs:union>
//       <xs:simpleType>
//         <xs:restriction base="xs:token">
//           <xs:enumeration value="##any"/>
//           <xs:enumeration value="##other"/>
//         </xs:restriction>
//       </xs:simpleType>
//       <xs:simpleType>
//         <xs:list>
//           <xs:simpleType>
//             <xs:union memberTypes="xs:anyURI">
//               <xs:simpleType>
//                 <xs:restriction base="xs:token">
//                   <xs:enumeration value="##targetNamespace"/>
//                   <xs:enumeration value="##local"/>
//                 </xs:restriction>
//               </xs:simpleType>
//             </xs:union>
//           </xs:simpleType>
//         </xs:list>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdNamespaceList = XsdToken;

//   <xs:complexType name="attributeGroup" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:attrDecls"/>
//         <xs:attributeGroup ref="xs:defRef"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:element name="attributeGroup" type="xs:namedAttributeGroup" id="attributeGroup">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-attributeGroup"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="namedAttributeGroup">
//     <xs:complexContent>
//       <xs:restriction base="xs:attributeGroup">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="required" type="xs:NCName"/>
//         <xs:attribute name="ref" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'namedAttributeGroup'})
export class XsdNamedAttributeGroup extends XsdAttributeGroup implements XsdRedefinableChoiceGroup, XsdSchemaTopChoiceGroup {
    @XmlAttribute()
    name: string;
}

//   <xs:complexType name="attributeGroupRef">
//     <xs:complexContent>
//       <xs:restriction base="xs:attributeGroup">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//         </xs:sequence>
//         <xs:attribute name="ref" use="required" type="xs:QName"/>
//         <xs:attribute name="name" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'attributeGroupRef'})
export class XsdAttributeGroupRef extends XsdAttributeGroup implements XsdAttrsDeclGroupMemberChoiceGroup {
    @XmlAttribute()
    ref: string;
}

//   <xs:notation name="XMLSchemaStructures" public="structures" system="http://www.w3.org/2000/08/XMLSchema.xsd"/>
//   <xs:notation name="XML" public="REC-xml-19980210" system="http://www.w3.org/TR/1998/REC-xml-19980210"/>

//   <xs:complexType name="anyType" mixed="true">
//     <xs:sequence>
//       <xs:any minOccurs="0" maxOccurs="unbounded" processContents="lax"/>
//     </xs:sequence>
//     <xs:anyAttribute processContents="lax"/>
//   </xs:complexType>
@XmlComplexType({name: 'anyType'})
export class XsdAnyType {  
}

//   <xs:simpleType name="string" id="string">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#string"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="preserve" id="string.preserve"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdString = XsdAnySimpleType;

//   <xs:simpleType name="boolean" id="boolean">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#boolean"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse" fixed="true"
//         id="boolean.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdBoolean = XsdAnySimpleType;

//   <xs:simpleType name="float" id="float">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#float"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse" fixed="true"
//         id="float.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdFloat = XsdAnySimpleType;

//   <xs:simpleType name="double" id="double">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#double"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="double.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdDouble = XsdAnySimpleType;

//   <xs:simpleType name="decimal" id="decimal">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#decimal"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="decimal.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdDecimal = XsdAnySimpleType;

//   <xs:simpleType name="duration" id="duration">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#duration"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="duration.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdDuration = XsdAnySimpleType;

//   <xs:simpleType name="dateTime" id="dateTime">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#dateTime"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="dateTime.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdDateTime = XsdAnySimpleType;

//   <xs:simpleType name="time" id="time">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#time"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="time.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdTime = XsdAnySimpleType;

//   <xs:simpleType name="date" id="date">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#date"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="date.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdDate = XsdAnySimpleType;

//   <xs:simpleType name="gYearMonth" id="gYearMonth">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#gYearMonth"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="gYearMonth.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdGYearMonth = XsdAnySimpleType;

//   <xs:simpleType name="gYear" id="gYear">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#gYear"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="gYear.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdGYear = XsdAnySimpleType;

//   <xs:simpleType name="gMonthDay" id="gMonthDay">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#gMonthDay"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse" fixed="true"
//              id="gMonthDay.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdGMonthDay = XsdAnySimpleType;

//   <xs:simpleType name="gDay" id="gDay">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#gDay"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//              id="gDay.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdGDay = XsdAnySimpleType;

//   <xs:simpleType name="gMonth" id="gMonth">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#gMonth"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//              id="gMonth.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdGMonth = XsdAnySimpleType;

//   <xs:simpleType name="hexBinary" id="hexBinary">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#binary"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse" fixed="true"
//         id="hexBinary.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdHexBinary = XsdAnySimpleType;

//   <xs:simpleType name="base64Binary" id="base64Binary">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#base64Binary"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse" fixed="true"
//         id="base64Binary.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdBase64Binary = XsdAnySimpleType;

//   <xs:simpleType name="anyURI" id="anyURI">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#anyURI"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="anyURI.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdAnyUri = XsdAnySimpleType;

//   <xs:simpleType name="QName" id="QName">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#QName"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="QName.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdQName = XsdAnySimpleType;

//   <xs:simpleType name="NOTATION" id="NOTATION">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#NOTATION"/>
//     </xs:annotation>
//     <xs:restriction base="xs:anySimpleType">
//       <xs:whiteSpace value="collapse"  fixed="true"
//         id="NOTATION.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNOTATION = XsdAnySimpleType;

//   <xs:simpleType name="normalizedString" id="normalizedString">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#normalizedString"/>
//     </xs:annotation>
//     <xs:restriction base="xs:string">
//       <xs:whiteSpace value="replace"
//         id="normalizedString.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNormalizedString = XsdString;

//   <xs:simpleType name="token" id="token">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#token"/>
//     </xs:annotation>
//     <xs:restriction base="xs:normalizedString">
//       <xs:whiteSpace value="collapse" id="token.whiteSpace"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdToken = XsdNormalizedString;

//   <xs:simpleType name="language" id="language">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#language"/>
//     </xs:annotation>
//     <xs:restriction base="xs:token">
//       <xs:pattern value="[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*"
//                 id="language.pattern">
//       </xs:pattern>
//     </xs:restriction>
//   </xs:simpleType>
type XsdLanguage = XsdToken;

//   <xs:simpleType name="IDREFS" id="IDREFS">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#IDREFS"/>
//     </xs:annotation>
//     <xs:restriction>
//       <xs:simpleType>
//         <xs:list itemType="xs:IDREF"/>
//       </xs:simpleType>
//       <xs:minLength value="1" id="IDREFS.minLength"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdIDREFS = string;

//   <xs:simpleType name="ENTITIES" id="ENTITIES">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#ENTITIES"/>
//     </xs:annotation>
//     <xs:restriction>
//       <xs:simpleType>
//         <xs:list itemType="xs:ENTITY"/>
//       </xs:simpleType>
//       <xs:minLength value="1" id="ENTITIES.minLength"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdENTITIES = string;

//   <xs:simpleType name="NMTOKEN" id="NMTOKEN">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#NMTOKEN"/>
//     </xs:annotation>
//     <xs:restriction base="xs:token">
//       <xs:pattern value="\c+" id="NMTOKEN.pattern">
//       </xs:pattern>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNMTOKEN = XsdToken;

//   <xs:simpleType name="NMTOKENS" id="NMTOKENS">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#NMTOKENS"/>
//     </xs:annotation>
//     <xs:restriction>
//       <xs:simpleType>
//         <xs:list itemType="xs:NMTOKEN"/>
//       </xs:simpleType>
//       <xs:minLength value="1" id="NMTOKENS.minLength"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNMTOKENS = string;

//   <xs:simpleType name="Name" id="Name">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#Name"/>
//     </xs:annotation>
//     <xs:restriction base="xs:token">
//       <xs:pattern value="\i\c*" id="Name.pattern">
//       </xs:pattern>
//     </xs:restriction>
//   </xs:simpleType>
type XsdName = XsdToken;

//   <xs:simpleType name="NCName" id="NCName">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#NCName"/>
//     </xs:annotation>
//     <xs:restriction base="xs:Name">
//       <xs:pattern value="[\i-[:]][\c-[:]]*" id="NCName.pattern">
//       </xs:pattern>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNCName = XsdName;

//   <xs:simpleType name="ID" id="ID">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#ID"/>
//     </xs:annotation>
//     <xs:restriction base="xs:NCName"/>
//   </xs:simpleType>
type XsdID = XsdNCName

//   <xs:simpleType name="IDREF" id="IDREF">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#IDREF"/>
//     </xs:annotation>
//     <xs:restriction base="xs:NCName"/>
//   </xs:simpleType>
type XsdIDREF = XsdNCName;

//   <xs:simpleType name="ENTITY" id="ENTITY">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#ENTITY"/>
//     </xs:annotation>
//     <xs:restriction base="xs:NCName"/>
//   </xs:simpleType>
type XsdENTITY = XsdNCName;

//   <xs:simpleType name="integer" id="integer">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#integer"/>
//     </xs:annotation>
//     <xs:restriction base="xs:decimal">
//       <xs:fractionDigits value="0" fixed="true" id="integer.fractionDigits"/>
//       <xs:pattern value="[\-+]?[0-9]+"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdInteger = XsdDecimal;

//   <xs:simpleType name="nonPositiveInteger" id="nonPositiveInteger">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#nonPositiveInteger"/>
//     </xs:annotation>
//     <xs:restriction base="xs:integer">
//       <xs:maxInclusive value="0" id="nonPositiveInteger.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNonPositiveInteger = XsdInteger;

//   <xs:simpleType name="negativeInteger" id="negativeInteger">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#negativeInteger"/>
//     </xs:annotation>
//     <xs:restriction base="xs:nonPositiveInteger">
//       <xs:maxInclusive value="-1" id="negativeInteger.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNegativeInteger = XsdNonPositiveInteger;

//   <xs:simpleType name="long" id="long">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#long"/>
//     </xs:annotation>
//     <xs:restriction base="xs:integer">
//       <xs:minInclusive value="-9223372036854775808" id="long.minInclusive"/>
//       <xs:maxInclusive value="9223372036854775807" id="long.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdLong = XsdInteger;

//   <xs:simpleType name="int" id="int">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#int"/>
//     </xs:annotation>
//     <xs:restriction base="xs:long">
//       <xs:minInclusive value="-2147483648" id="int.minInclusive"/>
//       <xs:maxInclusive value="2147483647" id="int.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdInt = XsdLong;

//   <xs:simpleType name="short" id="short">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#short"/>
//     </xs:annotation>
//     <xs:restriction base="xs:int">
//       <xs:minInclusive value="-32768" id="short.minInclusive"/>
//       <xs:maxInclusive value="32767" id="short.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdShort = XsdInt;

//   <xs:simpleType name="byte" id="byte">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#byte"/>
//     </xs:annotation>
//     <xs:restriction base="xs:short">
//       <xs:minInclusive value="-128" id="byte.minInclusive"/>
//       <xs:maxInclusive value="127" id="byte.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdByte = XsdShort;

//   <xs:simpleType name="nonNegativeInteger" id="nonNegativeInteger">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#nonNegativeInteger"/>
//     </xs:annotation>
//     <xs:restriction base="xs:integer">
//       <xs:minInclusive value="0" id="nonNegativeInteger.minInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdNonNegativeInteger = XsdInteger;

//   <xs:simpleType name="unsignedLong" id="unsignedLong">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#unsignedLong"/>
//     </xs:annotation>
//     <xs:restriction base="xs:nonNegativeInteger">
//       <xs:maxInclusive value="18446744073709551615"
//         id="unsignedLong.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdUnsignedLong = XsdNonNegativeInteger;

//   <xs:simpleType name="unsignedInt" id="unsignedInt">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#unsignedInt"/>
//     </xs:annotation>
//     <xs:restriction base="xs:unsignedLong">
//       <xs:maxInclusive value="4294967295"
//         id="unsignedInt.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdUnsignedInt = XsdUnsignedLong;

//   <xs:simpleType name="unsignedShort" id="unsignedShort">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#unsignedShort"/>
//     </xs:annotation>
//     <xs:restriction base="xs:unsignedInt">
//       <xs:maxInclusive value="65535"
//         id="unsignedShort.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdUnsignedShort = XsdUnsignedInt;

//   <xs:simpleType name="unsignedByte" id="unsignedByte">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#unsignedByte"/>
//     </xs:annotation>
//     <xs:restriction base="xs:unsignedShort">
//       <xs:maxInclusive value="255" id="unsignedByte.maxInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdUnsignedByte = XsdUnsignedShort;

//   <xs:simpleType name="positiveInteger" id="positiveInteger">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#positiveInteger"/>
//     </xs:annotation>
//     <xs:restriction base="xs:nonNegativeInteger">
//       <xs:minInclusive value="1" id="positiveInteger.minInclusive"/>
//     </xs:restriction>
//   </xs:simpleType>
type XsdPositiveInteger = XsdNonNegativeInteger;

//   <xs:group name="simpleDerivation">
//     <xs:choice>
//       <xs:element ref="xs:restriction"/>
//       <xs:element ref="xs:list"/>
//       <xs:element ref="xs:union"/>
//     </xs:choice>
//   </xs:group>

//   <xs:simpleType name="simpleDerivationSet" vs:nonbrowsable="true">
//     <xs:union>
//       <xs:simpleType>
//         <xs:restriction base="xs:token">
//           <xs:enumeration value="#all"/>
//         </xs:restriction>
//       </xs:simpleType>
//       <xs:simpleType>
//         <xs:list>
//           <xs:simpleType>
//             <xs:restriction base="xs:derivationControl">
//               <xs:enumeration value="list"/>
//               <xs:enumeration value="union"/>
//               <xs:enumeration value="restriction"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:list>
//       </xs:simpleType>
//     </xs:union>
//   </xs:simpleType>
type XsdSimpleDerivationSet = string;

//   <xs:complexType name="simpleType" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:simpleDerivation"/>
//         <xs:attribute name="final" type="xs:simpleDerivationSet"/>
//         <xs:attribute name="name" type="xs:NCName">
//         </xs:attribute>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'simpleType'})
export abstract class XsdSimpleType {
//         <xs:group ref="xs:simpleDerivation"/>
//         <xs:attribute name="final" type="xs:simpleDerivationSet"/>
    @XmlAttribute()
    name: string;
}

//   <xs:element name="simpleType" type="xs:topLevelSimpleType" id="simpleType">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-simpleType"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="topLevelSimpleType">
//     <xs:complexContent>
//       <xs:restriction base="xs:simpleType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:simpleDerivation"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="required" type="xs:NCName">
//         </xs:attribute>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelSimpleType'}) 
export class XsdTopLevelSimpleType implements XsdRedefinableChoiceGroup, XsdSchemaTopChoiceGroup {
    @XmlAttribute()
    name: string;
}

//   <xs:complexType name="localSimpleType">
//     <xs:complexContent>
//       <xs:restriction base="xs:simpleType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:simpleDerivation"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="prohibited">
//         </xs:attribute>
//         <xs:attribute name="final" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'localSimpleType'}) 
export class XsdLocalSimpleType extends XsdSimpleType {

}

//   <xs:group name="facets">
//     <xs:choice>
//       <xs:element ref="xs:minExclusive"/>
//       <xs:element ref="xs:minInclusive"/>
//       <xs:element ref="xs:maxExclusive"/>
//       <xs:element ref="xs:maxInclusive"/>
//       <xs:element ref="xs:totalDigits"/>
//       <xs:element ref="xs:fractionDigits"/>
//       <xs:element ref="xs:length"/>
//       <xs:element ref="xs:minLength"/>
//       <xs:element ref="xs:maxLength"/>
//       <xs:element ref="xs:enumeration"/>
//       <xs:element ref="xs:whiteSpace"/>
//       <xs:element ref="xs:pattern"/>
//     </xs:choice>
//   </xs:group>

//   <xs:group name="simpleRestrictionModel">
//     <xs:sequence>
//       <xs:element name="simpleType" type="xs:localSimpleType" minOccurs="0"/>
//       <xs:group ref="xs:facets" minOccurs="0" maxOccurs="unbounded"/>
//     </xs:sequence>
//   </xs:group>

//   <xs:element name="restriction" id="restriction">
//     <xs:complexType>
//       <xs:annotation>
//         <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-restriction"/>
//       </xs:annotation>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:group ref="xs:simpleRestrictionModel"/>
//           <xs:attribute name="base" type="xs:QName" use="optional"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="list" id="list">
//     <xs:complexType>
//       <xs:annotation>
//         <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-list"/>
//       </xs:annotation>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:sequence>
//             <xs:element name="simpleType" type="xs:localSimpleType" minOccurs="0"/>
//           </xs:sequence>
//           <xs:attribute name="itemType" type="xs:QName" use="optional"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="union" id="union">
//     <xs:complexType>
//       <xs:annotation>
//         <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-union"/>
//       </xs:annotation>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:sequence>
//             <xs:element name="simpleType" type="xs:localSimpleType" minOccurs="0" maxOccurs="unbounded"/>
//           </xs:sequence>
//           <xs:attribute name="memberTypes" use="optional">
//             <xs:simpleType>
//               <xs:list itemType="xs:QName"/>
//             </xs:simpleType>
//           </xs:attribute>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="minExclusive" id="minExclusive" type="xs:facet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-minExclusive"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="minInclusive" id="minInclusive" type="xs:facet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-minInclusive"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="maxExclusive" id="maxExclusive" type="xs:facet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-maxExclusive"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="maxInclusive" id="maxInclusive" type="xs:facet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-maxInclusive"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="totalDigits" id="totalDigits">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-totalDigits"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:restriction base="xs:numFacet">
//           <xs:sequence>
//             <xs:element ref="xs:annotation" minOccurs="0"/>
//           </xs:sequence>
//           <xs:attribute name="value" type="xs:positiveInteger" use="required"/>
//           <xs:anyAttribute namespace="##other" processContents="lax"/>
//         </xs:restriction>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
//   <xs:element name="fractionDigits" id="fractionDigits" type="xs:numFacet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-fractionDigits"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="length" id="length" type="xs:numFacet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-length"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="minLength" id="minLength" type="xs:numFacet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-minLength"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="maxLength" id="maxLength" type="xs:numFacet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-maxLength"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="enumeration" id="enumeration" type="xs:noFixedFacet">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-enumeration"/>
//     </xs:annotation>
//   </xs:element>

//   <xs:element name="whiteSpace" id="whiteSpace">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-whiteSpace"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:restriction base="xs:facet">
//           <xs:sequence>
//             <xs:element ref="xs:annotation" minOccurs="0"/>
//           </xs:sequence>
//           <xs:attribute name="value" use="required">
//             <xs:simpleType>
//               <xs:restriction base="xs:NMTOKEN">
//                 <xs:enumeration value="preserve"/>
//                 <xs:enumeration value="replace"/>
//                 <xs:enumeration value="collapse"/>
//               </xs:restriction>
//             </xs:simpleType>
//           </xs:attribute>
//           <xs:anyAttribute namespace="##other" processContents="lax"/>
//         </xs:restriction>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="pattern" id="pattern">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-pattern"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:restriction base="xs:noFixedFacet">
//           <xs:sequence>
//             <xs:element ref="xs:annotation" minOccurs="0"/>
//           </xs:sequence>
//           <xs:attribute name="value" type="xs:string" use="required"/>
//           <xs:anyAttribute namespace="##other" processContents="lax"/>
//         </xs:restriction>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:complexType name="openAttrs">
//     <xs:complexContent>
//       <xs:restriction base="xs:anyType">
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'openAttrs'})
export class XsdOpenAttrs extends XsdAnyType {

}

//   <xs:element name="appinfo" id="appinfo">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-appinfo"/>
//     </xs:annotation>
//     <xs:complexType mixed="true">
//       <xs:sequence minOccurs="0" maxOccurs="unbounded">
//         <xs:any processContents="lax"/>
//       </xs:sequence>
//       <xs:attribute name="source" type="xs:anyURI"/>
//       <xs:anyAttribute namespace="##other" processContents="lax"/>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="documentation" id="documentation">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-documentation"/>
//     </xs:annotation>
//     <xs:complexType mixed="true">
//       <xs:sequence minOccurs="0" maxOccurs="unbounded">
//         <xs:any processContents="lax"/>
//       </xs:sequence>
//       <xs:attribute name="source" type="xs:anyURI"/>
//       <xs:attribute ref="xml:lang"/>
//       <xs:anyAttribute namespace="##other" processContents="lax"/>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdDocumentation {
    @XmlAttribute()
    source: string;
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
export class XsdAnnotation extends XsdOpenAttrs {
    
}

//   <xs:complexType name="annotated">
//     <xs:complexContent>
//       <xs:extension base="xs:openAttrs">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//         </xs:sequence>
//         <xs:attribute name="id" type="xs:ID"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'annotated'})
export class XsdAnnotated extends XsdOpenAttrs {
    @XmlAttribute() 
    id: string;
}

//   <xs:element name="anyAttribute" type="xs:wildcard" id="anyAttribute">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-anyAttribute"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="wildcard">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:attribute name="namespace" type="xs:namespaceList" use="optional" default="##any"/>
//         <xs:attribute name="processContents" use="optional" default="strict">
//           <xs:simpleType>
//             <xs:restriction base="xs:NMTOKEN">
//               <xs:enumeration value="skip"/>
//               <xs:enumeration value="lax"/>
//               <xs:enumeration value="strict"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'wildcard'})
export class XsdWildcard extends XsdAnnotated {

}

//   <xs:element name="any" id="any">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-any"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:wildcard">
//           <xs:attributeGroup ref="xs:occurs"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdAny extends XsdWildcard {
    @XmlAttributeGroupRef(XsdOccursAttrGroup)
    occurs: XsdOccursAttrGroup;
}

//   <xs:complexType name="group" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:particle" minOccurs="0" maxOccurs="unbounded"/>
//         <xs:attributeGroup ref="xs:defRef"/>
//         <xs:attributeGroup ref="xs:occurs"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'group'})
export class XsdGroup extends XsdAnnotated {
    
}

//   <xs:complexType name="realGroup">
//     <xs:complexContent>
//       <xs:restriction base="xs:group">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0" maxOccurs="1">
//             <xs:element ref="xs:all"/>
//             <xs:element ref="xs:choice"/>
//             <xs:element ref="xs:sequence"/>
//           </xs:choice>
//         </xs:sequence>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>


//   <xs:element name="group" type="xs:namedGroup" id="group">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-group"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="namedGroup">
//     <xs:complexContent>
//       <xs:restriction base="xs:realGroup">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="1" maxOccurs="1">
//             <xs:element name="all">
//               <xs:complexType>
//                 <xs:complexContent>
//                   <xs:restriction base="xs:all">
//                     <xs:group ref="xs:allModel"/>
//                     <xs:attribute name="minOccurs" use="prohibited"/>
//                     <xs:attribute name="maxOccurs" use="prohibited"/>
//                     <xs:anyAttribute namespace="##other" processContents="lax"/>
//                   </xs:restriction>
//                 </xs:complexContent>
//               </xs:complexType>
//             </xs:element>
//             <xs:element name="choice" type="xs:simpleExplicitGroup"/>
//             <xs:element name="sequence" type="xs:simpleExplicitGroup"/>
//           </xs:choice>
//         </xs:sequence>
//         <xs:attribute name="name" use="required" type="xs:NCName"/>
//         <xs:attribute name="ref" use="prohibited"/>
//         <xs:attribute name="minOccurs" use="prohibited"/>
//         <xs:attribute name="maxOccurs" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'namedGroup'})
export class XsdNamedGroup extends XsdRealGroup implements XsdRedefinableChoiceGroup, XsdSchemaTopChoiceGroup {
    @XmlAttribute()
    name: string;
}

//   <xs:complexType name="groupRef">
//     <xs:complexContent>
//       <xs:restriction base="xs:realGroup">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//         </xs:sequence>
//         <xs:attribute name="ref" use="required" type="xs:QName"/>
//         <xs:attribute name="name" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'groupRef'})
export class XsdGroupRef extends XsdRealGroup {
    
}

//   <xs:complexType name="explicitGroup">
//     <xs:complexContent>
//       <xs:restriction base="xs:group">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:nestedParticle" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="name" type="xs:NCName" use="prohibited"/>
//         <xs:attribute name="ref" type="xs:QName" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="simpleExplicitGroup">
//     <xs:complexContent>
//       <xs:restriction base="xs:explicitGroup">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:nestedParticle" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="minOccurs" use="prohibited"/>
//         <xs:attribute name="maxOccurs" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:element name="redefine" id="redefine">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-redefine"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:openAttrs">
//           <xs:choice minOccurs="0" maxOccurs="unbounded">
//             <xs:element ref="xs:annotation"/>
//             <xs:group ref="xs:redefinable"/>
//           </xs:choice>
//           <xs:attribute name="schemaLocation" type="xs:anyURI" use="required"/>
//           <xs:attribute name="id" type="xs:ID"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>

//   <xs:element name="import" id="import">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-import"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:attribute name="namespace" type="xs:anyURI"/>
//           <xs:attribute name="schemaLocation" type="xs:anyURI"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdImport extends XsdAnnotated {
    @XmlAttribute()
    namespace: string;
    @XmlAttribute()
    schemaLocation: string;
}

//   <xs:element name="selector" id="selector">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-selector"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:attribute name="xpath" use="required" type="xs:string"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdSelector extends XsdAnnotated {
    @XmlAttribute()
    xpath: string;
}

//   <xs:element name="field" id="field">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-field"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:attribute name="xpath" use="required" type="xs:string"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdField extends XsdAnnotated {
    @XmlAttribute()
    xpath: string;
}

//   <xs:complexType name="keybase">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:sequence>
//           <xs:element ref="xs:selector"/>
//           <xs:element ref="xs:field" minOccurs="1" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="name" type="xs:NCName" use="required"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({ name: 'keybase' })
export class XsdKeyBase extends XsdAnnotated {
    @XmlElement(0)
    selector: XsdSelector;
    @XmlElement(1)
    field = new Array<XsdField>();
    @XmlAttribute()
    name: string;
}

//   <xs:group name="identityConstraint">
//     <xs:choice>
//       <xs:element ref="xs:unique"/>
//       <xs:element ref="xs:key"/>
//       <xs:element ref="xs:keyref"/>
//     </xs:choice>
//   </xs:group>

//   <xs:element name="unique" type="xs:keybase" id="unique">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-unique"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="key" type="xs:keybase" id="key">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-key"/>
//     </xs:annotation>
//   </xs:element>
//   <xs:element name="keyref" id="keyref">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-keyref"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:keybase">
//           <xs:attribute name="refer" type="xs:QName" use="required"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdKeyRef extends XsdKeyBase {
    @XmlAttribute()
    refer: string;
}

//   <xs:element name="notation" id="notation">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-notation"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:attribute name="name" type="xs:NCName" use="required"/>
//           <xs:attribute name="public" type="xs:public"/>
//           <xs:attribute name="system" type="xs:anyURI"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdNotation extends XsdAnnotated implements XsdSchemaTopChoiceGroup {
    @XmlAttribute()
    name: string;
    @XmlAttribute()
    public: string;
    @XmlAttribute()
    system: string;
}

//   <xs:simpleType name="public" vs:nonbrowsable="true">
//     <xs:restriction base="xs:token"/>
//   </xs:simpleType>

//   <xs:element name="simpleContent" id="simpleContent">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-simpleContent"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:choice>
//             <xs:element name="restriction" type="xs:simpleRestrictionType"/>
//             <xs:element name="extension" type="xs:simpleExtensionType"/>
//           </xs:choice>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({ name: 'simpleContent' })
export class XsdSimpleContent extends XsdAnnotated {

}

//   <xs:element name="include" id="include">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-include"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:attribute name="schemaLocation" type="xs:anyURI" use="required"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({ name: 'include' })
export class XsdInclude extends XsdAnnotated {
    @XmlAttribute()
    schemaLocation: string;
}

//   <xs:complexType name="attribute">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:sequence>
//           <xs:element name="simpleType" minOccurs="0" type="xs:localSimpleType"/>
//         </xs:sequence>
//         <xs:attributeGroup ref="xs:defRef"/>
//         <xs:attribute name="type" type="xs:QName"/>
//         <xs:attribute name="use" use="optional" default="optional">
//           <xs:simpleType>
//             <xs:restriction base="xs:NMTOKEN">
//               <xs:enumeration value="prohibited"/>
//               <xs:enumeration value="optional"/>
//               <xs:enumeration value="required"/>
//             </xs:restriction>
//           </xs:simpleType>
//         </xs:attribute>
//         <xs:attribute name="default" type="xs:string"/>
//         <xs:attribute name="fixed" type="xs:string"/>
//         <xs:attribute name="form" type="xs:formChoice"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'attribute'})
export class XsdAttribute extends XsdAnnotated implements XsdAttrsDeclGroupMemberChoiceGroup {
//         <xs:attributeGroup ref="xs:defRef"/>
    @XmlAttribute()
    type: string;
    @XmlAttribute()
    use? = XsdAttributeUse.Optional;
    @XmlAttribute()
    default: string;
    @XmlAttribute()
    fixed: string;
    @XmlAttribute()
    form: XsdFormChoice;

    @XmlElement(0)
    simpleType?: XsdLocalSimpleType;    
}
export enum XsdAttributeUse {
    Prohibited = 'prohibited',
    Optional = 'optional',
    Required = 'required'
}
@XmlSimpleType()
class XsdAttributeUseType {
    @XmlEnumerationValues(XsdAttributeUse)
    enumeration: XsdAttributeUse;
}

//   <xs:element name="complexContent" id="complexContent">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-complexContent"/>
//     </xs:annotation>
//     <xs:complexType>
//       <xs:complexContent>
//         <xs:extension base="xs:annotated">
//           <xs:choice>
//             <xs:element name="restriction" type="xs:complexRestrictionType"/>
//             <xs:element name="extension" type="xs:extensionType"/>
//           </xs:choice>
//           <xs:attribute name="mixed" type="xs:boolean">
//           </xs:attribute>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType()
export class XsdComplexContent extends XsdAnnotated {

    @XmlAttribute()
    mixed: boolean;
}

//   <xs:complexType name="complexType" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:complexTypeModel"/>
//         <xs:attribute name="name" type="xs:NCName"/>
//         <xs:attribute name="mixed" type="xs:boolean" use="optional" default="false">
//         </xs:attribute>
//         <xs:attribute name="abstract" type="xs:boolean" use="optional" default="false"/>
//         <xs:attribute name="final" type="xs:derivationSet"/>
//         <xs:attribute name="block" type="xs:derivationSet"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'complexType'})
export abstract class XsdComplexType extends XsdAnnotated {
//         <xs:group ref="xs:complexTypeModel"/>

    @XmlAttribute()
    name: string;

    @XmlAttribute()
    mixed: boolean;

    @XmlAttribute()
    abstract: boolean;

    @XmlAttribute()
    final: XsdDerivationSet;

    @XmlAttribute()
    block: XsdDerivationSet;
}

//   <xs:complexType name="element" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:sequence>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
//           </xs:choice>
//           <xs:group ref="xs:identityConstraint" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attributeGroup ref="xs:defRef"/>
//         <xs:attribute name="type" type="xs:QName"/>
//         <xs:attribute name="substitutionGroup" type="xs:QName"/>
//         <xs:attributeGroup ref="xs:occurs"/>
//         <xs:attribute name="default" type="xs:string"/>
//         <xs:attribute name="fixed" type="xs:string"/>
//         <xs:attribute name="nillable" type="xs:boolean" use="optional" default="false"/>
//         <xs:attribute name="abstract" type="xs:boolean" use="optional" default="false"/>
//         <xs:attribute name="final" type="xs:derivationSet"/>
//         <xs:attribute name="block" type="xs:blockSet"/>
//         <xs:attribute name="form" type="xs:formChoice"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>

@XmlComplexType({name: 'element'})
export abstract class XsdElement extends XsdAnnotated {
//         <xs:sequence>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
//           </xs:choice>
//           <xs:group ref="xs:identityConstraint" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attributeGroup ref="xs:defRef"/>
    @XmlAttribute()
    type: string;
    @XmlAttribute()
    substitutionGroup: string;
//         <xs:attributeGroup ref="xs:occurs"/>
    @XmlAttribute()
    default: string;
    @XmlAttribute()
    fixed: string;
    @XmlAttribute()
    nillable: boolean = false;
    @XmlAttribute()
    abstract: boolean = false;
    @XmlAttribute()
    form: XsdFormChoice;
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
export class XsdTopLevelElement extends XsdElement implements XsdSchemaTopChoiceGroup {
    
}

//   <xs:complexType name="localElement">
//     <xs:complexContent>
//       <xs:restriction base="xs:element">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
//           </xs:choice>
//           <xs:group ref="xs:identityConstraint" minOccurs="0" maxOccurs="unbounded"/>
//         </xs:sequence>
//         <xs:attribute name="substitutionGroup" use="prohibited"/>
//         <xs:attribute name="final" use="prohibited"/>
//         <xs:attribute name="abstract" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="facet">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:attribute name="value" use="required"/>
//         <xs:attribute name="fixed" type="xs:boolean" use="optional"
//                       default="false"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType()
export class XsdFacet extends XsdAnnotated {
    @XmlAttribute()
    value: string;
    @XmlAttribute()
    fixed: boolean = false;
}

//   <xs:complexType name="noFixedFacet">
//     <xs:complexContent>
//       <xs:restriction base="xs:facet">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//         </xs:sequence>
//         <xs:attribute name="fixed" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="numFacet">
//     <xs:complexContent>
//       <xs:restriction base="xs:facet">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//         </xs:sequence>
//         <xs:attribute name="value" type="xs:nonNegativeInteger" use="required"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>


//   <xs:element name="complexType" type="xs:topLevelComplexType" id="complexType">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-complexType"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="topLevelComplexType">
//     <xs:complexContent>
//       <xs:restriction base="xs:complexType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:complexTypeModel"/>
//         </xs:sequence>
//         <xs:attribute name="name" type="xs:NCName" use="required"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelComplexType'})
export class XsdTopLevelComplexType extends XsdComplexType implements XsdRedefinableChoiceGroup, XsdSchemaTopChoiceGroup {
    @XmlAttribute()
    name: string;
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

//   <xs:complexType name="restrictionType">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:sequence>
//           <xs:choice minOccurs="0">
//             <xs:group ref="xs:typeDefParticle"/>
//             <xs:group ref="xs:simpleRestrictionModel"/>
//           </xs:choice>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:attribute name="base" type="xs:QName" use="required"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="complexRestrictionType">
//     <xs:complexContent>
//       <xs:restriction base="xs:restrictionType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:group ref="xs:typeDefParticle"/>
//           </xs:choice>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>

//   <xs:complexType name="extensionType">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:sequence>
//           <xs:group ref="xs:typeDefParticle" minOccurs="0"/>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:attribute name="base" type="xs:QName" use="required"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType()
export class XsdExtensionType extends XsdAnnotated {
//           <xs:group ref="xs:typeDefParticle" minOccurs="0"/>
//           <xs:group ref="xs:attrDecls"/>

    @XmlAttribute()
    base: string;
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
@XmlComplexType()
@XmlRoot({name: 'schema'})
export class XsdSchema extends XsdOpenAttrs {
    @XmlAttribute()
    targetNamespace: string;
    // @XmlAttribute()
    // version: XmlToken;
    // @XmlAttribute()
    // finalDefault? XmlFullDerivationSet;
    // @XmlAttribute()
    // blockDefault?: XmlBlockSet;
    @XmlAttribute()
    attributeFormDefault?: XsdFormChoice;
    @XmlAttribute()
    elementFormDefault?: XsdFormChoice;
    @XmlAttribute()
    id: string;
    //           <xs:attribute ref="xml:lang"/>
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

// </xs:schema>

*/