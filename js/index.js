'use strict';

let submitShown = false;  // State of the submit button
let currentArray = [];    // Holds the current array
const NUMBER_OF_RESULTS = 5; // The number of results per page the data table displays
/* global _ */
/* global M */
/* global L */

// Keeps track of the state of the pagination, spinner and submit button
let state = {'chevron-left':'disabled', 'page1':'active', 'page2': 'waves-effect', 
'page3': 'waves-effect', 'page4': 'waves-effect', 'page5': 'waves-effect', 
'chevron-right':'waves-effect', 'current-button':1, 'submitShown': true};

// Fetches parking data from data.seattle.gov and calls createFilteredArray()
// and sortBySpots()
function fetchParkingData() {
    let url = 'https://data.seattle.gov/api/views/7jzm-ucez/rows.json?accessType=DOWNLOAD';
    togglerSpinner();
    let promise = fetch(url)
    let promise2 = promise.then(function(response) {
        return response.json();
    })
    let promise3 = promise2.then(function(data) {
        currentArray = createFilteredArray(data);
        sortBySpots(currentArray);
    })
    .catch(function(error) {
        renderError(error);
    })
    .then(function() {
        togglerSpinner();
    });
    return promise3;
}

// Works with fetchParkingData() to create a new array using only parking data 
// from 2018 in the U-district and the columns that our table uses.
function createFilteredArray(parkingData) {
    parkingData = parkingData.data;
    let universityDistrictArray = parkingData.filter(function(tempParking) {
        return (tempParking[9] === 'University District' && tempParking[25] === '2018' && tempParking[11] === '3-29-18 12:00:00')
    })
    let finalArray = [];
    universityDistrictArray.forEach(function(newTempParking) {
        newTempParking[15] = parseInt(newTempParking[15], 10);
        newTempParking[16] = parseInt(newTempParking[16], 10);
        if (newTempParking[14] === null) {
            newTempParking[14] = 'None';
        }
        if (newTempParking[17] === null) {
            newTempParking[17] = 0;
        }
        finalArray.push(newTempParking.slice(12, 18));
    })
    return finalArray;
}

// Removes previous data and renders new array of data into the table
function renderTable(parkingData) {
    $('tbody').children().remove();
    let number = 0;
    if (parkingData.length >= NUMBER_OF_RESULTS) {
        number = NUMBER_OF_RESULTS;
    } else if (parkingData.length === 0) {
        let error = new Error('No results found');
        renderError(error);
    } else {
        number = parkingData.length;
    }
    for (let i=0; i<number; i++) {
        let tempParking = parkingData[i];
        let tableEntry = $('<tr aria-relevant="additions text"><td class="hide-on-small-only">' + tempParking[0] + 
        '</td><td>' + tempParking[1] + '</td><td class="hide-on-med-and-down">' + tempParking[2] + '</td><td>' + 
        tempParking[3] + '</td><td>' + tempParking[4] + '</td><td>' + '</td><td>' + tempParking[5] + "</td></tr>");
        $('tbody').append(tableEntry);
    }
}

// Works with fetchParkingData() to display an error message
function renderError(error) {
    $('#data-table').append(M.toast({html: error.message}));
}

// Determines when the preloader should be spinning or not
function togglerSpinner() {
    if (state['spinnerShown'] === false) {
        $('.preloader-wrapper').toggleClass('active');
      state['spinnerShown'] = true;
    } else {
        $('.preloader-wrapper').toggleClass('active');
    }
}

// Orders lots by most available parking
function sortBySpots(parkingData) {
    let mostAvailableSpots = _.sortBy(parkingData, [3]);
    mostAvailableSpots = _.reverse(mostAvailableSpots);
    currentArray = mostAvailableSpots;
    renderTable(currentArray);
}

// Orders lots by most handicap parking
function sortByDisabled(parkingData) {
    let mostDisabledSpots = _.sortBy(parkingData, [5]);
    mostDisabledSpots = _.reverse(mostDisabledSpots);
    currentArray = mostDisabledSpots;
    renderTable(currentArray);
}

// Determines whether the street the user inputed exists 
function includesStreet(input) {
    let streetArray = [];
    input = input.toUpperCase();
    currentArray.forEach(function(tempParking) {
        if (_.includes(tempParking[1], input)) {
            streetArray.push(tempParking);
        }
    })
    currentArray = streetArray;
    sortBySpots(currentArray);
}

// Returns pagination to it's original starting state
function originalPagination() {
    if (state['chevron-left'] !== 'disabled') {
        $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect');
    }
    if (state['page1'] !== 'active') {
        $('#page-1').toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
    }
    for (let i=2; i<=5; i++) {
        if (state['page' + i] !== 'waves-effect') {
            $('#page-' + i).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        }
    }
    if (state['chevron-right'] !== 'waves-effect') {
        $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect');
    } 
    state = {'chevron-left':'disabled', 'page1':'active', 'page2': 'waves-effect', 
    'page3': 'waves-effect', 'page4': 'waves-effect', 'page5': 'waves-effect', 
    'chevron-right':'waves-effect', 'current-button':1};
}

// Determines what to do when one of the pagination numbers
// has been clicked
function pageButtonClicked(number) {
    if (state['page' + number] !== 'active') {
        state['page' + number] = 'active';
        $('#page-' + number).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        let tempNum = state['current-button'];
        $('#page-' + tempNum).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        state['page' + tempNum] = 'waves-effect';
        state['current-button'] = number;
        if (number === 1) {
            renderTable(currentArray);
        } else {
            let tempMultiplier = number - 1;
            let tempArray = currentArray.slice(NUMBER_OF_RESULTS * tempMultiplier);
            renderTable(tempArray);
        }
    }
}

// Changed the state of the paginations chevrons
function changeChevronState() {
    if (state['chevron-left'] === 'disabled') {
        state['chevron-left'] = 'waves-effect';
        $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect'); 
    } else if (state['chevron-right'] === 'disabled') {
        state['chevron-right'] = 'waves-effect';
        $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect'); 
    }
}

$('#chevron-left').click(function() {
    if (state['chevron-left'] !== 'disabled') {
        let tempNum = state['current-button'];
        if (tempNum === 5) {
            state['chevron-right'] = 'waves-effect';
            $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect');
        }
        state['page' + tempNum] = 'waves-effect';
        state['page' + (tempNum - 1)] = 'active';
        $('#page-' + tempNum).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        $('#page-' + (tempNum - 1)).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        state['current-button'] = (tempNum - 1);
        if ((tempNum - 1) === 1) {
            state['chevron-left'] = 'disabled';
            $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect');
        }
        tempNum = tempNum - 1;
        if (tempNum === 1) {
            renderTable(currentArray);
        } else {
            let tempMultiplier = tempNum - 1;
            let tempArray = currentArray.slice(NUMBER_OF_RESULTS * tempMultiplier);
            renderTable(tempArray);
        }
    }
})

$('#page-1').click(function() {
    if (state['page1'] !== 'active') {
        state['chevron-left'] = 'disabled';
        $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect');
        if (state['chevron-right'] === 'disabled') {
            state['chevron-right'] = 'waves-effect';
            $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect');
        } 
        pageButtonClicked(1);
    }
})

$('#page-2').click(function() {
    changeChevronState();
    pageButtonClicked(2);
})

$('#page-3').click(function() {
    changeChevronState();
    pageButtonClicked(3);
})

$('#page-4').click(function() {
    changeChevronState();
    pageButtonClicked(4);
})

$('#page-5').click(function() {
    if (state['page5'] !== 'active') {
        state['chevron-right'] = 'disabled';
        $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect');
        if (state['chevron-left'] === 'disabled') {
            state['chevron-left'] = 'waves-effect';
            $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect');
        }
    }
    pageButtonClicked(5);
})

$('#chevron-right').click(function() {
    if (state['chevron-right'] !== 'disabled') {
        let tempNum = state['current-button'];
        if (tempNum === 1) {
            state['chevron-left'] = 'waves-effect';
            $('#chevron-left').toggleClass('disabled').toggleClass('waves-effect');
        }
        state['page' + tempNum] = 'waves-effect';
        state['page' + (tempNum + 1)] = 'active';
        $('#page-' + tempNum).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        $('#page-' + (tempNum + 1)).toggleClass('active').toggleClass('deep-purple darken-3').toggleClass('waves-effect');
        state['current-button'] = (tempNum + 1);
        if ((tempNum + 1) === 5) {
            state['chevron-right'] = 'disabled';
            $('#chevron-right').toggleClass('disabled').toggleClass('waves-effect');
        }
        tempNum = tempNum + 1;
        if (tempNum === 1) {
            renderTable(currentArray);
        } else {
            let tempMultiplier = tempNum - 1;
            let tempArray = currentArray.slice(NUMBER_OF_RESULTS * tempMultiplier);
            renderTable(tempArray);
        }
    }
})

$('#disabled, #disabled2').click(function() {
    sortByDisabled(currentArray);
    originalPagination();
})

$('#open-spots, #open-spots2').click(function() {
    sortBySpots(currentArray);
    originalPagination();
})

$('#submit').click(function() {
    let searchedStreet= $('#street-name').val();
    includesStreet(searchedStreet);
    originalPagination();
    $('#submit').toggleClass('disabled');
    submitShown = false;
})

$('#refresh').click(function() {
    fetchParkingData();
    originalPagination();
    if (submitShown === false) {
        $('#submit').toggleClass('disabled');
        submitShown = true;
    }
})

fetchParkingData();

// Leaflet map
let mymap = L.map('mapid').setView([47.6553, -122.3035], 15);
let marker = L.marker([47.6553, -122.3035])
marker.addTo(mymap);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2VlZ3N0YXIiLCJhIjoiY2pvODJxejY3MDNzeTNycHBuNWFwZnNlZSJ9.GdMIiwY_SKE9Upa7e7hs7g', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);