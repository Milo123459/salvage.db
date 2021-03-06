"use strict";
const mongoose = require("mongoose");
const db = require("this.db");
class MongoClient {
  /**
   * @name MongoClient
   * @kind constructor
   * @param {Object} options The options
   * @param {Object} [options.schema] The shcema options
   * @param {String} [options.schema.name] The name of the data schema
   * @param {String} options.mongoURI The mongo connection URI
   * @param {String} [options.logFile] The path to your log file
   * @description Create a MongoClient
   * @class
   */
  constructor(options) {
    this.cachedData = {};
    mongoose.connect(options.mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    db.saveData(
      "client",
      {
        Schemas: {
          DEFAULT: mongoose.model(
            options
              ? options.schema
                ? options.schema.name
                  ? options.schema.name
                  : "Data"
                : "Data"
              : "Data",
            new mongoose.Schema({
              Key: String,
              Value: mongoose.SchemaTypes.Mixed,
              Active: Boolean,
              Exist: Boolean,
            })
          ),
        },
      },
      ":client:"
    );
  }
  /**
   * @method
   * @param {String} key The key, so you can get it with <MongoClient>.get("key")
   * @param {*} value The value which will be saved to the key
   * @param {String} [schema] The schema you want to save it to, default is Data
   * @example
   * <MongoClient>.set("test","js is cool")
   */
  async set(key, value, schema) {
    if (!key) throw new TypeError(`"key" is a required argument.`);
    if (!value) throw new TypeError(`"value" is a required argument.`);
    let Data = db.getData("client", ":client:");
    Data.Schemas[schema ? schema : "DEFAULT"].findOne(
      { Key: key },
      async (err, data) => {
        if (err) {
          return console.error(err);
        }
        if (!data) {
          new Data.Schemas[schema ? schema : "DEFAULT"]({
            Key: key,
            Value: value,
            Active: true,
            Exists: true,
          }).save();
        } else if (data) {
          data.Value = value;
          data.save();
        }
      }
    );
    this.cachedData[key] = {
      key,
      value,
      schema: schema ? schema : "DEFAULT",
    };
  }
  /**
   * @method
   * @param {String} key The key you wish to get
   * @param {String} [schema] The schema you wish to look through
   * @example
   * <MongoClient>.get("test") //Will return "js is cool" (if you have set it)
   */
  async get(key, schema) {
    if (!key) throw new TypeError(`"key" is a required argument.`);
    let Data = db.getData("client", ":client:");
    if (this.cachedData[key]) return this.cachedData[key].value;
    let DATA = {};
    let SCHEMA = schema ? schema : "DEFAULT";
    await Data.Schemas[SCHEMA].findOne(
      { Key: key, Active: true },
      async (err, data) => {
        if (err) console.error(err);
        if (data == null) {
          Data.Value = undefined;
        }
        if (data && data.Value != null) {
          DATA.Value = typeof data.Value;
          DATA.Value = data.Value;
        }
      }
    );
    return DATA.Value;
  }
  /**
   * @method
   * @param {String} key The key you wish to check.
   * @param {String} [schema] The schema, defaults to "DEFAULT"
   */
  async has(key, schema) {
    if (!key) throw new TypeError(`"key" is a required argument.`);
    return !!(await this.get(key, schema));
  }
  /**
   * @method
   * @param {String} key They key you wish to delete
   * @param {String} [schema] The schema you want to look through.
   */
  async delete(key, schema) {
    if (!key) throw new TypeError(`"key" is a required argument.`);
    let Data = db.getData("client", ":client:");
    let SCHEMA = schema ? schema : "DEFAULT";
    Data.Schemas[SCHEMA].deleteOne({ Key: key }, async (err) => {
      if (err) {
        return console.error(err);
      } else;
    });
    if (this.cachedData[key]) {
      this.cachedData[key] = false;
    }
  }
  /**
   * @method
   * @param {String} name Name of the schema.
   */
  async addSchema(name) {
    if (!name) throw new TypeError(`"name" is a required argument.`);
    let Data = db.getData("client", ":client:");
    Data.Schemas[name] = mongoose.model(
      name,
      new mongoose.Schema({
        Key: String,
        Value: mongoose.SchemaTypes.Mixed,
        Active: Boolean,
        Exist: Boolean,
      })
    );
  }
  get schemas() {
    return db.getData("client", ":client:").Schemas;
  }
  get cached() {
    return this.cachedData;
  }
  /**
   * @method
   */
  clearCache() {
    return (this.cachedData = {});
  }
  /**
   * @param {String} [schema] Gets all data from the schema
   */
  async getMultiple(schema) {
    let Data = db.getData("client", ":client:");
    let SCHEMA = schema ? schema : "DEFAULT";
    return await this.schemas[SCHEMA].find().map((res) => res.Value);
  }
}
/*
Export it so you can use it like so:
const { MongoClient } = require("./lib/mongodb/")
Note other imports may be required for the path.
*/
module.exports = MongoClient;
