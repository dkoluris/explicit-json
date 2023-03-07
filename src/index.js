const fs = require('fs');

function type(data) {
    if (Array.isArray(data)) return 'array';
    if (Number.isInteger(data)) return 'integer';
    return typeof data;
}

function parse(data) {
    const schema = {
        type: type(data)
    };

    switch (schema.type) {
        case 'object':
            schema.properties = {};
            schema.required = [];

            for (const key in data) {
                schema.properties[key] = parse(data[key]);
                schema.required.push(key);
            }
            break;

        case 'array':
            if (data[0]) {
                schema.items = parse(data[0]);
            }
            break;
    }

    return schema;
}

const file = process.argv[2];

if (!fs.existsSync(file)) {
    console.log('SchemaGen:: Provided file does not exist');
    return;
}

let data;

try {
    data = require(file);
}
catch(err) {
    console.info('SchemaGen:: JSON file is malformed');
    return;
}

const schema = JSON.stringify({
    $schema: 'http://json-schema.org/draft-07/schema#', ...parse(data)
}, null, 4);

fs.writeFile('.schema.json', schema, 'utf8', (err) => {
    console.log(err ? 'SchemaGen:: Unable to write file' : 'SchemaGen:: JSON Schema creation success');
});
