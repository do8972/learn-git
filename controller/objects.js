const { deflateSync } = require("zlib");
const zlib = require("zlib");
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
      // dir에 있는 파일을 확인한다.
      // 찾은 파일을 압축푼다. => sha1 해시값이 나옴.
      // 해시란 단방향 암호화라 풀 수가 없음..
      // git cat-file (-p | -t | -s)는 해시를 풀어야만 알 수 있음..

      const regex = new RegExp(`[a-zA-Z0-9]{40}`);
      const objectId = req.params.objectId;
      const dirName = [objectId.substring(0, 2), objectId.substring(2)];

      if (!regex.exec(objectId))
        return res.status(400).json("ClientError: objectId");
      // const files = await readdir(`../.my-git/${dirName[0]}`);

      const find = fs.readFileSync(`../.my-git/${dirName[0]}/${dirName[1]}`);
      const unzip = zlib.inflateSync(find);

      return res.status(200).json(unzip.toString());
    } catch (error) {
      console.log(error);
      return res.status(404).json("NotFoundError: objectId");
    }
  },
};
