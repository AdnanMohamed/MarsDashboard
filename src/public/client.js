let store = Immutable.Map({
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  selectedRover: "",
  rover: {},
  photos: [],
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  //   store = Object.assign(store, newState);
  store = store.merge(newState);
  render(root, store.toJS());
};

const updateSelectedRover = (roverName) => {
  fetchRoverData(roverName)
    .then((newState) => {
      return Immutable.Map(newState).merge({ selectedRover: roverName });
    })
    .then((newState) => {
      updateStore(store, newState);
    });
};

const render = (root, state) => {
  root.innerHTML = App(state);
};

const getRoverData = (rover) => {
  return fetch(`http://localhost:3000/rovers/${rover}`)
    .then((res) => res.json())
    .then((obj) => obj.photos)
    .then((data) => data.slice(0, 5));
};

const fetchRoverData = (selectedRover) => {
  return getRoverData(selectedRover)
    .then((data) => {
      const rover = data[0].rover;
      const newState = {
        rover: {
          launchDate: rover.launch_date,
          landingDate: rover.landing_date,
          status: rover.status,
        },
        photos: data.map((item) => {
          return {
            src: item.img_src,
            camera: item.camera,
            date: item.earth_date,
          };
        }),
      };
      // console.log(newState);
      //updateStore(store, newState);
      return newState;
    })
    .catch(console.error);
};

window.onload = () => {
  render(root, store.toJS());
};

const RoverInfo = ({ landingDate, launchDate, status }) => {
  if (landingDate && launchDate && status) {
    return `
    <div class="col-md-4">
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Rover Name</h5>
            <p class="card-text">Launch Date: ${landingDate}</p>
            <p class="card-text">Landing Date: ${launchDate}</p>
            <p class="card-text">Status: ${status}</p>
        </div>
    </div>
    </div>
    `;
  } else {
    return "";
  }
};

// create content
const App = (state) => {
  let { rovers, selectedRover, rover, photos } = state;
  return `
    ${PageTitle("mars dashboard")}
    ${RoversSelector(rovers, selectedRover)}
    ${RoverInfo(rover)}
    ${RoverPhotoGallery(photos)}
    `;
};

// ------------------------------------------------------  COMPONENTS

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  // console.log(photodate.getDate(), today.getDate());

  // console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  } else {
    return `
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
  }
};

const PageTitle = (title) => {
  return `<h1 class="text-center py-3">${title.toUpperCase()}</h1>`;
};

const RoverPhotoGallery = (photos) => {
  return `
        <section class="container">
            <div class="container text-center">
                <div class="row align-items-center">
                    ${RenderCards(photos)}
                </div>
            </div>
        </section>
    `;
};

const RenderCard = (photo, cardTitle) => {
  const src = photo.src;
  const cameraName = photo.camera.name;
  const photoDate = photo.date;
  return `
        <div class="card col-3 m-2">
            <img src="${src}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${cardTitle}</h5>
                <p class="card-text">Taken by the ${cameraName} camera at ${photoDate}</p>
            </div>
        </div>`;
};

const RenderCards = (roverPhotos) => {
  let result = roverPhotos
    .map((photo, i) => RenderCard(photo, `Photo #${i + 1}`))
    .join("");
  return result;
};

// const updateSelectedRover = (rover) => {
//   if (
//     store.rovers.findIndex((r) => r.toUpperCase() == rover.toUpperCase()) === -1
//   ) {
//     throw new Error(`The rover must be one of ${store.rovers}`);
//   }
//   store.selectedRover = rover;
//   updateRoverData(store);
// };

const selectOnChange = (e) => {
  const roverName = e.target.value;
  //   store = roverName;
  //   fetchRoverData(store.get("selectedRover"));
  updateSelectedRover(roverName);
};

const RoversSelector = (rovers, selected) => {
  //console.log(selected);
  return `
        <div id="selectorContainer" class="row mt-5 mb-3">
            <div class="col-md-4">
                <label for="exampleSelect" class="form-label">Select an Option</label>
                <select class="form-select" id="exampleSelect" aria-label="Select an option" onchange="selectOnChange(event)">
                    <option value="" disabled ${
                      selected === "" ? "selected" : ""
                    }>Select a rover</option>
                    ${rovers.map((rover) => {
                      return rover === selected
                        ? `<option value="${rover}" selected>${rover}</option>`
                        : `<option value="${rover}">${rover}</option>`;
                    })}
                </select>
            </div>
        </div>
    `;
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));

  return data;
};
