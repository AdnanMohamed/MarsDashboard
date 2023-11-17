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

const root = document.getElementById("root"); // get the root to add HTML content to.

/**
 * Main function to construct and render the application's UI.
 *
 * @param {Object} state - The current state of the application, including rover data and
 *                         photos.
 * @returns {string} HTML string representing the entire application UI.
 */
const App = (state) => {
  let { rovers, selectedRover, rover, photos } = state;
  return `
      ${PageTitle("mars dashboard")}
      ${RoversSelector(rovers, selectedRover)}
      ${RoverInfo(rover)}
      ${RoverPhotoGallery(photos)}
      `;
};

/**
 * Renders the application UI in the specified root element.
 *
 * This function is responsible for rendering the entire application UI based on the current
 * state. It dynamically generates HTML content and inserts it into the root DOM element.
 *
 * @param {HTMLElement} root - The root DOM element where the application UI is rendered.
 * @param {Object} state - The current state of the application.
 *
 */
const render = (root, state) => {
  root.innerHTML = App(state);
};

/**
 * Updates the application's state and re-renders the UI.
 *
 * This function is responsible for updating the state of the application with new data and
 * ensuring that the UI reflects these changes. It merges the new state with the existing one,
 * keeping the values from the new state and retaining any values from the old state that are not
 * overridden.
 *
 * @param {Immutable.Map | Object} store - The current state of the application. This can be an
 *                                          Immutable.Map or a regular JavaScript object with the
 *                                          same structure as the initial state.
 * @param {Immutable.Map | Object} newState - An Immutable.Map or JavaScript object containing
 *                                            the updated state properties. These properties will
 *                                            override the corresponding ones in the current state.
 *
 * Return Value:
 * - No return value.
 */
const updateStore = (store, newState) => {
  store = store.merge(newState);
  render(root, store.toJS());
};

/**
 * Fetches data for a specified rover from the server.
 *
 * This function makes an API call to retrieve data for the given rover. The data includes
 * rover details and a set of recent photos taken by the rover.
 *
 * @param {string} selectedRover - The name of the rover for which data is to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the rover data.
 *
 */
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

/**
 * Updates the selected rover in the state and fetches its data.
 *
 * This function is triggered when a user selects a rover from the UI. It fetches data for the
 * selected rover and updates the application state with this new data, including the rover's
 * name, its information, and recent photos.
 *
 * @param {string} roverName - The name of the rover selected by the user.
 *
 */
const updateSelectedRover = (roverName) => {
  fetchRoverData(roverName)
    .then((newState) => {
      return Immutable.Map(newState).merge({ selectedRover: roverName });
    })
    .then((newState) => {
      updateStore(store, newState);
    });
};

/**
 * Handles the selection change event for the rover dropdown.
 *
 * @param {Event} event - The event object triggered on selection change.
 */
const selectOnChange = (e) => {
  const roverName = e.target.value;
  updateSelectedRover(roverName);
};

/**
 * Initializes the application when the window loads.
 * This function sets up the initial state of the application and triggers the first render
 * of the UI components.
 */
window.onload = () => {
  render(root, store.toJS());
};

// ------------------------------------------------------  COMPONENTS

/**
 * Generates HTML content for the page title.
 *
 * @param {string} title - The title text to be displayed.
 * @returns {string} HTML string representing the page title as an uppercase header element.
 */
const PageTitle = (title) => {
  return `<h1 class="text-center py-3">${title.toUpperCase()}</h1>`;
};

/**
 * Constructs a dropdown selector for choosing a Mars rover.
 *
 * @param {Array<string>} rovers - An array of available rover names.
 * @param {string} selectedRover - The currently selected rover name.
 * @returns {string} HTML string representing a dropdown selector for rovers.
 */
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

/**
 * Creates HTML content for displaying information about the selected rover.
 *
 * @param {Object} rover - Object containing details of the selected rover including
 *                         launchDate, landingDate, and status.
 * @returns {string} HTML string representing the rover's information in a card layout.
 */

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

/**
 * Creates a gallery component for displaying rover photos.
 *
 * @param {Array<Object>} photos - An array of photo objects for the selected rover.
 * @returns {string} HTML string representing a photo gallery layout.
 */
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

/**
 * Renders a single photo card.
 *
 * @param {Object} photo - The photo object containing the image source, camera name, and
 *                         date taken.
 * @param {string} title - The title for the photo card.
 * @returns {string} HTML string representing a single photo card.
 */

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

/**
 * Generates a collection of photo cards for the gallery.
 *
 * @param {Array<Object>} photos - An array of photo objects to be rendered as cards.
 * @returns {string} HTML string representing a collection of photo cards.
 */
const RenderCards = (roverPhotos) => {
  let result = roverPhotos
    .map((photo, i) => RenderCard(photo, `Photo #${i + 1}`))
    .join("");
  return result;
};

// ------------------------------------------------------  API CALLS

/**
 * Fetches detailed information and photos for a specified rover.
 *
 * @param {string} roverName - The name of the rover for which data is to be fetched.
 * @returns {Promise<Object>} A promise resolving to the rover data.
 */
const getRoverData = (rover) => {
  return fetch(`http://localhost:3000/rovers/${rover}`)
    .then((res) => res.json())
    .then((obj) => obj.photos)
    .then((data) => data.slice(0, 5));
};
