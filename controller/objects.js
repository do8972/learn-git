const { deflateSync } = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  putObject: async (req, res) => {
    try {
      const { content, objectType, write } = req.body;
      const data = `${objectType} ${content.length}\0${content}`;
      // const data = "blob 12\0Hello, Git!\n";
      const hashed = crypto.createHash("sha1").update(data).digest("hex");
      const dirName = [hashed.substring(0, 2), hashed.substring(2)];
      const compression = deflateSync(hashed, { level: 1 }); // level1로 압축 (내용으로 들어감.)

      const isExists = fs.existsSync(`../.my-git/${dirName[0]}`);

      fs.mkdirSync(`../.my-git/${dirName[0]}`, { recursive: true });
      fs.writeFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`, compression);
      return res.status(200).json({ objectId: hashed });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  },
  getObject: async (req, res) => {},
};
