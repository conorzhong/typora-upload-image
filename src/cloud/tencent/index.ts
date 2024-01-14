import COS from 'cos-nodejs-sdk-v5'
import { readFile } from 'fs/promises'
import path from 'path'
import * as yargs from 'yargs'

export async function register() {
  yargs.command(
    'tencent [files..]',
    'Use tencent cloud to upload a file',
    {
      secretId: {
        description: 'The secret ID',
        alias: 'i',
        type: 'string',
        demandOption: true,
      },
      secretKey: {
        description: 'The secret key',
        alias: 'k',
        type: 'string',
        demandOption: true,
      },
      bucket: {
        description: 'The bucket',
        alias: 'b',
        type: 'string',
        demandOption: true,
      },
      region: {
        description: 'The region',
        alias: 'r',
        type: 'string',
        demandOption: true,
      },
      files: {
        description: 'The file to upload',
        type: 'array',
        demandOption: true,
      },
      debug: {
        description: 'Debug',
        type: 'boolean',
      },
    },
    async function (argv) {
      if (argv.debug) {
        console.log(argv)
      }

      const cos = new COS({
        SecretId: argv.secretId,
        SecretKey: argv.secretKey,
      })

      const urls = await Promise.all(
        argv.files.map(async (file) => {
          const key = path.basename(file.toString())
          const body = await readFile(file.toString())

          return new Promise((resolve, reject) => {
            cos.putObject(
              {
                Bucket: argv.bucket, // 必须
                Region: argv.region, // 存储桶所在地域，必须字段
                Key: key, // 必须
                StorageClass: 'STANDARD',
                Body: body, // 上传文件对象
                onProgress: function (progressData) {
                  if (argv.debug) {
                    console.log(JSON.stringify(progressData))
                  }
                },
              },
              function (err, data) {
                if (err) {
                  // 处理请求出错
                  if (argv.debug) {
                    console.log(err)
                  }
                } else {
                  // 处理请求成功
                  if (argv.debug) {
                    console.log(data)
                  }
                  resolve(data.Location)
                }
              }
            )
          })
        })
      )

      urls.map((url) => console.log(url))
    }
  ).argv
}
