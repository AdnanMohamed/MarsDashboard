let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roverInfo: '',
    roverPhotos: ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML += App(state)
}


// create content
const App = (state) => {
    let { rovers, apod, roverPhotos} = state
    return `


    <div class="col-md-4">
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Rover Name</h5>
            <p class="card-text">Launch Date: January 1, 2022</p>
            <p class="card-text">Landing Date: February 1, 2022</p>
            <p class="card-text">Status: Active</p>
        </div>
    </div>
</div>
        <section class="container">
            <div class="container text-center">
                <div class="row align-items-center">
                    ${RenderCards(roverPhotos, 3)}
                </div>
            </div>
        </section>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const RenderCard = (img_info) => {
        console.log(`RenderCard: img_info = ${JSON.stringify(img_info)}`)
        return (`
        <div class="card col-3 m-2">
            <img src="${img_info.img_src}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some!!! quick example text to build on the card title and make up the
                    bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
        </div>`)
        
}

const RenderCards = (roverPhotos, n) => {            
    if(!roverPhotos)
        testApiCall(store)
    let result = "";
    for(let i = 0; i < n; ++i) {
        console.log(roverPhotos[i])
        result += RenderCard(roverPhotos[i]);
    }
    return result;
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return data
}

const testApiCall = (state) => {
    let {roverInfo, roverPhotos} = state;
    fetch(`http://localhost:3000/rovers/curiosity`)
        .then(res => res.json())
        .then(obj => {
            const rover = obj.photos[0].rover;
            roverInfo = { landing_date: rover.landing_date,
                launch_date: rover.launch_date
            }
            roverPhotos = obj.photos.slice(0, 3).map(photo=> {
                return {
                    img_src: photo.img_src,
                    img_date: photo.earth_date
                }
            })
            //console.log(roverPhotos)
            updateStore(store, {roverInfo, roverPhotos})
        })

    return {roverInfo, roverPhotos};
}
