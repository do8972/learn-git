const { deflateSync } = require("zlib");
const zlib = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

const mygitDirPath = "./.my-git"
const objectDirPath = `${mygitDirPath}/objects`

module.exports = {
  putObject: async (req, res) => {
    const { content, objectType, write } = req.body;
    const data = `${objectType} ${content.length}\0${content}`;

    try {
      const hashed = crypto.createHash("sha1").update(data).digest("hex");
      const dirName = [hashed.substring(0, 2), hashed.substring(2)];
      const compression = deflateSync(data, { level: 1 }); // level1로 압축 (내용으로 들어감)

      if (write && !fs.existsSync(`${objectDirPath}/${dirName[0]}`)) {
        fs.mkdirSync(`${objectDirPath}/${dirName[0]}`, { recursive: true });
        fs.writeFileSync(`${objectDirPath}/${dirName[0]}/${dirName[1]}`, compression);
      }

      return res.status(200).json({ objectId: hashed });
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  },
  getObject: async (req, res) => {
    const objectId = req.params.objectId;

    try {
      const ckeckRegex = new RegExp("[a-zA-Z0-9]{4,40}");
      const objectPattern =
        /^(?<type>blob|commit|tree|tag) (?<size>\d+)\0(?<content>(.|\s)*)$/;

      if (!ckeckRegex.exec(objectId))
        return res.status(400).json(`ClientError: ${objectId}`);
      
      const dirName = [objectId.substring(0, 2), objectId.substring(2)];
      
      if (!fs.existsSync(`${objectDirPath}/${dirName[0]}`)) {
        return res.status(404).json(`NotFoundError: ${objectId}`);
      }

      const filesMatched = fs.readdirSync(`${objectDirPath}/${dirName[0]}`)
        .filter(fileName => fileName.startsWith(dirName[1]));
      

      if (filesMatched.length === 0) {
        return res.status(404).json(`NotFoundError: ${objectId}`);
      } else if (filesMatched.length > 1) {
        return res.status(400).json(`overlappingFiles: ${filesMatched}`);
      }
      
      const find = fs.readFileSync(`${objectDirPath}/${dirName[0]}/${filesMatched[0]}`);
      const unzip = zlib.inflateSync(find);

      return res.status(200).json({
        data: { ...objectPattern.exec(unzip.toString()).groups },
      });
    } catch (error) {
      console.error(error)
      return res.status(500).json('Unknwon Server error');
    }
  },
};
