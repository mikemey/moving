/* global location confirm */

const page = {
  basePath: null
}

$(() => { page.basePath = $(location).attr('href') })

const editEntry = el => {
  const row = $(el).closest('tr')
  $('#boxIdInput').val(row.find('.boxId').text())
  $('#contentInput').val(row.find('.content').text())
  $('#confirmInput').text('update...')
}

const imageWidths = { small: '160px', large: '320px' }

const showImage = el => {
  $('#detail-img').attr('src', $(el).attr('src'))
  $('#detail-modal').modal('show')
}

const hideImage = () => $('#detail-modal').modal('hide')

const deleteEntry = boxId => {
  if (confirm(`Delete box: ${boxId}?`)) {
    return $.ajax({
      url: `${page.basePath}/${boxId}`,
      type: 'DELETE',
      success: () => { window.location = page.basePath }
    })
  }
}
