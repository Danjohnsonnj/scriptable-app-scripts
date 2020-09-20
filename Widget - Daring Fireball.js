// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// {
//   "title"
//   "date_modified"
//   "external_url"
//   "content_html"
// }
let items = await loadItems()
let widget = await createWidget(items)
// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentMedium()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let item = items[0]

  let strDate = getFormattedDate(item["date_modified"])

  let gradient = new LinearGradient()
  let baseHex = "#045880"
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#034868" + "ff"),
    new Color("#034868" + "00")
  ]
  let w = new ListWidget()
  w.backgroundColor = new Color(baseHex)
  w.backgroundGradient = gradient
  // Add spacer above content to center it vertically.
  w.addSpacer()
  // Show article headline.
  let titleTxt = w.addText(item.title)
  titleTxt.font = Font.regularSystemFont(16)
  titleTxt.textColor = Color.white()
  titleTxt.lineLimit = 4
  console.log(titleTxt)
  // Add spacer above content to center it vertically.
  w.addSpacer(4)
  // Show date.
  let dateTxt = w.addText(strDate)
  dateTxt.font = Font.mediumSystemFont(10)
  dateTxt.textColor = Color.white()
  dateTxt.textOpacity = 0.9
  // Add spacing below content to center it vertically.
  w.addSpacer()
  w.url = item.url
  return w
}

async function loadItems() {
  let url = "https://daringfireball.net/feeds/json"
  let req = new Request(url)
  let json = await req.loadJSON()
  return json.items
}

function getFormattedDate(dateString) {
  let rawDate = dateString
  let date = new Date(Date.parse(rawDate))
  let dateFormatter = new DateFormatter()
  dateFormatter.useFullDateStyle()
  dateFormatter.useShortTimeStyle()
  return dateFormatter.string(date)
}