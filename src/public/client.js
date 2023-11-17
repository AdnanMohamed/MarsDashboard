// let store = Immutable.Map({
//   rovers: ["Curiosity", "Opportunity", "Spirit"], // available rover names
//   selectedRover: "", // which of the existing rovers is selected by the user
//   rover: {}, // the information of the selected rover
//   photos: [], // an array of photos containing the source of the photo and other info about each photo.
// });

// State Initialization
// Initialize the application state with Immutable.Map to maintain an immutable application state.
const store = Immutable.Map({
  // 'rovers' holds the names of available Mars rovers.
  // Users can select a rover to view its information and latest photos.
  rovers: Immutable.List(["Curiosity", "Opportunity", "Spirit"]),

  // 'selectedRover' stores the name of the rover selected by the user.
  // It's initially empty as no selection is made at the start.
  selectedRover: "",

  // 'rover' contains information about the selected rover such as its launch date,
  // landing date, and current status. Each property is a string.
  rover: Immutable.Map({ launchDate: "", landingDate: "", status: "" }),

  // 'photos' is an array of photo objects from the selected rover.
  // Each object includes the photo's source URL, camera name, and the date it was taken.
  photos: Immutable.List([]),
});

const root = document.getElementById("root");

const updateStore = (store, newState) => {
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

const selectOnChange = (e) => {
  const roverName = e.target.value;
  updateSelectedRover(roverName);
};

const RoversSelector = (rovers, selected) => {
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

const getRoverData = (rover) => {
  return fetch(`http://localhost:3000/rovers/${rover}`)
    .then((res) => res.json())
    .then((obj) => obj.photos)
    .then((data) => data.slice(0, 5));
};
