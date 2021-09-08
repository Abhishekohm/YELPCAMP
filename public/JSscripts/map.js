mapboxgl.accessToken =
  "pk.eyJ1IjoiYWJoaXNoZWstb2htIiwiYSI6ImNrcDB4ZjBpMjBsMTcycG13anR5MGRrZjkifQ.ElFFJS-tJghFCo4uyltoLQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
  center: campground1.geometry.coordinates, // starting position [lng, lat]
  zoom: 7, // starting zoom
});

const popup = new mapboxgl.Popup({ offset: 25 }).setText(
  `${campground1.title}, ${campground1.location}`
);

const el = document.createElement("div");
el.id = "marker";

new mapboxgl.Marker(el)
  .setLngLat(campground1.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);

// const popup = new mapboxgl.Popup({ closeOnClick: false })
//   .setLngLat([-96, 37.8])
//   .setHTML("<h1>Hello World!</h1>")
//   .addTo(map);
// new mapboxgl.Marker()
//   .setLngLat(campground.geometry.coordinates)
//   .setPopup(
//     new mapboxgl.Popup({ offset: 25 }).setHTML(
//       `<h3>${campground.title}</h3><p>${campground.location}</p>`
//     )
//   )
//   .addTo(map);
