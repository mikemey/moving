/* global location confirm Compressor FormData */

const page = {
  fullPath: null,
  basePath: null,
  existingIds: null
}

$(() => {
  page.fullPath = $(location).attr('href')
  page.basePath = page.fullPath.split('?')[0]
  page.existingIds = $.makeArray($('.boxId')).map(el => $(el).text())

  $('#box-form').submit(event => {
    const boxId = $('#boxIdInput').val()
    const boxIdExists = page.existingIds.includes(boxId)
    if (boxIdExists && !confirm(`Overwrite existing box ${boxId} ?`)) {
      return
    }

    showLoader()
    event = event || window.event
    event.preventDefault()

    const formData = new FormData()
    formData.append('boxId', $('#boxIdInput').val())
    formData.append('contents', $('#contentInput').val())

    const imageFile = document.getElementById('imageInput').files[0]
    if (imageFile) {
      return new Compressor(imageFile, {
        quality: 0.6,
        maxWidth: 640,
        success: result => {
          formData.append('image', result, result.name)
          uploadBoxForm(formData, boxIdExists)
        }
      })
    } else {
      uploadBoxForm(formData, boxIdExists)
    }
  })
})

const editEntry = el => {
  const row = $(el).closest('tr')
  $('#boxIdInput').val(row.find('.boxId').text())
  $('#contentInput').val(row.find('.content').text())
  $('#confirmInput').text('update...')
}

const showImage = el => {
  $('#detail-img').attr('src', $(el).attr('src'))
  $('#detail-modal').modal('show')
}
const hideImage = () => $('#detail-modal').modal('hide')

const showLoader = () => {
  $('#confirmInput').addClass('d-none')
  $('#loader').removeClass('d-none')
}

const deleteEntry = boxId => {
  if (confirm(`Delete box: ${boxId} ?`)) {
    return $.ajax({
      url: `${page.basePath}/${boxId}`,
      type: 'DELETE',
      success: () => { window.location = page.fullPath }
    })
  }
}

const uploadBoxForm = (form, boxExists) => $.ajax({
  url: `${page.basePath}`,
  type: 'POST',
  data: form,
  success: () => {
    window.location = boxExists ? page.fullPath : page.basePath
  },
  enctype: 'multipart/form-data',
  processData: false,
  contentType: false,
  cache: false
})
