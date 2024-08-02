

const fs = require('fs');
const path = require('path');
// https://nodejs.cn/api/readline.html
const readline = require('readline');

// 读取properties文件
const turnData = {};
let outputLanguage = 'zh_cn'
// 翻译文件的所有key
const allKeyList = [];
// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const tempLang = args[0] || "";
if (tempLang) {
  outputLanguage = tempLang;
  console.log(`当前要生成:${tempLang}.json`);
}

let isFileReadComplete = false; // 文件是否读取完毕的标志
const outputFilePath = path.join(__dirname, `./sources/${outputLanguage}.json`);

const rl = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, './sources', 'zh_CN.properties')),
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
  fs.writeFileSync(outputFilePath, JSON.stringify(turnData, null, 2));
});
