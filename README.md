# youdao-translate
youdao-translate

### 安装
```
yarn install

```

### 使用
```
英语,越南语,日语,西班牙语,俄语,韩语 = ["en", "vi", "ja", "es", "ru", "ko"]
注意: npm run xx lang

1 把sources下的目标文件 zh_CN.properties 转为对应语言的zh_CN.json数据
npm run dev

2 把生成的zh_CN.json翻译为其他语言的json数据
Ex: 翻译为英语的 en.json 数据
npm run to_json en


3 把生成的zh_CN.jsn翻译为其他语言的 en.properties 文件,顺便转为unicode码的en.encode.properties 文件
npm run to_pro en


4 把生成的zh_CN.json依次翻译为 英语,越南语,日语,西班牙语,俄语,韩语 保存到指定文件
npm run auto

```
