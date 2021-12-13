// const zlib = require("zlib");
const { deflate, unzip } = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  putObject: async (req, res) => {
    const { content, objectType, write } = req.body;

    const data = `${objectType} ${content.length}\0${content}`;
    // const data = "blob 12\0Hello Git!\n";

    const getSHA1ofJSON = crypto
      .createHash("sha1")
      .update(JSON.stringify(data))
      .digest("hex"); // base64

    console.log(getSHA1ofJSON);

    deflate(getSHA1ofJSON, function (err, buffer) {
      if (err) {
        console.log(err);
      } else {
        return res.status(200).json({ objectId: buffer.toString("base64") });
      }
    });

    // return res.status(200).json({ objectId: hashed });
  },
  getObject: async (req, res) => {},
};
