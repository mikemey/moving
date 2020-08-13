const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const upload = multer()
const preprocessImage = req => req.file
  ? sharp(req.file.buffer).rotate().resize({ width: 640 }).toBuffer()
    .then(imageBuffer => {
      return { image: `data:image/png;base64,${imageBuffer.toString('base64')}` }
    })
  : Promise.resolve({})

const mainRouter = (colls, config) => {
  const router = express.Router()

  router.get('/', (_, res) => colls.boxes.find({})
    .toArray()
    .then(boxes => {
      return res.render('main', { boxes })
    })
  )

  router.post('/', upload.single('image'), (req, res) => {
    const boxId = req.body.boxId
    const contents = req.body.contents

    return preprocessImage(req)
      .then(imageObj => {
        const boxData = Object.assign(imageObj, { boxId, contents })
        return colls.boxes.updateOne({ boxId }, { $set: boxData }, { upsert: true })
      })
      .then(() => res.redirect(config.serverPath))
      .catch(err => {
        console.log(err)
        res.status(500).end()
      })
  })

  router.delete('/:boxId', (req, res) => {
    const boxId = req.params.boxId
    return colls.boxes.deleteOne({ boxId })
      .then(() => res.sendStatus(204))
      .catch(err => {
        console.log(err)
        res.status(500).end()
      })
  })

  return router
}

module.exports = mainRouter
