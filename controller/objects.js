const { deflateSync } = require("zlib");
const zlib = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  putObject: async (req, res) => {
    const { content, objectType, write } = req.body;
    const data = `${objectType} ${content.length}\0${content}`;

    try {
      const hashed = crypto.createHash("sha1").update(data).digest("hex");
      const dirName = [hashed.substring(0, 2), hashed.substring(2)];
      const compression = deflateSync(data, { level: 1 }); // level1로 압축 (내용으로 들어감)

      if (write && !fs.existsSync(`../.my-git/${dirName[0]}`)) {
        fs.mkdirSync(`../.my-git/${dirName[0]}`, { recursive: true });
        fs.writeFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`, compression);
      }

      return res.status(200).json({ objectId: hashed });
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  },
  getObject: async (req, res) => {
    const objectId = req.params.objectId;

    try {
      const ckeckRegex = new RegExp(`[a-zA-Z0-9]{40}`);
      const objectPattern =
        /^(?<type>blob|commit|tree|tag) (?<size>\d+)\0(?<content>.*)\n$/;

      if (!ckeckRegex.exec(objectId))
        return res.status(400).json(`ClientError: ${objectId}`);

      const dirName = [objectId.substring(0, 2), objectId.substring(2)];

      const find = fs.readFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`);
      const unzip = zlib.inflateSync(find);

      return res.status(200).json({
        data: { ...objectPattern.exec(unzip.toString()).groups },
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json(`NotFoundError: ${objectId}`);
    }
  },
};
