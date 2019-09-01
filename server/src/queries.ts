import AWS from "aws-sdk"
import uuidv4 from "uuid/v4"
import { addSeconds } from "date-fns"

import { getItem, scanItems } from "./dynamodb"

export const album = async (
  _: any,
  { userId, albumId }: { userId: string; albumId: string }
) => {
  const result = await getItem({ Key: { userId, albumId } })

  if (!result.Item) {
    return {}
  }

  const images = await scanItems({
    TableName: process.env.IMAGES_TABLE,
    FilterExpression: "#album = :albumId",
    ExpressionAttributeNames: { "#album": "albumId" },
    ExpressionAttributeValues: { ":albumId": albumId },
  })

  return {
    ...result.Item,
    images: images ? images.Items : [],
  }
}

export const allAlbum = async (_: any, { userId }: { userId?: string }) => {
  const result = await scanItems(
    userId
      ? {
          FilterExpression: "#user = :userId",
          ExpressionAttributeNames: { "#user": "userId" },
          ExpressionAttributeValues: { ":userId": userId },
        }
      : {}
  )

  if (!result.Items) {
    return []
  }

  return result.Items.map(async album => {
    const images = await scanItems({
      TableName: process.env.IMAGES_TABLE,
      FilterExpression: "#album = :albumId",
      ExpressionAttributeNames: { "#album": "albumId" },
      ExpressionAttributeValues: { ":albumId": album.albumId },
    })

    return {
      ...album,
      images: images ? images.Items : [],
    }
  })
}

const S3 = new AWS.S3({
  signatureVersion: "v4",
})
// in production you would use AWS SecretsManager for these
// here we create a example user with full S3 access
AWS.config.update({
  accessKeyId: "***REMOVED***",
  secretAccessKey: "***REMOVED***",
  region: process.env.S3_REGION,
})

export const presignedUploadUrl = async (
  _: any,
  { albumId }: { albumId: string }
) => {
  const imageId = uuidv4()
  const filename = `${albumId}/${imageId}`
  const expireSeconds = 60 * 5
  const readUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${filename}`

  const uploadUrl = S3.getSignedUrl("putObject", {
    Bucket: process.env.S3_BUCKET,
    Key: filename,
    ContentType: "image/*",
    Expires: expireSeconds,
  })

  return {
    uploadUrl,
    readUrl,
    imageId,
    expiresAt: addSeconds(new Date(), expireSeconds),
  }
}
