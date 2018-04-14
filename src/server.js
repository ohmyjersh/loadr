var express = require('express');
var Realm = require('realm');
var app = express();

const schemaName = 'loadr';
const realm = new Realm({
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
  const endpoint = getEndpoint(req);
  saveToRealm(endpoint);
  res.sendStatus(200);
});

app.put('/:path*', (req, res) => {
  const endpoint = getEndpoint(req);
  realm.write(() => {
    realm.create(schemaName, { time: +new Date(), endpoint: endpoint });
  });
  res.sendStatus(200);
});

app.get('/:path*', (req, res) => {
  const endpoint = getEndpoint(req);
  console.log(endpoint);
  const start = req.query.start;
  const end = req.query.end;
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
  const endpoint = getEndpoint(req);
  const objects = realm.objects(schemaName).filtered(`endpoint = "${endpoint}"`);
  realm.write(() => {
    realm.delete(objects);
  });
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  const objects = realm.objects(schemaName);
  const objArr = objects.reduce((acc,curr) => {
    const index = acc.findIndex(x => x.endpoint === curr.endpoint);
    return index !== -1 ? [...acc.slice(0, index), {endpoint:acc[index].endpoint, count: acc[index].count +1}, ...acc.slice(index + 1)] : addNewToArray(acc, curr);
  },[]
);
res.status(200)
  .send(`${JSON.stringify(objArr)}`);
});

const addNewToArray = (arr, item) => [...arr, {endpoint:item.endpoint, count:1}]

app.delete('/', (req, res) => {
  const objects = realm.objects(schemaName);
  realm.write(() => {
    realm.delete(objects);
  });
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('loadr is loaded, send some stuff!');
  console.log(`http://localhost:${process.env.PORT || 3000}`)
});
