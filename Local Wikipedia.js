// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: map-marked-alt;
function getWikipediaURL(params) {
  const urlBase = "https://en.wikipedia.org/w/api.php";
  let url = urlBase + "?origin=*";
  Object.keys(params).forEach(function (key) {
    url += "&" + key + "=" + params[key];
  });
  return encodeURI(url);
}

function alertNoResults() {
  const prompt = new Alert();
  prompt.message = "No local results";
  prompt.presentAlert();
  Script.complete();
  return null;
}

const LOCATIONS = {
  "Current Location": null,
  NYC: { latitude: 40.730610, longitude: -73.935242 },
  Seattle: { latitude: 47.608013, longitude: -122.335167 },
  London: { latitude: 51.509865, longitude: -0.118092 },
};

let prompt = new Alert();
Object.keys(LOCATIONS).forEach((l) => {
  prompt.addAction(l);
})
prompt.addCancelAction('Done');
let choice = await prompt.presentAlert();
if (choice === -1) {
  return Script.complete();
}
const queryLocation = choice === 0 ? await Location.current() : Object.values(LOCATIONS)[choice];

console.log(queryLocation);

let req = new Request(getWikipediaURL({
  action: "query",
  list: "geosearch",
  gscoord: queryLocation.latitude + "|" + queryLocation.longitude,
  gsradius: 10000,
  gslimit: 10,
  format: "json"
}));
let response = await req.loadJSON();
console.log(response);
prompt = new Alert();
prompt.addCancelAction('Done');
let results = response.query.geosearch;
if (results.length === 0) {
  return alertNoResults();
}

for (let r in results) {
  prompt.addAction(results[r].title);
}
choice = await prompt.presentAlert();
if (choice === -1) {
  return Script.complete();
}

req = new Request(getWikipediaURL({
  action: "query",
  pageids: results[choice].pageid,
  format: "json",
  prop: "extracts",
  explaintext: true,
  formatversion: 2
}));
response = await req.loadJSON();

if (response.query && response.query.pages) {
  const info = response.query.pages[0].extract;
  QuickLook.present(info);
  Script.complete();
} else {
  return alertNoResults();
}