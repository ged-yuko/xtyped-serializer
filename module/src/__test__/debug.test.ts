import xtg from '../xtg'

//const input = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Xml\\Schemas\\xsdschema.xsd';
//const output = 'v:\\out.xml';
// const input = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\test.xsd';
// const output = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\test.g.ts';
const input = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\xsdschema.xsd';
const output = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\xsdschema.g.ts';

test('debug', () => {
    xtg([input, output]);
});
