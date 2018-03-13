const compression = require('compression');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';
const API_KEY = process.env.API_KEY || '';

const app = express();

const Client = require('node-rest-client').Client;
const client = new Client();

const getLocation = (address) => {
  return new Promise((resolve, reject) => {
    client.get('https://maps.googleapis.com/maps/api/geocode/json?key=${API_KEY}&address=Košice', (data, response) => {
      const result = data.results.shift();
      if(result.geometry) {
        resolve(result.geometry.location);
      } else {
        reject('Wrong address: Address not found by Google Maps API.');
      }
    });
  });
}

const getDistance = (origins, destinations) => {
  return new Promise((resolve, reject) => {
    const encodedURL = encodeURI(`https://maps.googleapis.com/maps/api/distancematrix/json?key=${API_KEY}&origins=${origins}&destinations=${destinations}`);
    client.get(encodedURL, (data, response) => {
      const element = data.rows.shift().elements;
      if(element) {
        const distance = element.shift().distance.value / 1000;
        resolve(distance);
      } else {
        reject('Wrong address: Address not found by Google Maps API.');
      }
    });
  });
}

app.get(`/api/${API_VERSION}/distance/:source/:destination`, (req, res) => {

  const { source, destination } = req.params;
  getDistance(source, destination).then((distance) => {
    res.send(`${distance}`);
  })
  /*
  const sourceLocation = getLocation(source);
  const destinationLocation = getLocation(destination);
  
  Promise.all([ sourceLocation, destinationLocation]).then((locations) => {
    console.log(locations[0].lat);
    res.send(locations);
  });
  */
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
