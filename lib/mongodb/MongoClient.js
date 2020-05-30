"use strict";
const mongoose = require("mongoose");
const db = require("this.db");
const outdent = require('outdent');
const fs = require('fs');
function WriteLogs(TXT){
  let File = db.getData("LOG_FILE",":LOG_FILE:");
  let Path = File ? File.endsWith("/") ? File : File+"/" : undefined
  if(!Path) return;
  let OGContent = fs.readFileSync(Path).toString();
  fs.writeFileSync(Path,outdent`
  ${OGContent.trim() || ""}
  | ${Date.now()} | ${TXT.trim()} |
  `)
}
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
    mongoose.connect(options.mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    db.saveData("LOG_FILE",options.logFile,":LOG_FILE:")
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
              Value: String,
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
   * @param {String} value The value which will be saved to the key
   * @param {String} [schema] The schema you want to save it to, default is Data
   * @example
   * <MongoClient>.set("test","js is cool")
   */
  async set(key, value, schema) {
    let Data = db.getData("client", ":client:");
    Data.Schemas[schema ? schema : "DEFAULT"].findOne(
      { Key: key },
      async (err, data) => {
        if(err){
          WriteLogs("SET_DATA | ERROR")
          return console.error(err);
        }
        if (!data) {
          WriteLogs("SET_DATA | SUCCESS")
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
  }
  /**
   * @method
   * @param {String} key The key you wish to get
   * @param {String} [schema] The schema you wish to look through
   * @example
   * <MongoClient>.get("test") //Will return "js is cool" (if you have set it)
   */
  async get(key, schema) {
    let Data = db.getData("client", ":client:");
    let SCHEMA = schema ? schema : "DEFAULT";
    try {
      await Data.Schemas[SCHEMA].findOne(
        { Key: key, Active: true },
        async (err, data) => {
          if (data == null) return db.saveData("data_on_get", undefined);
          if (data.Value) {
            db.saveData("data_on_get", data.Value);
          }
        }
      );
    } catch {}
    WriteLogs("GET_DATA | SUCCESS")
    return db.getData("data_on_get");
  }
  /**
   * @method
   * @param {String} key The key you wish to check.
   * @param {String} [schema] The schema, defaults to "DEFAULT"
   */
  async has(key, schema) {
    let Data = db.getData("client", ":client:");
    WriteLogs("HAS | SUCCESS")
    return !!(await this.get(key, schema));
  }
  /**
   * @method
   * @param {String} key They key you wish to delete
   * @param {String} [schema] The schema you want to look through.
   */
  async delete(key, schema) {
    let Data = db.getData("client", ":client:");
    let SCHEMA = schema ? schema : "DEFAULT";
    Data.Schemas[SCHEMA].deleteOne({ Key: key }, async (err) => {
      if (err) {
        console.error(err);
        return WriteLogs("DELETE_DATA | ERROR")
      }else{
        WriteLogs("DELETE_DATA | SUCCESS")
      }
    })
  }
  /**
   * @method
   * @param {String} name Name of the schema.
   */
  async addSchema(name) {
    let Data = db.getData("client", ":client:");
    Data.Schemas[name] = mongoose.model(
      name,
      new mongoose.Schema({
        Key: String,
        Value: String,
        Active: Boolean,
        Exist: Boolean,
      })
    );
    WriteLogs("NEW_SCHEMA | SUCCESS")
  }
  get schemas() {
    WriteLogs('GET_SCHEMAS | SUCCESS')
    return db.getData("client", ":client:").Schemas;
  }
}
/*
Export it so you can use it like so:
const { MongoClient } = require("./lib/mongodb/")
Note other imports may be required for the path.
*/
module.exports = MongoClient;
