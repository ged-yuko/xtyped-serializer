import xtg from '../xtg'

const input = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Xml\\Schemas\\xsdschema.xsd';
//const output = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\out.xml';
const output = 'C:\\Home\\Ged\\github.com\\ged-yuko\\xtyped-serializer\\develop\\xsdschema.gen.ts';

test('debug', () => {
    xtg([input, output]);
});
