var express = require('express');
var Realm = require('realm');
var app = express();

const schemaName = 'loadr';
let realm = new Realm({
  schema: [
    { name: schemaName, properties: { time: 'int', endpoint: 'string' } },
  ],
});

getEndpoint = req => req.url;

saveToRealm = endpoint =>
  new Promise(() => {
    realm.write(() => {
      realm.create(schemaName, { time: +new Date(), endpoint: endpoint });
    });
  });

app.post('/:path*', (req, res) => {
  let endpoint = getEndpoint(req);
  saveToRealm(endpoint);
  res.sendStatus(200);
});

app.put('/:path*', (req, res) => {
  let endpoint = getEndpoint(req);
  realm.write(() => {
    realm.create(schemaName, { time: +new Date(), endpoint: endpoint });
  });
  res.sendStatus(200);
});

app.get('/:path*', (req, res) => {
  let endpoint = getEndpoint(req);
  console.log(endpoint);
  let start = req.query.start;
  let end = req.query.end;
  let response;
  if (start && end)
    response = realm
      .objects(schemaName)
      .filtered(
        `endpoint = "${endpoint}" AND time >= ${start} && time <= ${end}`
      );
  else
    response = realm.objects(schemaName).filtered(`endpoint = "${endpoint}"`);
  res.status(200).send(`${response.length}`);
});

app.delete('/:path*', (req, res) => {
  let endpoint = getEndpoint(req);
  let objects = realm.objects(schemaName).filtered(`endpoint = "${endpoint}"`);
  realm.write(() => {
    realm.delete(objects);
  });
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  let objects = realm.objects(schemaName);
  let objArr = objects.reduce((acc,curr) =>{
    let find = acc.find(x => x.endpoint === curr.endpoint)
      if(find) 
      {
        let index = acc.indexOf(x => x.endpoint === curr);
        let newObj = {endpoint:find.endpoint, count: find.count +1};
        return [...acc.slice(0, index), newObj, ...acc.slice(index + 1)]
      }
      else {
        let newObj = {endpoint:curr.endpoint, count:1}
        return [...acc, newObj]
      }
    },[]
  );
  res.status(200)
    .send(`${JSON.
          stringify(objArr)}`);
});




app.delete('/', (req, res) => {
  let objects = realm.objects(schemaName);
  realm.write(() => {
    realm.delete(objects);
  });
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('loadr is loaded, send some stuff!');
  console.log(`http://localhost:${process.env.PORT || 3000}`)
});
