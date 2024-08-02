const Youdao = require('youdao-fanyi');
const fs = require('fs');
const path = require('path');
const config = require("../config");
const originData = require("../sources/zh_CN.json");

// 初始化有道翻译API
const fanyi = Youdao({
  appkey: config.APP_KEY,
  secret: config.APP_SECRET,
});

// 翻译并保存到文件
let lang = "en";
let allKeyList = [];

// 获取命令行参数，去掉前两个固定参数
const args = process.argv.slice(2) || [];
const tempLang = args[0] || "";
if (tempLang) {
  lang = tempLang;
  console.log(`当前翻译生成:${tempLang}.json`);
}

// 将中文字符串转成Unicode码
function encodeUnicode(str) {
  let res = '';
  for (let i = 0; i < str.length; i++) {
    res += '\\u' + str.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return res;
}

// 翻译函数
async function translateText(text, toLang) {
  try {
    const res = await fanyi(text, toLang);
    // const res = await fanyi('你好', { to: 'vi' });
    const { translation } = res || {};
    let outStr = "";
    if (translation && translation.length) {
      outStr = translation[0];
    }
    console.log(res, 'res_001');
    return outStr;
  } catch (error) {
    console.log(`youdao_translate_error`, error);
  }
}

async function mapTranslateFn(index) {
  if (index == allKeyList.length) {
    // 写入文件
    console.log(`翻译且保存完毕`);
  } else {
    console.log(`正在翻译第: ${index}行`);
    const key = allKeyList[index];
    const nextStr = originData[key];
    if (nextStr) {
      const str = await translateText(nextStr, { to: lang });
      if (str) {
        console.log(`successed_current`, str);
        fs.appendFileSync(path.join(__dirname, '../output_pro', `${lang}.properties`), `${key}=${str}` + '\n');
        // 将转换为Unicode码的结果写入输出文件,英文不用转
        if (lang != "en") {
          const encodedText = encodeUnicode(str);
          fs.appendFileSync(path.join(__dirname, '../output_pro', `${lang}.encode.properties`), `${key}=${encodedText}` + '\n');
        }
        mapTranslateFn(index + 1);
      } else {
        setTimeout(()=> {
          mapTranslateFn(index);
        }, 3000)
        console.log(`repeatting_current`, nextStr);
      }
    }
  }
}
// 翻译并保存
async function translateAndSave(originData) {
  allKeyList = Object.keys(originData || {});
  if (allKeyList && allKeyList.length) {
    await mapTranslateFn(0);
  } else {
    console.log("先生成json格式的数据再翻译")
  }
}

function createFileFn() {
  // 使用空字符串创建并清空指定文件 zh.properties 文件
  // 部分需要unicode翻译文件
  const createFile = path.join(__dirname, `../output_pro/${lang}.properties`);
  const encodeFile = path.join(__dirname, `../output_pro/${lang}.encode.properties`);
  fs.writeFile(encodeFile,'', (err) => {
    if (err) {
      console.error(`创建${lang}.encode.properties文件错误:`, err);
    } else {
      console.log(`${lang}.encode.properties 文件已创建并清空`);
    }
  });
  fs.writeFile(createFile,'', (err) => {
    if (err) {
      console.error(`创建${lang}.propertie文件错误`, err);
    } else {
      console.log(`${lang}.properties 文件已创建并清空`);
      translateAndSave(originData);
    }
  });
}
// 先创建静态文件
createFileFn();