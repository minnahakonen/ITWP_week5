import "./styles.css";
import L from "leaflet";

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const response = await fetch(url);
  const data = await response.json();
  //console.log(data);
  const dataclone = data;

  const url2 =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const response2 = await fetch(url2);
  const data2 = await response2.json();
  //console.log(data2);

  const url3 =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const response3 = await fetch(url3);
  const data3 = await response3.json();
  //console.log(data3);

  const map1 = new Map();
  const map2 = new Map();

  const keys = Object.keys(data2.dataset.dimension.Tuloalue.category.label);

  keys.shift();
  //console.log(keys);

  const positiveValues = Object.values(data2.dataset.value);
  positiveValues.shift();
  //console.log(positiveValues);

  const negativeValues = Object.values(data3.dataset.value);
  negativeValues.shift();
  //console.log(negativeValues);

  const positivepairs = [keys, positiveValues];
  const negativepairs = [keys, negativeValues];

  for (let i = 0; i < positivepairs[0].length; i++) {
    map1.set(positivepairs[0][i].substring(2), positivepairs[1][i]);
  }

  for (let i = 0; i < negativepairs[0].length; i++) {
    map2.set(negativepairs[0][i].substring(2), negativepairs[1][i]);
  }
  //console.log(map1);
  //console.log(map2);

  for (let i of dataclone.features) {
    //console.log(i)
    i.properties.muuttovoitto = i.properties[map1.key] = map1.get(
      i.properties.kunta
    );
  }
  //console.log(dataclone)

  for (let i of dataclone.features) {
    //console.log(i)
    i.properties.muuttotappio = i.properties[map2.key] = map2.get(
      i.properties.kunta
    );
  }
  //console.log(dataclone);

  initializeMap(dataclone);
};

const initializeMap = (dataclone) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJson = L.geoJSON(dataclone, {
    onEachFeature: getFeature,
    style: getStyle,
    weight: 2
  }).addTo(map);

  let openSrtMp = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }
  ).addTo(map);

  let baseMaps = {
    OpenStreetMap: openSrtMp
  };

  let overlayMaps = {
    Municipalities: geoJson
  };

  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getFeature = (feature, layer) => {
  if (!feature.properties.nimi) return;
  const nimi = feature.properties.nimi;
  const muuttovoitto = feature.properties.muuttovoitto;
  const muuttotappio = feature.properties.muuttotappio;
  //console.log(nimi);
  layer.bindPopup(
    `<ul>
          <li>Name: ${nimi}</li>
          <li>Arrivals (year 2020): ${muuttovoitto}</li>
          <li>Departures (year 2020): ${muuttotappio}</li>
          
    
      </ul>`
  );
  layer.bindTooltip(nimi);
};

const getStyle = (feature) => {
  const muuttovoitto = feature.properties.muuttovoitto;
  const muuttotappio = feature.properties.muuttotappio;

  let hue = (muuttovoitto / muuttotappio) ** 3 * 60;
  if (hue > 120) {
    hue = 120;
  }
  const clr = `hsl(${hue}, 75%, 50%)`;

  return { color: clr };
};

fetchData();
