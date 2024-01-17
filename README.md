# typora-upload-image

## tencent

```bash
typora-upload-image tencent --help
```

Output:

```plaintext
Use tencent cloud to upload files

选项：
      --version                 显示版本号                                [布尔]
      --help                    显示帮助信息                              [布尔]
  -i, --secretId                The secret ID                    [字符串] [必需]
  -k, --secretKey               The secret key                   [字符串] [必需]
  -b, --bucket                  The bucket                       [字符串] [必需]
  -r, --region                  The region                       [字符串] [必需]
      --renameTimeStamp, --rts  Rename file before upload just like typora. For
                                example, if set to true, a file named
                                "image.jpg" might be renamed to
                                "image-20240117185600000.jpg"
                                                          [布尔] [默认值: false]
```
