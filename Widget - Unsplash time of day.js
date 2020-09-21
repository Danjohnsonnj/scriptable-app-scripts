// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: image;
const widget = await createWidget()
// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentLarge()
}

// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

/**
 * Create an iOS 14+ Widget
 * @returns {Widget} A Widget instance
 */
async function createWidget() {
  // In the Edit Widget modal there is a "Parameter" field
  // which can accept a string:
  const widgetParameter = args.widgetParameter
  const timeOfDaySearchTerm = getTimeOfDaySearchTerms()
  const imgSrc = await getImageSrc([widgetParameter, ...timeOfDaySearchTerm])
  const imgReq = new Request(imgSrc)
  const photo = await imgReq.loadImage()
  const w = new ListWidget()
  w.backgroundImage = photo
  return w
}

/**
 * Get an image source string from Unsplash Source
 * (https://source.unsplash.com/) for a random image
 * based on an optional set of search terms.
 * @param {Array} [searchTerms = []] An Array of search term strings
 * @returns {string} A URL for an image source
 */
async function getImageSrc(searchTerms = []) {
  searchTerms = searchTerms.join(',')
  const url = `https://source.unsplash.com/random/2048x1536?${searchTerms}`
  const webJs = `
    var img = document.querySelector('img');
    JSON.stringify({
      imgUrl : img.src,
    });
  `

  const webView = new WebView()
  await webView.loadURL(url)
  const { imgUrl } = JSON.parse(await webView.evaluateJavaScript(webJs))
  return imgUrl
}

/**
 * Get an Array of search terms based on the time of day.
 * @returns {Array} An Array of strings, e.g. `['nature', 'evening']`
 */
function getTimeOfDaySearchTerms() {
  const hourRanges = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ]

  const date = new Date()
  const dateFormatter = new DateFormatter()
  dateFormatter.useShortTimeStyle()
  const dateString = dateFormatter.string(date)
  const [ time, isAMPM ] = dateString.split(' ')
  const hour = parseInt(time.split(':')[0])
  const rangeIndex = hourRanges.findIndex(item => item.includes(hour))

  let timeOfDaySearchTerm
  switch(rangeIndex) {
    case 0:
      timeOfDaySearchTerm = isAMPM === 'AM' ?
        ['night', 'stars'] : ['nature', 'afternoon']
      break
    case 1:
      timeOfDaySearchTerm = isAMPM === 'AM' ?
        ['sky', 'dawn'] : ['nature', 'evening']
      break
    case 2:
      timeOfDaySearchTerm = isAMPM === 'AM' ?
        ['sky', 'morning'] : ['sky', 'night']
      break
    case 3:
      timeOfDaySearchTerm = isAMPM === 'AM' ?
        ['sky', 'noon'] : ['nature', 'night']
      break
  }
  return timeOfDaySearchTerm
}
