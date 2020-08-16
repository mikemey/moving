const express = require('express')
const multer = require('multer')

const upload = multer()
const recsPerPage = 5

const mainRouter = colls => {
  const router = express.Router()

  router.get('/', (req, res) => {
    const boxCursor = colls.boxes.find({})
    return boxCursor.count()
      .then(count => {
        const pageCount = Math.ceil(count / recsPerPage)
        const pageIx = (req.query.p || pageCount) - 1
        const startIx = pageIx * recsPerPage
        return Promise.all([
          boxCursor.skip(startIx).limit(recsPerPage).toArray(),
          pageCount,
          pageIx
        ])
      }).then(([boxes, pageCount, currentPageIx]) => {
        return res.render('main', { boxes, pageCount, currentPageIx })
      })
  })

  router.post('/', upload.single('image'), (req, res) => {
    const boxId = req.body.boxId
    if (!boxId) { return res.sendStatus(400).send('no box-id provided!') }

    const contents = req.body.contents
    const imageObj = req.file
      ? { image: `data:image/png;base64,${req.file.buffer.toString('base64')}` }
      : {}
    const boxData = Object.assign(imageObj, { boxId, contents })

    return colls.boxes.updateOne({ boxId }, { $set: boxData }, { upsert: true })
      .then(() => res.sendStatus(204))
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
