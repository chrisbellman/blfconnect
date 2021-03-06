// user.js
// User model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);

// private constructor:

var User = module.exports = function User(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// public instance properties:

Object.defineProperty(User.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(User.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

Object.defineProperty(User.prototype, 'color', {
    get: function () {
        return this._node.data['color'];
    },
    set: function (color) {
        this._node.data['color'] = color;
    }
});

// ALL THE FIELDS I'M NOW ADDING
Object.defineProperty(User.prototype, 'major', {
    get: function () {
        return this._node.data['major'];
    },
    set: function (major) {
        this._node.data['major'] = major;
    }
});

Object.defineProperty(User.prototype, 'location', {
    get: function () {
        return this._node.data['location'];
    },
    set: function (location) {
        this._node.data['location'] = location;
    }
});

Object.defineProperty(User.prototype, 'blfrelation', {
    get: function () {
        return this._node.data['blfrelation'];
    },
    set: function (blfrelation) {
        this._node.data['blfrelation'] = blfrelation;
    }
});

Object.defineProperty(User.prototype, 'picture', {
    get: function () {
        return this._node.data['picture'];
    },
    set: function (picture) {
        this._node.data['picture'] = picture;
    }
});

Object.defineProperty(User.prototype, 'bio', {
    get: function () {
        return this._node.data['bio'];
    },
    set: function (bio) {
        this._node.data['bio'] = bio;
    }
});

// public instance methods:

User.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

User.prototype.del = function (callback) {
    // use a Cypher query to delete both this user and his/her following
    // relationships in one transaction and one network request:
    // (note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (user:User)',
        'WHERE ID(user) = {userId}',
        'DELETE user',
        'WITH user',
        'MATCH (user) -[rel:connection]- (other)',
        'DELETE rel',
    ].join('\n')

    var params = {
        userId: this.id
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// NEXT FEW FUNCTIONS; NEED TO CHECK IF RELATIONSHIP EXISTS. IF NO, ADD WITH CORRECT COLOR. IF YES, UPDATE.
// SO THE ISSUE WITH THESE IS THAT IT COMPLETELY RE-CREATES THE RELATIONSHIP AND DELETES ANY ATTRIBUTES ALREADY IN THERE. THIS WILL NOT FLY.
// Might want to take the stuff out of {} and use another function to set color if there isn't...
User.prototype.green = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'connection', {'color':'green'}, function (err, rel) {
        callback(err);
    });
};

User.prototype.yellow = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'connection', {'color':'yellow'}, function (err, rel) {
        callback(err);
    });
};

User.prototype.red = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'connection', {'color':'red'}, function (err, rel) {
        callback(err);
    });
};

// This won't be used because if a node goes from green to red, it might have other data / notes
// CHANGED TO NOT DELETE RELATIONSHIP
User.prototype.unfollow = function (other, callback) {
    var query = [
        'MATCH (user:User) -[rel:connection]-> (other:User)',
        'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
        //ADDED THIS LINE
        'SET rel.color = \'red\'',
        //'DELETE rel',
    ].join('\n');

    var params = {
        userId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// need to generalize / currently used for yellow only (hardcoded)
User.prototype.updateRelationshipParam = function (other, callback) {
    var query = [
        'MATCH (user:User) -[rel:connection]-> (other:User)',
        'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
        'SET rel.color = \'yellow\'',
		//'SET rel.{paramName} = \'{paramValue}\'',
    ].join('\n');

    var params = {
        userId: this.id,
        otherId: other.id
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// calls callback w/ (err, following, others) where following is an array of
// users this user follows, and others is all other users minus him/herself.
User.prototype.getFollowingAndOthers = function (callback) {
    // query all users and whether we follow each one or not:
    var query = [
        'MATCH (user:User), (other:User)',
        'OPTIONAL MATCH (user) -[rel:connection]-> (other)',
        'WHERE ID(user) = {userId}',
        'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
    ].join('\n')

    var params = {
        userId: this.id,
    };
  
    // ADDED
    var relationships = [];
  
    this._node.outgoing('connection', function (err, results) {
      if (err) return callback(err);
      
      for (var i = 0; i < results.length; i++) {
          // USE THIS TO DEBUG RELATIONSHIP
          //console.log(JSON.stringify(results[i]));
          // USE THIS TO GET RELATIONSHIP COLOR
          //console.log(results[i].data.color);
          //console.log(results[i].id);
          var temp = results[i].end.self.lastIndexOf('/');
          temp = results[i].end.self.substr(temp+1);
          results[i].data.endId = temp;
          relationships.push(results[i]);
          
          //console.log("TEMP = " + JSON.stringify(temp));
          // THIS HAS COLOR IN IT:
          //console.log("RESULTS[i] = " + JSON.stringify(results[i]));
      }
    });
    // END ADD

    var user = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        //var following = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new User(results[i]['other']);
            //var follows = results[i]['COUNT(rel)'];
          
            //console.log(JSON.stringify(other));
          
            // Loop through relationships and check against other.id
            for(var j = 0; j < relationships.length; j++) {
                //console.log("OTHER ID = " + other.id);
                //console.log("RELATIONSHIPS = " + relationships[j].id);
                if(other.id == relationships[j].data.endId) {
                    other._node._data.data.color = relationships[j].data.color
                }
            }
            //console.log(JSON.stringify(results[i]));

            // A LOT OF THIS CODE IS UNNECESSARY WITH NEW COLOR ATTRIBUTE
            if (user.id === other.id) {
                continue;
            }
            //} else if (follows) {
            //    following.push(other);
            //} else {
                others.push(other);
            //}
        }
      
        //console.log("FOLLOWING: " + JSON.stringify(following));
        //console.log("OTHERS: " + JSON.stringify(others));

        //callback(null, following, others);
        callback(null, others);
    });
};

// static methods:

User.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new User(node));
    });
};

User.getAll = function (callback) {
    var query = [
        'MATCH (user:User)',
        'RETURN user',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var users = results.map(function (result) {
            return new User(result['user']);
        });
        callback(null, users);
    });
};

// creates the user and persists (saves) it to the db, incl. indexing it:
User.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var node = db.createNode(data);
    var user = new User(node);

    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'CREATE (user:User {data})',
        'RETURN user',
    ].join('\n');

    var params = {
        data: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var user = new User(results[0]['user']);
        callback(null, user);
    });
};
