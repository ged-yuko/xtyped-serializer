import xtg from '../xtg'

const input = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Xml\\Schemas\\xsdschema.xsd';
const output = 'v:\\out.xml';

test('debug', () => {
    xtg([input, output]);
});
