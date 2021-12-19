const { deflateSync } = require("zlib");
const zlib = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  putObject: async (req, res) => {
    try {
      const { content, objectType, write } = req.body;
      const data = `${objectType} ${content.length}\0${content}`;

      const hashed = crypto.createHash("sha1").update(data).digest("hex");
      const dirName = [hashed.substring(0, 2), hashed.substring(2)];
      const compression = deflateSync(data, { level: 1 }); // level1로 압축 (내용으로 들어감.)
      console.log(hashed, compression);

      fs.existsSync(`../.my-git/${dirName[0]}`);
      fs.mkdirSync(`../.my-git/${dirName[0]}`, { recursive: true });
      fs.writeFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`, compression);
      return res.status(200).json({ objectId: hashed });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  },
  getObject: async (req, res) => {
    try {
      const regex = new RegExp(`[a-zA-Z0-9]{40}`);
      const regexNum = /[^0-9]/g;
      const regexContent = /(?<=\0).*[^\n]/g;

      const objectId = req.params.objectId;
      const dirName = [objectId.substring(0, 2), objectId.substring(2)];

      if (!regex.exec(objectId))
        return res.status(400).json(`ClientError: ${objectId}`);

      const find = fs.readFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`);
      const unzip = zlib.inflateSync(find);

      const content = unzip.toString().split(" ");
      const mainConent = content.slice(1).join(" ");

      return res.status(200).json({
        data: {
          type: content[0],
          content: regexContent.exec(mainConent)[0],
          size: content[1].replace(regexNum, ""),
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json(`NotFoundError: ${objectId}`);
    }
  },
};
