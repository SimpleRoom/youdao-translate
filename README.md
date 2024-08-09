# youdao-translate
youdao-translate

### 安装
```
yarn install

```

### 云POS使用
```
1 新增翻译时清空sources/origin_CN.properties 文件并把要翻译的粘贴进来
2 根目录执行,命令行窗口不关闭
npm run dev unicode

就会先自动生成 sources/zh_CN.json文件,再自动分别翻译为 ["zh", "zh_tw", "en", "vi", "ja", "es", "ru", "ko"]语言(zh时候直接转,zh_tw时先转为繁体再转unicode,其他语言才翻译),再自动转为 unicode 追加到云POS项目python仓库翻译目录下的对应翻译文件中(当前项目和Python仓库同目录下),同时 output_pro 目录下会自动生成对应翻译的语言


```

### 把中文json翻译为对应语言的json文件
```

1 把要翻译的json替换到 sources/zh_CN.json中(没有手动创建)
2 跟目录执行 npm run to_json all


```

### 把sources/origin_CN.properties 翻译为对应的json文件

```

1 新增翻译时清空sources/origin_CN.properties 文件并把要翻译的粘贴进来
2 根目录执行,命令行窗口不关闭
npm run dev json

```
