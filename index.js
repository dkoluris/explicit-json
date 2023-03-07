const fs = require('fs');
const path = require('path');

function explicitjson() {
    const file = process.argv[2];

    if (!fs.existsSync(file)) {
        console.log('ExplicitJSON:: Provided file does not exist');
        return;
    }

    let data;

    try {
        data = require(file);
    }
    catch(err) {
        console.info('ExplicitJSON:: JSON file is malformed');
        return;
    }

    const schema = JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#', ...parse(data)
    }, null, 4);

    fs.writeFile(path.basename(file, path.extname(file)) + '-schema.json', schema, 'utf8', (err) => {
        console.log(err ? 'ExplicitJSON:: Unable to write file' : 'ExplicitJSON:: JSON Schema creation success');
    });
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

function type(data) {
    if (Array.isArray(data)) return 'array';
    if (Number.isInteger(data)) return 'integer';
    return typeof data;
}

module.exports = explicitjson;
