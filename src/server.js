 var express = require('express');
var Realm = require('realm');
var app = express();

const schemaName = 'loadr';
let realm = new Realm({
    schema: [{name: schemaName, properties: {time: 'int', endpoint: 'string'}}]
});

getEndpoint = req => (req.params['endpoint']);

app.post('/:endpoint', (req, res) => {
    let endpoint = getEndpoint(req);
    // should add headers to require auth or maybe sense a specific response
    // if(!req.headers['authorization'])
    //     return res.sendStatus(404);
    realm.write(() => {
        realm.create(schemaName, {time: +new Date(), endpoint: endpoint});
    });
    res.sendStatus(200);
});

app.put('/:endpoint', (req, res) => {
    let endpoint = getEndpoint(req);
    // see above
    // if(!req.headers['authorization'])
    //     return res.sendStatus(404);
    realm.write(() => {
        realm.create(schemaName, {time: +new Date(), endpoint: endpoint});
    });
    res.sendStatus(200);
});

app.get('/:endpoint', (req, res) => {
    let endpoint = getEndpoint(req);
    let start = req.query.start;
    let end = req.query.end;
    let response;
    if(start && end)
        response = realm.objects(schemaName).filtered(`endpoint = "${endpoint}" AND time >= ${start} && time <= ${end}`);
    else
        response = realm.objects(schemaName).filtered(`endpoint = "${endpoint}"`);
    console.log(response);
    res.status(200).send(`${response.length}`);
})

app.delete('/:endpoint', (req, res) => {
  let endpoint = getEndpoint(req);
  let objects = realm.objects(schemaName).filtered(`endpoint = "${endpoint}"`);;
  realm.write(() => {
        realm.delete(objects);
    });
    res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('loadr is loaded, send some stuff!');
});  