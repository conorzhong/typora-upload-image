import COS from 'cos-nodejs-sdk-v5'
import dayjs from 'dayjs'
import { readFile } from 'fs/promises'
import path from 'path'
import * as yargs from 'yargs'

export async function register() {
  yargs
    .command(
      'tencent <filePaths..>',
      'Use tencent cloud to upload files',
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
        renameTimeStamp: {
          description:
            'Rename file before upload just like typora. For example, if set to true, a file named "image.jpg" might be renamed to "image-20240117185600000.jpg"',
          alias: 'rts',
          type: 'boolean',
          default: false,
        },
      },
      async function (argv) {
        const cos = new COS({
          SecretId: argv.secretId,
          SecretKey: argv.secretKey,
        })

        for (const filePath of argv.filePaths as string[]) {
          if (typeof filePath === 'string') {
            const key = await getKey(filePath, argv.renameTimeStamp)
            if (!(await doesObjectExist(cos, argv.bucket, argv.region, key))) {
              const body = await readFile(filePath.toString())
              const { Location: url } = await cos.putObject({
                Bucket: argv.bucket,
                Region: argv.region,
                Key: key,
                StorageClass: 'STANDARD',
                Body: body,
              })
              console.log(url)
            } else {
              throw new Error(`file ${filePath} already exists`)
            }
          } else {
            throw new Error(`filePath ${filePath} is not string`)
          }
        }
      }
    )
    .example(
      '$0 tencent -i xxx -k xxx -b xxx -r xxx --rts ./my/file/path1.png ./my/file/path2.png',
      'Upload files to tencent cloud after rename them with timestamp'
    )
    .help()
    .parse()
}

async function doesObjectExist(
  cos: COS,
  bucket: string,
  region: string,
  key: string
) {
  try {
    const data = await cos.headObject({
      Bucket: bucket,
      Region: region,
      Key: key,
    })
    return !!data
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false
    } else if (error.statusCode === 403) {
      throw new Error('403')
    }
  }
}

async function getKey(filePath: string, renameTimeStamp: boolean) {
  if (renameTimeStamp) {
    await delay(1) // 防止图片重名
    return `image-${dayjs().format('YYYYMMDDHHmmssSSS')}${path.extname(
      filePath
    )}`
  } else {
    return path.basename(filePath)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
