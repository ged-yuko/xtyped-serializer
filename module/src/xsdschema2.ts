import { XmlComplexType, XmlRoot, XmlAttribute, XmlSimpleType, XmlEnumerationValues, XmlElement, XmlChoice, XmlElementsGroup, XmlElementsGroupEntry, XmlAbstractComplexType, XmlAttributesGroup, XmlAttributesGroupEntry, XmlNode, XmlNodeAssociationKind } from "./annotations";
import 'xmldom-ts'

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
@XmlComplexType()
export class XsdAppInfo {
    @XmlAttribute()
    source: string;
}

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
    @XmlAttribute()
    lang: string;
}

//   <xs:complexType name="anyType" mixed="true">
//     <xs:sequence>
//       <xs:any minOccurs="0" maxOccurs="unbounded" processContents="lax"/>
//     </xs:sequence>
//     <xs:anyAttribute processContents="lax"/>
//   </xs:complexType>
@XmlComplexType({name: 'anyType'})                                                              // ok
export class XsdAnyType {  
    @XmlNode(XmlNodeAssociationKind.Element)
    rawNode: Element;
}

//   <xs:complexType name="openAttrs">
//     <xs:complexContent>
//       <xs:restriction base="xs:anyType">
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'openAttrs'})                                                            // ok
export class XsdOpenAttrs extends XsdAnyType {

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
export interface IXsdAnnotationInfo {
}
//           <xs:attribute name="id" type="xs:ID"/>
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({ name: 'annotation' })                                                         // ok
export class XsdAnnotation extends XsdOpenAttrs {
    @XmlChoice({order: 1, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'appinfo', type: {ctor: () => XsdAppInfo}})
    @XmlElement({name: 'documentation', type: {ctor: () => XsdDocumentation}})
    info = new Array<IXsdAnnotationInfo>();
    @XmlAttribute()
    id: string;
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
@XmlComplexType({name: 'annotated'})                                                            // ok
export class XsdAnnotated extends XsdOpenAttrs {
    
    @XmlAttribute() 
    id: string;
}

//   <xs:attributeGroup name="occurs">
//     <xs:attribute name="minOccurs" type="xs:nonNegativeInteger" use="optional" default="1"/>
//     <xs:attribute name="maxOccurs" type="xs:allNNI" use="optional" default="1"/>
//   </xs:attributeGroup>
@XmlAttributesGroup({ name: 'occurs' })                                                         // ok
export class XsdOccursAttrGroup {
    @XmlAttribute({name: 'minOccurs'})
    min?: number = 1;
    @XmlAttribute({name: 'maxOccurs'})
    max?: number = 1;
}

//   <xs:attributeGroup name="defRef">
//     <xs:attribute name="name" type="xs:NCName" vs:snippet="yes"/>
//     <xs:attribute name="ref" type="xs:QName"/>
//   </xs:attributeGroup>
@XmlAttributesGroup({ name: 'defRef' })                                                         // ok
export class XsdDefRefAttrGroup {
    @XmlAttribute()
    name: string;
    @XmlAttribute()
    ref: string;
}

//   <xs:group name="simpleDerivation">
//     <xs:choice>
//       <xs:element ref="xs:restriction"/>
//       <xs:element ref="xs:list"/>
//       <xs:element ref="xs:union"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdSimpleDerivation {
}

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
export interface IXsdFacets {
    // TODO IXsdFacets
}

//   <xs:group name="simpleRestrictionModel">
//     <xs:sequence>
//       <xs:element name="simpleType" type="xs:localSimpleType" minOccurs="0"/>
//       <xs:group ref="xs:facets" minOccurs="0" maxOccurs="unbounded"/>
//     </xs:sequence>
//   </xs:group>
@XmlElementsGroup({name: 'simpleRestrictionModel'})                         // deps
export class XsdSimpleRestrictionModel {
    
    @XmlElement({order: 1, minOccurs: 0})
    simpleType: XsdLocalSimpleType;

    @XmlChoice({order: 2, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'minExclusive'})
    @XmlElement({name: 'minInclusive'})
    @XmlElement({name: 'maxExclusive'})
    @XmlElement({name: 'maxInclusive'})
    @XmlElement({name: 'totalDigits'})
    @XmlElement({name: 'fractionDigits'})
    @XmlElement({name: 'length'})
    @XmlElement({name: 'minLength'})
    @XmlElement({name: 'maxLength'})
    @XmlElement({name: 'enumeration'})
    @XmlElement({name: 'whiteSpace'})
    @XmlElement({name: 'pattern'})
    facets = new Array<IXsdFacets>();
}

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
@XmlAbstractComplexType({name: 'simpleType'})
export abstract class XsdSimpleType extends XsdAnnotated {                                      // ok
}

//   <xs:complexType name="topLevelSimpleType">
//     <xs:complexContent>
//       <xs:restriction base="xs:simpleType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:simpleDerivation"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="required" type="xs:NCName" />
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelSimpleType'})                                                   // deps
export class XsdTopLevelSimpleType extends XsdSimpleType {
    // TODO XsdTopLevelSimpleType

    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice()
    @XmlElement({order: 2})
    @XmlElement({name: 'restriction'})
    @XmlElement({name: 'list'})
    @XmlElement({name: 'union'})
    model: IXsdSimpleDerivation;

    @XmlAttribute()
    final: string;
    @XmlAttribute()
    name: string;
}

//   <xs:element name="simpleType" type="xs:topLevelSimpleType" id="simpleType">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-2/#element-simpleType"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:complexType name="localSimpleType">
//     <xs:complexContent>
//       <xs:restriction base="xs:simpleType">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:group ref="xs:simpleDerivation"/>
//         </xs:sequence>
//         <xs:attribute name="name" use="prohibited" />
//         <xs:attribute name="final" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'topLevelComplexType'})                                          // deps
export class XsdLocalSimpleType extends XsdSimpleType {
    // TODO XsdLocalSimpleType

    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice()
    @XmlElement({order: 2})
    @XmlElement({name: 'restriction'})
    @XmlElement({name: 'list'})
    @XmlElement({name: 'union'})
    model: IXsdSimpleDerivation;
}

//   <xs:group name="identityConstraint">
//     <xs:choice>
//       <xs:element ref="xs:unique"/>
//       <xs:element ref="xs:key"/>
//       <xs:element ref="xs:keyref"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdIdentityConstraint {                                               // ok
    apply<T, TRet>(visitor: IXsdIdentityConstraintVisitor<T, TRet>, arg: T): TRet;
}
export interface IXsdIdentityConstraintVisitor<T, TRet> {
    visitXsdKey(arg0: XsdKey, arg: T): TRet;
    visitXsdUniqueKey(arg0: XsdUniqueKey, arg: T): TRet;
    visitXsdKeyRef(arg0: XsdKeyRef, arg: T): TRet;
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
export class XsdSelector extends XsdAnnotated {                                         // ok
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
@XmlComplexType()                                                                       // ok
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
@XmlComplexType({ name: 'keybase' })                                                    // ok
export class XsdKeyBase extends XsdAnnotated {
    @XmlElement({order: 1, type: { ctor: () => XsdSelector }})
    selector: XsdSelector;
    @XmlElement({order: 2, minOccurs: 1, maxOccurs: 'unbounded', type: {ctor: () => XsdField}})
    field = new Array<XsdField>();
    @XmlAttribute()
    name: string;
}
@XmlComplexType()
export class XsdUniqueKey extends XsdKeyBase implements IXsdIdentityConstraint {
    public apply<T, TRet>(visitor: IXsdIdentityConstraintVisitor<T, TRet>, arg: T): TRet { return visitor.visitXsdUniqueKey(this, arg); }
}
@XmlComplexType()
export class XsdKey extends XsdKeyBase implements IXsdIdentityConstraint {
    public apply<T, TRet>(visitor: IXsdIdentityConstraintVisitor<T, TRet>, arg: T): TRet { return visitor.visitXsdKey(this, arg); }
}

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
@XmlComplexType({ name: 'keyref' })                                                         // ok
export class XsdKeyRef extends XsdKeyBase implements IXsdIdentityConstraint {
    @XmlAttribute()
    refer: string;

    public apply<T, TRet>(visitor: IXsdIdentityConstraintVisitor<T, TRet>, arg: T): TRet { return visitor.visitXsdKeyRef(this, arg); }
}

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
//   </xs:coplexType>
@XmlComplexType({name: 'wildcard'})                                                         // ok
export class XsdWildcard extends XsdAnnotated {
    
    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlAttribute()
    namespace?: string;

    @XmlAttribute()
    processContents: string;
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
@XmlComplexType({name: 'any'})                                                              // ok
export class XsdAny extends XsdWildcard {
    @XmlAttributesGroupEntry({ctor: () => XsdOccursAttrGroup})
    occurs: XsdOccursAttrGroup
}

//   <xs:group name="typeDefParticle">
//     <xs:choice>
//       <xs:element name="group" type="xs:groupRef"/>
//       <xs:element ref="xs:all"/>
//       <xs:element ref="xs:choice"/>
//       <xs:element ref="xs:sequence"/>
//     </xs:choice>
//   </xs:group>
export interface IXsdTypeDefParticle {
    // TODO IXsdTypeDefParticle
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
export interface IXsdNestedParticle {
    // TODO IXsdNestedParticle
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
export interface IXsdParticle {
    // TODO IXsdParticle
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
@XmlComplexType({name: 'attribute'})                                                            // ok
export class XsdAttribute extends XsdAnnotated {
    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlElement({order: 2, name: 'simpleType', minOccurs: 0, type: {ctor: () => XsdLocalSimpleType}})
    simpleType?: XsdLocalSimpleType;
}
@XmlComplexType()
export class XsdAttributeImpl extends XsdAttribute implements IXsdAttrsDecls {

    @XmlAttributesGroupEntry({ctor: () => XsdDefRefAttrGroup})
    defRef: XsdDefRefAttrGroup;

    @XmlAttribute()
    type?: string;

    @XmlAttribute()
    use?: string;

    @XmlAttribute()
    default?: string;

    @XmlAttribute()
    fixed: string;

    @XmlAttribute()
    form?: XsdFormChoice;
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
@XmlComplexType({name: 'topLevelAttribute'})                                                    // ok
export class XsdTopLevelAttribute extends XsdAttribute {
    
    @XmlAttribute()
    name: string;
}

//   <xs:complexType name="attributeGroup" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:attrDecls"/>
//         <xs:attributeGroup ref="xs:defRef"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlAbstractComplexType({name: 'attributeGroup'})                                               // ok
export abstract class XsdAttributeGroup extends XsdAnnotated {
}

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
@XmlComplexType({name: 'namedAttributeGroup'})                                                 // ok
export class XsdNamedAttributeGroup extends XsdAttributeGroup {
    
    @XmlElement({order: 1, name: 'annotation', type: { ctor: () => XsdAnnotation }, minOccurs: 0})
    annotation: XsdAnnotation;

    @XmlElementsGroupEntry({order: 2, ctor: () => XsdAttrDecls})
    attrDecls: XsdAttrDecls;

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
@XmlComplexType({name: 'attributeGroupRef'})                                                    // ok
export class XsdAttributeGroupRef extends XsdAttributeGroup {
    
    @XmlElement({order: 1, name: 'annotation', type: { ctor: () => XsdAnnotation }, minOccurs: 0})
    annotation: XsdAnnotation;

    @XmlAttribute()
    ref: string;
}

//   <xs:group name="attrDecls">
//     <xs:sequence>
//       <xs:choice minOccurs="0" maxOccurs="unbounded">
//         <xs:element name="attribute" type="xs:attribute"/>
//         <xs:element name="attributeGroup" type="xs:attributeGroupRef"/>
//       </xs:choice>
export interface IXsdAttrsDecls {
    // TODO IXsdAttrsDecls
}
//       <xs:element ref="xs:anyAttribute" minOccurs="0"/>
//     </xs:sequence>
//   </xs:group>
@XmlElementsGroup({name: 'attrDecls'})                                                      // ok
export class XsdAttrDecls {
    @XmlChoice({order: 1, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'attribute', type: { ctor: () => XsdAttributeImpl }})
    @XmlElement({name: 'attributeGroup', type: { ctor: () => XsdAttributeGroupRef }})
    decls = new Array<IXsdAttrsDecls>();

    @XmlElement({order: 2, name: 'anyAttribute', minOccurs: 0, type: { ctor: () => XsdAnyAttribute }})
    anyAttribute: XsdAnyAttribute;
}
@XmlComplexType({name: 'anyAttribute'})
export class XsdAnyAttribute {
}

//  <xs:complexType name="group" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:particle" minOccurs="0" maxOccurs="unbounded"/>
//         <xs:attributeGroup ref="xs:defRef"/>
//         <xs:attributeGroup ref="xs:occurs"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlAbstractComplexType({name: 'group'})                                                    // ok
export abstract class XsdGroup extends XsdAnnotated {
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
@XmlComplexType({name: 'group'})                                                            // ok
export class XsdRealGroup extends XsdGroup {
}

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
export interface IXsdNamedGroupParticle {
    // TODO IXsdNamedGroupParticle    
}
//         </xs:sequence>
//         <xs:attribute name="name" use="required" type="xs:NCName"/>
//         <xs:attribute name="ref" use="prohibited"/>
//         <xs:attribute name="minOccurs" use="prohibited"/>
//         <xs:attribute name="maxOccurs" use="prohibited"/>
//         <xs:anyAttribute namespace="##other" processContents="lax"/>
//       </xs:restriction>
//     </xs:complexContent>
//   </xs:complexType>
@XmlComplexType({name: 'namedGroup'})                                                       // ok
export class XsdNamedGroup extends XsdRealGroup {

    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2})
    @XmlElement({name: 'all', type: {ctor: () => XsdNamedAllParticleGroup}})
    @XmlElement({name: 'choice', type: {ctor: () => XsdSimpleExplicitChoiceGroup}})
    @XmlElement({name: 'sequence', type: {ctor: () => XsdSimpleExplicitSequenceGroup}})
    particle: IXsdNamedGroupParticle;

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
@XmlComplexType({name: 'groupRef'})                                                                 // ok
export class XsdGroupRef extends XsdRealGroup {
    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlAttribute()
    ref: string;
    @XmlAttributesGroupEntry({name: 'occurs'})
    occurs: XsdOccursAttrGroup;
}

//   <xs:element name="choice" type="xs:explicitGroup" id="choice">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-choice"/>
//     </xs:annotation>
//   </xs:element>
//
//   <xs:element name="sequence" type="xs:explicitGroup" id="sequence">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-sequence"/>
//     </xs:annotation>
//   </xs:element>
//
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

@XmlComplexType({name: 'explicitGroup'})                                                            // ok
export class XsdExplicitGroup extends XsdGroup {

}
@XmlComplexType()
export class XsdExplicitGroupBase extends XsdExplicitGroup {
    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2})
    @XmlElement({name: 'element', type: {ctor: () => XsdLocalElement}})
    @XmlElement({name: 'group', type: {ctor: () => XsdGroupRef}})
    @XmlElement({name: 'choice', type: {ctor: () => XsdExplicitChoiceGroupImpl }})
    @XmlElement({name: 'sequence', type: {ctor: () => XsdExplicitSequenceGroupImpl }})
    @XmlElement({name: 'any', type: {ctor: () => XsdAny }})
    particles = new Array<IXsdNestedParticle>();
}
@XmlComplexType()
export class XsdExplicitGroupImpl extends XsdExplicitGroupBase {
    @XmlAttributesGroupEntry({ctor: () => XsdOccursAttrGroup})
    occurs: XsdOccursAttrGroup;
}
@XmlComplexType()
export class XsdExplicitChoiceGroupImpl extends XsdExplicitGroupImpl {
}
@XmlComplexType()
export class XsdExplicitSequenceGroupImpl extends XsdExplicitGroupImpl {
}

//   <xs:element name="all" id="all" type="xs:all">
//     <xs:annotation>
//       <xs:documentation source="http://www.w3.org/TR/xmlschema-1/#element-all"/>
//     </xs:annotation>
//   </xs:element>
//
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
@XmlComplexType({name: 'all'})                                                                          // ok
export class XsdAll extends XsdExplicitGroup {
    @XmlElement({order: 1, name: 'annotation', minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;
    @XmlElement({order: 2, name: 'element', minOccurs: 0, maxOccurs: 'unbounded', type: {ctor: () => XsdNarrowMaxMin}})
    elements = new Array<XsdNarrowMaxMin>();
}
@XmlComplexType()
export class XsdAllImpl extends XsdAll {
    @XmlAttributesGroupEntry({ctor: () => XsdOccursAttrGroup})
    occurs: XsdOccursAttrGroup;
}
@XmlComplexType()
export class XsdNamedAllParticleGroup extends XsdAll {   
}

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
@XmlComplexType({name: 'simpleExplicitGroup'})                                                      // ok
export class XsdSimpleExplicitGroup extends XsdExplicitGroupBase {
}
@XmlComplexType()
export class XsdSimpleExplicitChoiceGroup extends XsdSimpleExplicitGroup {
}
@XmlComplexType()
export class XsdSimpleExplicitSequenceGroup extends XsdSimpleExplicitGroup {
}

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
@XmlComplexType({name: 'restrictionType'})
export class XsdRestrictionType extends XsdAnnotated {                                      // ok    
}

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
@XmlComplexType({name: 'complexRestrictionType'})
export class XsdComplexRestrictionType extends XsdRestrictionType {                          // ok
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;
    @XmlChoice({order: 2, minOccurs: 0})
    @XmlElement({name: 'group', type: {ctor: () => XsdGroupRef}})
    @XmlElement({name: 'all', type: {ctor: () => XsdAllImpl}})
    @XmlElement({name: 'choice', type: {ctor: () => XsdExplicitChoiceGroupImpl}})
    @XmlElement({name: 'sequence', type: {ctor: () => XsdExplicitSequenceGroupImpl}})
    particles: IXsdTypeDefParticle;
    @XmlElementsGroupEntry({order: 3, ctor: () => XsdAttrDecls})
    attrDecls: XsdAttrDecls;
    @XmlAttribute()
    base: string;
}

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
@XmlComplexType({name: 'extensionType'})
export class XsdExtensionType extends XsdAnnotated {                                            // ok
    // TODO XsdExtensionType
}
@XmlComplexType()
export class XsdExtensionTypeImpl extends XsdExtensionType {
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;
    @XmlChoice({order: 2, minOccurs: 0})
    @XmlElement({name: 'group', type: {ctor: () => XsdGroupRef}})
    @XmlElement({name: 'all', type: {ctor: () => XsdAllImpl}})
    @XmlElement({name: 'choice', type: {ctor: () => XsdExplicitChoiceGroupImpl}})
    @XmlElement({name: 'sequence', type: {ctor: () => XsdExplicitSequenceGroupImpl}})
    particles: IXsdTypeDefParticle;
    @XmlElementsGroupEntry({order: 3, ctor: () => XsdAttrDecls})
    attrDecls: XsdAttrDecls;
    @XmlAttribute()
    base: string;
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
export interface IXsdComplexContent {
    // TODO IXsdComplexContent
}
//           <xs:attribute name="mixed" type="xs:boolean" />
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({name: 'complexContent'})
export class XsdComplexContent extends XsdAnnotated {                                           // ok
    
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;
    
    @XmlChoice({order: 2})
    @XmlElement({name: 'restriction', type: {ctor: () => XsdComplexRestrictionType}})
    @XmlElement({name: 'extension', type: {ctor: () => XsdExtensionType}})
    content: IXsdComplexContent;

    @XmlAttribute()
    mixed: boolean;
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
export class XsdSimpleRestrictionType extends XsdRestrictionType {                              // TODO !!!!!!!!!!!!!!!working

    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

//           <xs:choice minOccurs="0">
//             <xs:group ref="xs:simpleRestrictionModel"/>
//           </xs:choice>
    //model: IXsdSimpleRestrictionModel;

//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:attribute name="base" type="xs:QName" use="required"/>

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
export class XsdSimpleExtensionType extends XsdExtensionType {                                  // TODO !!!!!!!!!!!!!!!working
    // TODO XsdSimpleExtensionType

    //         <xs:sequence>
//           <xs:group ref="xs:typeDefParticle" minOccurs="0"/>
//           <xs:group ref="xs:attrDecls"/>
//         </xs:sequence>
//         <xs:attribute name="base" type="xs:QName" use="required"/>

}

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
export interface IXsdSimpleContent {
    // TODO IXsdSimpleContent
}
//         </xs:extension>
//       </xs:complexContent>
//     </xs:complexType>
//   </xs:element>
@XmlComplexType({name: 'simpleContent'})
export class XsdSimpleContent extends XsdAnnotated {                                            // ok
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2})
    @XmlElement({name: 'restriction', type: {ctor: () => XsdSimpleRestrictionType}})
    @XmlElement({name: 'extension', type: {ctor: () => XsdSimpleExtensionType}})
    content: IXsdSimpleContent;
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
export interface IXsdComplexTypeModel {
    // TODO IXsdComplexTypeModel
}
@XmlElementsGroup()                                                                             // ok
export class XsdImplicitComplexTypeModel implements IXsdComplexTypeModel {
    @XmlChoice({order: 2, minOccurs: 0})
    @XmlElement({name: 'group', type: {ctor: () => XsdGroupRef}})
    @XmlElement({name: 'all', type: {ctor: () => XsdAllImpl}})
    @XmlElement({name: 'choice', type: {ctor: () => XsdExplicitChoiceGroupImpl}})
    @XmlElement({name: 'sequence', type: {ctor: () => XsdExplicitSequenceGroupImpl}})
    particles: IXsdTypeDefParticle;
    @XmlElementsGroupEntry({order: 2, ctor: () => XsdAttrDecls})
    attrDecls: XsdAttrDecls;
}

//   <xs:complexType name="complexType" abstract="true">
//     <xs:complexContent>
//       <xs:extension base="xs:annotated">
//         <xs:group ref="xs:complexTypeModel"/>
//         <xs:attribute name="name" type="xs:NCName"/>
//         <xs:attribute name="mixed" type="xs:boolean" use="optional" default="false"/>
//         <xs:attribute name="abstract" type="xs:boolean" use="optional" default="false"/>
//         <xs:attribute name="final" type="xs:derivationSet"/>
//         <xs:attribute name="block" type="xs:derivationSet"/>
//       </xs:extension>
//     </xs:complexContent>
//   </xs:complexType>
@XmlAbstractComplexType({name: 'complexType'})                                              // ok
export class XsdComplexType extends XsdAnnotated {
}

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
@XmlComplexType({name: 'topLevelComplexType'})                                              // deps
export class XsdTopLevelComplexType extends XsdComplexType {
        
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2})
    @XmlElement({name: 'simpleContent'})
    @XmlElement({name: 'complexContent'})
    @XmlElementsGroupEntry({ctor: () => XsdImplicitComplexTypeModel})
    model: IXsdComplexTypeModel;

    @XmlAttribute()
    name: string;
    @XmlAttribute()
    mixed: boolean;
    @XmlAttribute()
    abstract: boolean;
    @XmlAttribute()
    final: string;
    @XmlAttribute()
    block: string;
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
@XmlComplexType({name: 'localComplexType'})                                                 // deps
export class XsdLocalComplexType extends XsdComplexType {
    
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2})
    @XmlElement({name: 'simpleContent'})
    @XmlElement({name: 'complexContent'})
    @XmlElementsGroupEntry({ctor: () => XsdImplicitComplexTypeModel})
    model: IXsdComplexTypeModel;

    @XmlAttribute()
    mixed: boolean = false;
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
@XmlAbstractComplexType({ name: 'element' })                                                        // ok
export abstract class XsdElement extends XsdAnnotated {
}

//   <xs:complexType name="localElement">
//     <xs:complexContent>
//       <xs:restriction base="xs:element">
//         <xs:sequence>
//           <xs:element ref="xs:annotation" minOccurs="0"/>
//           <xs:choice minOccurs="0">
//             <xs:element name="simpleType" type="xs:localSimpleType"/>
//             <xs:element name="complexType" type="xs:localComplexType"/>
export interface IXsdLocalType {
}
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
@XmlComplexType({name: 'localElement'})                                                                     // ok
export class XsdLocalElement extends XsdElement {
    @XmlElement({order: 1, minOccurs: 0, type: {ctor: () => XsdAnnotation}})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2, minOccurs: 0, maxOccurs: 1})
    @XmlElement({name: 'simpleType', type: {ctor: () => XsdLocalSimpleType}})
    @XmlElement({name: 'complexType', type: {ctor: () => XsdLocalComplexType}})
    localType: IXsdLocalType;

    @XmlChoice({order: 3, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'unique', type: {ctor: () => XsdUniqueKey}})
    @XmlElement({name: 'key', type: {ctor: () => XsdKey}})
    @XmlElement({name: 'keyref', type: {ctor: () => XsdKeyRef}})
    identityConstraint = new Array<IXsdIdentityConstraint>();

    @XmlAttributesGroupEntry({ ctor: () => XsdDefRefAttrGroup })
    defRef: XsdDefRefAttrGroup;
    @XmlAttribute({name: 'type'})
    typeName: string;
    @XmlAttributesGroupEntry({ ctor: () => XsdOccursAttrGroup })
    occurs: XsdOccursAttrGroup;
    @XmlAttribute()
    default: string;
    @XmlAttribute()
    fixed: string;
    @XmlAttribute()
    nillable?: boolean = false;
    @XmlAttribute()
    block: string;
    @XmlAttribute()
    form: XsdFormChoice;
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
@XmlComplexType({name: 'narrowMaxMin'})                                                             // ok
export class XsdNarrowMaxMin extends XsdLocalElement {
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
@XmlComplexType({name: 'topLevelElement'})                                                      // ok
export class XsdTopLevelElement extends XsdElement implements IXsdSchemaTop {

    @XmlElement({order: 1, name: 'annotation', type: { ctor: () => XsdAnnotation }, minOccurs: 0})
    annotation: XsdAnnotation;

    @XmlChoice({order: 2, minOccurs: 0})
    @XmlElement({name: 'simpleType', type: { ctor: () => XsdLocalSimpleType }})
    @XmlElement({name: 'complexType', type: { ctor: () => XsdLocalComplexType }})
    localType: IXsdTopLevelElementLocalType;

    @XmlChoice({order: 3, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'unique', type: {ctor: () => XsdUniqueKey}})
    @XmlElement({name: 'key', type: {ctor: () => XsdKey}})
    @XmlElement({name: 'keyref', type: {ctor: () => XsdKeyRef}})
    identityConstraints = new Array<IXsdIdentityConstraint>();

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
@XmlSimpleType({name: 'formChoice'})                                                            // ok
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
@XmlRoot({name: 'schema'})                                                                          // ok
export class XsdSchema extends XsdOpenAttrs {

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

    // TODO schema declarations

    @XmlChoice({order: 1, minOccurs: 0, maxOccurs: 'unbounded'})      
    @XmlElement({name:'include'})
    @XmlElement({name:'import'})
    @XmlElement({name:'redefine'})
    @XmlElement({name:'annotation',  type: {ctor: () => XsdAnnotation }})
    declarations = new Array<IXsdSchemaDeclaration>();

    @XmlChoice({order: 2, minOccurs: 0, maxOccurs: 'unbounded'})
    @XmlElement({name: 'annotation', type: {ctor: () => XsdAnnotation }})
    @XmlElement({name: 'element', type: {ctor: () => XsdTopLevelElement }})
    @XmlElement({name: 'attribute', type: {ctor: () => XsdTopLevelAttribute }})
    @XmlElement({name: 'notation'})
    @XmlElement({name: 'complexType', type: {ctor: () => XsdTopLevelComplexType }})
    @XmlElement({name: 'simpleType', type: {ctor: () => XsdTopLevelSimpleType }})
    @XmlElement({name: 'group', type: {ctor: () =>  XsdNamedGroup }})
    @XmlElement({name: 'attributeGroup', type: {ctor: () => XsdNamedAttributeGroup}})
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
