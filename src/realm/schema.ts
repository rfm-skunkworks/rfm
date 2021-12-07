const FunctionSchema = {
  title: "function_registry",
  properties: {
    _id: {
      bsonType: "objectId",
    },
    downloads: {
      bsonType: "array",
      items: {
        bsonType: "string",
      },
    },
    owner_id: {
      bsonType: "objectId",
    },
    raw: {
      bsonType: "string",
      properties: {},
    },
    tags: {
      bsonType: "array",
      items: {
        type: "string",
      },
    },
    name: {
      bsonType: "string",
    },
    dependencies: {
      bsonType: "array",
      items: {
        bsonType: "string",
      },
    },
  },
};

const UserSchema = {
  title: "user",
  properties: {
    _id: {
      bsonType: "objectId",
    },
    authored_functions: {
      bsonType: "array",
      items: {
        bsonType: "objectId",
      },
    },
    email: {
      bsonType: "string",
    },
  },
};

exports.UserSchema = UserSchema;
exports.FunctionSchema = FunctionSchema;
