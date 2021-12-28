# xtyped-serializer
XsdSchema-aware XML serializer for TypeScript 


## Features/TODO

**XsdSchema**
- [x] Choice via elements or subgroups and occurences
  - [ ] Generate dispatching visitors
- [x] Multiple occurences/@XmlArray
- [ ] All group
- [x] Explicit sequence subgroups
- [x] Attribute groups
- [x] Single namespace context
  - [ ] tests?
- [x] Multiple namespace context 
  - [ ] tests?
- [x] No/Default namespace context
  - [ ] tests?
- [x] Qualifiedness
  - [ ] tests?
- [ ] ComplexType extension
- [ ] ComplexType restriction
- [ ] ComplexType mixed content
- [ ] any element
- [ ] any attribute
- [ ] nullable elements
- [ ] nullable attributes
- [ ] default values
  - [x] default&required for attributes
- [ ] inheritance, instantiation and xsi
- [ ] literal SimpleType value formatting/parsing
- [ ] literal SimpleType validation
- [ ] list SimpleType
- [ ] union SimpleType
- [ ] include
- [ ] import

**Package and functionality**
- [ ] logging throughout the code 
- [ ] builtin tests based on W3C XSD Schema
- [ ] content model caching
- [ ] package build process review (namespacing, components and such)
- [ ] classes generator
  - [ ] schema text reading and generated source text writing
  - [ ] adaptive schema location resolution
  - [ ] output source file per namespace
  - [ ] as executable task
    - [x] xtg using ts-node
  - [ ] vscode integration (see https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [ ] move to fsm-based element content recognition maybe

**Known issues**
- [ ] namespace context should be preserved after attributes mapping during serialization

