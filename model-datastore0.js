'use strict';

const {Datastore} = require('@google-cloud/datastore');


const ds = new Datastore();
const kind = 'Details';

function fromDatastore(obj) {
  obj.id = obj[Datastore.KEY].id;
  return obj;
}

function toDatastore(obj) {
  const results = [];
  Object.keys(obj).forEach(k => {
    if (obj[k] === undefined) {
      return;
    }
    results.push({
      name: k,
      value: obj[k]
    });
  });
  return results;
}

function list(limit, cb) {
  const q = ds
    .createQuery([kind])
    .limit(limit);

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err);
      return;
    }
    const hasMore =
      nextQuery.moreResults !== Datastore.NO_MORE_RESULTS
        ? nextQuery.endCursor
        : false;
    cb(null, entities.map(fromDatastore), hasMore);
  });
}

function update(id, data, cb) {
  let key;
  if (id) {
    key = ds.key([kind, parseInt(id, 10)]);
  } else {
    throw new Error("id not available");
  }

  const entity = {
    key: key,
    data: toDatastore(data)
  };

  ds.save(entity, err => {
    data.id = entity.key.id;
    cb(err, err ? null : data);
  });
}


function create(id, data, cb) {
  update(id, data, cb);
}

function read(id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.get(key, (err, entity) => {
    if (!err && !entity) {
      err = {
        code: 404,
        message: 'Not found',
      };
    }
    if (err) {
      cb(err);
      return;
    }
    cb(null, fromDatastore(entity));
  });
}

function _delete(id, cb) {
  const key = ds.key([kind, parseInt(id, 10)]);
  ds.delete(key, cb);
}

module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list,
};
