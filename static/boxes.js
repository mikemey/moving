/* global location confirm Compressor FormData */

const page = {
  basePath: null
}

$(() => {
  page.basePath = $(location).attr('href')

  $('#box-form').submit(event => {
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
          uploadBoxForm(formData)
        }
      })
    } else {
      uploadBoxForm(formData)
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
  if (confirm(`Delete box: ${boxId}?`)) {
    return $.ajax({
      url: `${page.basePath}/${boxId}`,
      type: 'DELETE',
      success: () => { window.location = page.basePath }
    })
  }
}

const uploadBoxForm = form => $.ajax({
  url: `${page.basePath}`,
  type: 'POST',
  data: form,
  success: () => { window.location = page.basePath },
  enctype: 'multipart/form-data',
  processData: false,
  contentType: false,
  cache: false
})
