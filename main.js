

const fs = require('fs');
const path = require('path');
// https://nodejs.cn/api/readline.html
const readline = require('readline');

// 读取properties文件
const turnData = {};
let outputLanguage = 'zh_CN'
// 翻译文件的所有key
const allKeyList = [];
// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const autoType = args[0] || "";
if (autoType == "unicode") {
  console.log(`生成json之后要依次自动翻译,并转成unicode`);
} else if (autoType == "json") {
  // 依次翻译为其他语言到json文件
  console.log(`生成json之后要依次自动翻译到json文件`);
}

let isFileReadComplete = false; // 文件是否读取完毕的标志
const outputFilePath = path.join(__dirname, `./sources/${outputLanguage}.json`);

const rl = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, './sources', 'origin_CN.properties')),
  crlfDelay: Infinity
});

// 逐行读取文件
rl.on('line', (line) => {
  const [key, value] = line.split('=');
  turnData[key] = value;
  allKeyList.push(key);
  console.log(`读取到一行数据: ${line}`);
});
// 文件读取完毕
rl.on('close', () => {
  console.log(`文件读取完毕,一共读取: ${allKeyList.length} 条数据`);
  isFileReadComplete = true;
  fs.writeFile(outputFilePath, JSON.stringify(turnData, null, 2), (err) => {
    if (err) {
      console.error(`创建[${outputLanguage}.json]文件错误:`, err);
    } else {
      console.log(`${outputLanguage}.json文件创建成功`);
      if (autoType == "unicode") {
        const autoTrans = require("./src/translate_all");
        autoTrans.createFileAutoTranslateSave();
      } else if (autoType == "json") {
        // 依次翻译为其他语言到json文件
        const autoTrans = require("./src/translate_json");
        autoTrans.createFileAutoTranslateSave();
      }
    }
  });
});
