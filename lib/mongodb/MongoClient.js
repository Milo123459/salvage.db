"use strict";
const mongoose = require("mongoose");
const db = require("this.db");
const fs = require('fs');
class MongoClient {
  /**
    * @name MongoClient
    * @kind constructor 
    * @param {Object} options The options
    * @param {Object} [options.schema] The shcema options
    * @param {String} [options.schema.name] The name of the data schema
    * @param {String} options.mongoURI The mongo connection URI
    * @description Create a MongoClient
    * @class
   */
  constructor(options) {
    mongoose.connect(options.mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    db.saveData(
      "client",
      {
        Schema: mongoose.model(
          options
            ? options.schema
              ? options.schema.name
                ? options.schema.name
                : "Data"
              : "Data"
            : "Data",
          new mongoose.Schema({ Key: String,
            Value: String,
            Active: Boolean,
            Exist: Boolean})
        ),
      },
      ":client:"
    );
  }
  /**
   * @method
   * @param {String} key The key, so you can get it with <MongoClient>.get("key")
   * @param {String} value The value which will be saved to the key
   * @example
   * <MongoClient>.set("test","js is cool")
   */
  async set(key, value) {
    let Data = db.getData("client", ":client:");
    Data.Schema.findOne({ Key: key }, async (err, data) => {
      if (!data) {
        new Data.Schema({
          Key: key,
          Value: value,
          Active: true,
          Exists: true,
        }).save();
      } else if (data) {
        data.Value = value;
        data.save();
      }
    });
  }
  /**
   * @method
   * @param {String} key The key you wish to get
   * @example
   * <MongoClient>.get("test") //Will return "js is cool" (if you have set it)
   */
  async get(key) {
    let Data = db.getData("client", ":client:");
    try {
      await Data.Schema.findOne(
        { Key: key, Active: true },
        async (err, data) => {
          if (data == null) return db.saveData("data_on_get", undefined);
          if (data.Value) {
            db.saveData("data_on_get", data.Value);
          }
        }
      );
    } catch {}
    return db.getData("data_on_get");
  }
  /**
   * @method
   * @param {String} key The key you wish to check.
   */
  async has(key) {
    let Data = db.getData("client", ":client:");
    return !!await this.get(key)
  }
  /**
   * @method
   * @param {String} key They key you wish to delete
   */
  async delete(key) {
    let Data = db.getData("client",":client:");
    Data.Schema.deleteOne({ Key: key },async(err)=>{if(err)console.error(err)})
  }
}
/*
Export it so you can use it like so:
const { MongoClient } = require("./lib/mongodb/")
Note other imports may be required for the path.
*/
module.exports = MongoClient;