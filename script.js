
// ----- TOGGLE FULLSCREEN ----- //
function toggleFullScreen() {
    const fullscreenToggleButton = document.getElementById('fullscreen-toggle-button');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        // change the background-image of #fullscreen-toggle-button to exit-fullscreen-icon.png
        fullscreenToggleButton.style.backgroundImage = 'url("./assets/exit-fullscreen-icon.png")';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            // change the background-image of #fullscreen-toggle-button to fullscreen-icon.png
            fullscreenToggleButton.style.backgroundImage = 'url("./assets/fullscreen-icon.png")';
        }
    }
}


// ----- HANDLE CAMERA SELECTION OVERLAY ----- //
const cameraSelectionOverlay = document.getElementById('camera-selection-overlay'); 
cameraSelectionOverlay.addEventListener('click', (e) => {
    if (e.target === cameraSelectionOverlay) {
        cameraSelectionOverlay.style.display = 'none';
    }
});

function openCameraSelectionOverlay() {
    cameraSelectionOverlay.style.display = 'flex';
}


// ----- HANDLE FORCED MOBILE ASPECT RATIO ----- //
let FORCED_MOBILE_ASPECT_RATIO = false;
async function toggleForcedMobileMode() {
    // ask user to confirm if they really want to change the aspect ratio
    const option = confirm("You should only use this if the aspect ratio of the current camera feed is off.\n\nAre you sure you want to force mobile aspect ratio mode for the camera feed? This will inverse the current aspect ratio: if it's 4:3 (landscape), it will be forced to 3:4 (portrait) and vice versa.\n\nYou can always change this back by clicking the button again.");

    if (!option) {
        return;
    }

    FORCED_MOBILE_ASPECT_RATIO = !FORCED_MOBILE_ASPECT_RATIO;
    const forcedMobileModeButton = document.getElementById('angry-toggle-button');
    if (FORCED_MOBILE_ASPECT_RATIO) {
        forcedMobileModeButton.style.backgroundImage = 'url("./assets/angry.png")';
    }
    else {
        forcedMobileModeButton.style.backgroundImage = 'url("./assets/ok.png")';
    }

    // try to stop the camera first before starting a new one
    const stateInd = html5QrCode.getState();
    const stateMembers = { "NOT_STARTED": 1, "PAUSED": 3, "SCANNING": 2, "UNKNOWN": 0 };
    const state = Object.keys(stateMembers).find(key => stateMembers[key] === stateInd);

    if (state === "SCANNING" || state === "PAUSED") {
        await html5QrCode.stop().catch((err) => { console.log(err) });
        stopAnimateBodyTitle();
    }

    // start the camera again
    startCamera();
}



// ----- HANDLE EXPAND/COLLAPSE INFO PANEL ----- //

// Vertical --> Horizontal Layout Aspect Ratio Threshold
const aspectRatioThreshold = 4/3.95;


// Handle swipe to expand #info-panel-container: 
let isInfoPanelExpanded = false;


function infoBodyContainterWrapHandler() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const infoBodyContainer = document.getElementById('info-panel-body-container');
    infoBodyContainer.scrollTop = 0;
    if (aspectRatio >= aspectRatioThreshold) {
        // if infoPanel is expanded, set text-wrap to wrap
        if (isInfoPanelExpanded) {
            infoBodyContainer.style.textWrap = 'wrap';
        }
        // else set text-wrap to nowrap
        else {
            infoBodyContainer.style.textWrap = 'nowrap';
        }
    } else {
        // set text-wrap to wrap
        infoBodyContainer.style.textWrap = 'wrap';
    }
}


function expandInfoPanel() {
    const infoPanelContainer = document.getElementById('info-panel-container');
    infoPanelContainer.classList.add('info-panel-transition');
    if (!isInfoPanelExpanded) {
        infoPanelContainer.style.width = '100%';
        infoPanelContainer.style.height = '100%';
        
        isInfoPanelExpanded = true;
        infoBodyContainterWrapHandler();
    }

    setTimeout(() => {
        infoPanelContainer.classList.remove('info-panel-transition');
    }, 300);
}

function collapseInfoPanel() {
    const infoPanelContainer = document.getElementById('info-panel-container');
    infoPanelContainer.classList.add('info-panel-transition');
    if (isInfoPanelExpanded) {
        infoPanelContainer.style.width = '0%';
        infoPanelContainer.style.height = '0%';

        isInfoPanelExpanded = false;
        infoBodyContainterWrapHandler();
    }

    setTimeout(() => {
        infoPanelContainer.classList.remove('info-panel-transition');
    }, 300);
}

// Swipe detection for #info-panel-container
const infoPanelContainer = document.getElementById('info-panel-container');
const expandSelectionZone = document.getElementById('expand-selection-zone');

let touchStartX = 0;
let touchStartY = 0;
let touchStartX_mv = 0;
let touchEndX = 0;
let touchStartY_mv = 0;
let touchEndY = 0;
// Set a threshold for swipe detection, 20% of the min dimension of the screen
const swipeThreshold = 0.20 * Math.min(window.innerWidth, window.innerHeight);

expandSelectionZone.addEventListener('touchstart', (e) => {
    // Remove transition class
    infoPanelContainer.classList.remove('info-panel-transition');

    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 1)');

    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    touchStartX_mv = e.changedTouches[0].clientX;
    touchStartY_mv = e.changedTouches[0].clientY;
    touchEndX = 0;
    touchEndY = 0;
});

expandSelectionZone.addEventListener('touchmove', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    const swipeX = touchEndX - touchStartX_mv;
    const swipeY = touchEndY - touchStartY_mv;

    const aspectRatio = window.innerWidth / window.innerHeight;
    if (aspectRatio >= aspectRatioThreshold) {
        infoPanelContainer.style.width = `${Math.max(0, infoPanelContainer.offsetWidth - swipeX)}px`;
        infoPanelContainer.style.height = '100%';
        infoBodyContainterWrapHandler();
    } else {
        infoPanelContainer.style.height = `${Math.max(0, infoPanelContainer.offsetHeight - swipeY)}px`;
        infoPanelContainer.style.width = '100%';
        infoBodyContainterWrapHandler();
    }

    touchStartX_mv = touchEndX;
    touchStartY_mv = touchEndY;
});

expandSelectionZone.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    const swipeX = touchEndX - touchStartX;
    const swipeY = touchEndY - touchStartY;

    // Add transition class
    infoPanelContainer.classList.add('info-panel-transition');

    // Expand if the state is not expanded and swipeX is greater than the threshold
    if (!isInfoPanelExpanded && (-swipeX > swipeThreshold || -swipeY > swipeThreshold)) {
        expandInfoPanel();
    }
    else if (isInfoPanelExpanded && (swipeX > swipeThreshold || swipeY > swipeThreshold)) {
        collapseInfoPanel();
    }
    // else reset the width and height to the original state
    else {
        if (isInfoPanelExpanded) {
            infoPanelContainer.style.width = '100%';
            infoPanelContainer.style.height = '100%';
            infoBodyContainterWrapHandler();
        }
        else {
            infoPanelContainer.style.width = '0%';
            infoPanelContainer.style.height = '0%';
            infoBodyContainterWrapHandler();
        }
    }

    // Reset the touchStartX and touchEndX
    touchStartX = 0;
    touchStartY = 0;

    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 0.502)');
});



// Handle mouse hover into #expand-selection-zone --> change color of the --expand-guide-bar-color
// Default --expand-guide-bar-color: rgba(218, 218, 218, 0.502);
// if mouse over or down, change color to rgba(218, 218, 218, 1)
// when mouse out or up, change color back to rgba(218, 218, 218, 0.502)

expandSelectionZone.addEventListener('mouseover', (e) => {
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 1)');
});
expandSelectionZone.addEventListener('mousedown', (e) => {
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 1)');
});

expandSelectionZone.addEventListener('mouseout', (e) => {
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 0.502)');
});
expandSelectionZone.addEventListener('mouseup', (e) => {
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 0.502)');
});


// Handle click on #expand-selection-zone --> toggle width/height of #info-panel-container to 100% or 0% and reset the color of the --expand-guide-bar-color

expandSelectionZone.addEventListener('click', (e) => {
    infoPanelContainer.classList.add('info-panel-transition');
    if (isInfoPanelExpanded) {
        collapseInfoPanel();
        setTimeout(() => {
            infoPanelContainer.classList.remove('info-panel-transition');
        }, 300);
    } else {
        expandInfoPanel();
    }
    
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 0.502)');
    setTimeout(() => {
        infoPanelContainer.classList.remove('info-panel-transition');
    }, 300);
});


// Listen for resize event and handle the #info-panel-body-container text-wrap
let lastResizeTime = Date.now(); // last resize time epoch
let restartCameraTimeout = null;
window.addEventListener('resize', async (e) => {
    lastResizeTime = Date.now();
    if (restartCameraTimeout) {
        clearTimeout(restartCameraTimeout);
    }

    infoBodyContainterWrapHandler();
    getPreferredCameraAspectRatio();

    const stateInd = await html5QrCode.getState();
    const stateMembers = { "NOT_STARTED": 1, "PAUSED": 3, "SCANNING": 2, "UNKNOWN": 0 };
    const state = Object.keys(stateMembers).find(key => stateMembers[key] === stateInd);

    if (state === "PAUSED" || state === "SCANNING") {
        // Stop scanning
        await html5QrCode.stop().catch((err) => { console.log(err) });
        stopAnimateBodyTitle();
        
        // only start the camera if the last resize event was more than some time ago
        restartCameraTimeout = setTimeout( async () => {
            restartCameraTimeout = null;
            infoBodyContainterWrapHandler();
            getPreferredCameraAspectRatio();
            await startCamera();
        }, 1500);
    }
});

// If click on #the-void, collapse the #info-panel-container
const theVoid = document.getElementById('the-void');
theVoid.addEventListener('click', (e) => {
    infoPanelContainer.classList.add('info-panel-transition');
    if (isInfoPanelExpanded) {
        infoPanelContainer.style.width = '0%';
        infoPanelContainer.style.height = '0%';
        isInfoPanelExpanded = false;
    }
    document.documentElement.style.setProperty('--expand-guide-bar-color', 'rgba(218, 218, 218, 0.502)');
    
    setTimeout(() => {
        infoPanelContainer.classList.remove('info-panel-transition');
    }, 300);
});






// ----- HANDLE CAMERA BARCODE CODE SCANNING ----- //

let CAMERA_LIST = null;
let SELECTED_CAMERA_ID = null;
const html5QrCode = new Html5Qrcode("camera-component");

// look up table for screen aspect ratios to camera aspect ratios to select the correct camera resolution
// format as [[minscreenAspectRatio, maxscreenAspectRatio], cameraAspectRatio]
// if min and max screen aspect ratio is null, it either from 0 to min or max to infinity
const screenAspectRatiosToCameraAspectRatios = [[[null, 8/16], 9/16], [[8/16, 2.6/4], 3/4], [[2.6/4, 1/1.3], 1/1], [[1/1.3, 4/3.95], 4/3], [[4/3.95, 10/8], 3/4], [[10/8, 12.5/8], 1/1], [[12.5/8, null], 4/3]]; 
let screenAspectRatio = window.innerWidth / window.innerHeight;

// Get aspect ratio of the screen to select the correct camera resolution
let selectedCameraAspectRatio = null;
function getPreferredCameraAspectRatio() {
    screenAspectRatio = window.innerWidth / window.innerHeight;
    for (let i = 0; i < screenAspectRatiosToCameraAspectRatios.length; i++) {
        const screenAspectRatioRange = screenAspectRatiosToCameraAspectRatios[i][0];
        const cameraAspectRatio = screenAspectRatiosToCameraAspectRatios[i][1];
        if ((screenAspectRatioRange[0] === null || screenAspectRatio >= screenAspectRatioRange[0]) && (screenAspectRatioRange[1] === null || screenAspectRatio < screenAspectRatioRange[1])) {
            selectedCameraAspectRatio = cameraAspectRatio;
            // console.log(selectedCameraAspectRatio);
            break;
        }
    }
}
getPreferredCameraAspectRatio();



function handlePermission() {
    // if camera permission is denied, show an alert
    if (!navigator.permissions) {
        alert("Browser does not support navigator.permissions to enable camera. Embedded browsers in social media apps often fail to support this feature. You may need to use a different browser.");
        return;
    }

    navigator.permissions.query({ name: 'camera' }).then((permissionStatus) => {
        if (permissionStatus.state === 'denied') {
            // Show Info overlay with instructions on how to enable camera permissions
            alert("Camera permissions are denied. Please allow camera permissions to use this app. You know, cuz' it's a barcode scanner app and all...");
        }
    });
}




async function updateCameraOptions() {
    getPreferredCameraAspectRatio();
    const devices = await Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
        console.log(err);
        handlePermission();
    }
    console.log(devices);

    // for each device, add a radio button
    const radioListContainer = document.getElementById('radio-list-container');
    
    // clear the radioListContainer list first
    radioListContainer.innerHTML = '';

    for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        const radioComponent = document.createElement('label');
        radioComponent.className = 'radio-component';
        radioComponent.innerHTML = `<input type="radio" name="camera_${i}" onchange="updateCameraSelection(this)"><span>${device.label}</span>`;
        radioListContainer.appendChild(radioComponent);
    }
    return devices;
}

function updateCameraSelection(element) {
    // update localStorage with the lastUsedCameraId
    const cameraIndex = element.name.split('_')[1];
    const cameraId = CAMERA_LIST[cameraIndex].id;
    localStorage.setItem('HTML5_QRCODE_DATA', JSON.stringify({ lastUsedCameraId: cameraId }));

    // update the selected camera id
    getPreferredCameraAspectRatio();
    uncheckOtherRadios(element);
    startCamera();

    // close the camera selection overlay
    cameraSelectionOverlay.style.display = 'none';
}

// Handle unchecking other radio buttons when one is checked
function uncheckOtherRadios(element) {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        if (radio !== element) {
            radio.checked = false;
        }
    });
}


let bodyTitleAnimateHandle = null;
// function that start the animation of the body title "• Scanning •" --> "• • Scanning • •" --> "• • • Scanning • • •" --> "• Scanning •"
function animateBodyTitle() {
    const bodyTitle = document.getElementById('body-title');
    let bodyTitleText = "Scanning"
    let bodyTitleTextIndex = 0;
    
    bodyTitleAnimateHandle = setInterval(() => {
        if (bodyTitleTextIndex === 0) {
            bodyTitle.innerHTML = "  " + bodyTitleText + "  ";
        }
        else if (bodyTitleTextIndex === 1) {
            bodyTitle.innerHTML = "• " + bodyTitleText + " •";
        }
        else {
            bodyTitle.innerHTML = "  " + bodyTitleText + "  ";
            bodyTitleTextIndex = 0;
        }
        bodyTitleTextIndex++;
    }, 500);
}
function stopAnimateBodyTitle() {
    clearInterval(bodyTitleAnimateHandle);
}


const qrCodeSuccessCallback = async (decodedText, decodedResult) => {
    stopAnimateBodyTitle();
    // hide the item-info-container
    const itemInfoContainer = document.getElementById('item-info-container');
    itemInfoContainer.style.display = 'none';


    // change #body-title to "Scan Result"
    document.getElementById('body-title').innerHTML = "Scan Result";


    // add content to #qr-code-content
    const qrCodeAtag = document.getElementById('qr-code-atag');
    const qrCodeContent = document.getElementById('qr-code-content');
    const qrCodeContentWrapper = document.getElementById('qr-code-content-wrapper');
    const qrCodeEmoji = document.getElementById('qr-code-emoji');
    qrCodeContent.innerHTML = decodedText;


    // show the qr-code-content
    qrCodeContentWrapper.style.display = 'block';
    await html5QrCode.pause(true, false);

    // Cosmetic changes cuz the HTML5QrCode library is not very nice
    // find a div inside of #camera-component whose text is "Scanner paused" and delete that div
    const scannerPausedElement = document.querySelector('#camera-component');
    // Check all divs inside of #camera-component for the text "Scanner paused"
    const scannerPausedDivs = scannerPausedElement.querySelectorAll('div');
    scannerPausedDivs.forEach(div => {
        if (div.innerHTML === "Scanner paused") {
            div.remove();
        }
    });


    // if the decodedText is a URL, change the qrCodeEmoji to "🔗", otherwise, the clipboard
    if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
        qrCodeEmoji.innerHTML = "🔗";
        qrCodeAtag.href = decodedText;
        qrCodeAtag.setAttribute('target', '_blank');
        qrCodeAtag.setAttribute('title', 'Click to Open in New Tab');

        // Handle URL QR Code --> No book info needed
        expandInfoPanel();

        return;
    }
    
    qrCodeEmoji.innerHTML = "📋";
    // remove the href attribute
    qrCodeAtag.removeAttribute('href');
    qrCodeAtag.removeAttribute('target');
    qrCodeAtag.setAttribute('title', 'Click to Copy to Clipboard');




    // Handle ISBN

    const parsedISBN = ISBN.parse(decodedText)
    if (!parsedISBN) {
        // show #not-isbn-notice
        const notISBNNotice = document.getElementById('not-isbn-notice');
        notISBNNotice.style.display = 'block';
        expandInfoPanel();
        return;
    }
    else {
        // hide #not-isbn-notice
        const notISBNNotice = document.getElementById('not-isbn-notice');
        notISBNNotice.style.display = 'none';
    }

    await handleBookInfo(parsedISBN);

    expandInfoPanel();
};



function copyBarcodeToClipboard(element) {
    // <p class="center" id="qr-code-content-wrapper" style="display: none;"><strong><a class="medium-text" style="cursor: pointer;" title="Click to Copy to Clipboard" onclick="copyBarcodeToClipboard(this)"><span id="qr-code-content"></span> <span id="qr-code-emoji"></span></a></strong></p>
    const barcodeText = document.getElementById('qr-code-content').innerHTML;

    // Check if it's a URL, if so, return (don't copy to clipboard)
    if (barcodeText.startsWith("http://") || barcodeText.startsWith("https://")) {
        return;
    }


    // Try to parse the barcodeText as an ISBN, if it is, format it without the hyphens
    const parsedISBN = ISBN.parse(barcodeText);
    let barcodeTextF = null;
    if (parsedISBN && parsedISBN.isValid) {
        barcodeTextF = parsedISBN.isIsbn13 ? parsedISBN.isbn13 : parsedISBN.isbn10;
    }
    else {
        barcodeTextF = barcodeText;
    }


    navigator.clipboard.writeText(barcodeTextF).catch((err) => { console.log(err) });

    // change the "📋" icon to " ✔" (make it #4dc48d) for 2 seconds and then change back if the barcodeText is still the same
    const qrCodeEmoji = document.getElementById('qr-code-emoji');
    qrCodeEmoji.innerHTML = " ✔";
    qrCodeEmoji.style.color = "#4dc48d";
    setTimeout(() => {
        if (document.getElementById('qr-code-content').innerHTML === barcodeText) {
            qrCodeEmoji.innerHTML = "📋";
            qrCodeEmoji.style.color = "9aafd6";
        }
    }, 2000);
}


// Handle starting the camera
async function startCamera() {
    // try to stop the camera first before starting a new one
    const stateInd = await html5QrCode.getState();
    if (!stateInd || stateInd.length === 0) {
        console.log(err);
        handlePermission();
    }
    const stateMembers = { "NOT_STARTED": 1, "PAUSED": 3, "SCANNING": 2, "UNKNOWN": 0 };
    const state = Object.keys(stateMembers).find(key => stateMembers[key] === stateInd);

    if (state === "SCANNING" || state === "PAUSED") {
        await html5QrCode.stop().catch((err) => { console.log(err) });
        stopAnimateBodyTitle();
    }


    const radios = document.querySelectorAll('input[type="radio"]');
    let selectedRadio = null;
    radios.forEach(radio => {
        if (radio.checked) {
            selectedRadio = radio;
        }
    });
    if (selectedRadio) {
        const cameraIndex = selectedRadio.name.split('_')[1];
        const cameraId = CAMERA_LIST[cameraIndex].id;

        // get #camera-component width and height and set qrbox width and height to 80% of the min dimension
        const cameraComponent = document.getElementById('camera-component');
        const minDimension = Math.min(cameraComponent.offsetWidth, cameraComponent.offsetHeight);

        let aspectRatio = selectedCameraAspectRatio;

        // if screenWidth < 680 flip the selectedCameraAspectRatio
        const isMobile = Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1;
        if (isMobile || FORCED_MOBILE_ASPECT_RATIO) {
            aspectRatio = 1 / aspectRatio;
        }


        const config = {
            fps: 12,
            aspectRatio: aspectRatio,
            disableFlip: false,
            rememberLastUsedCamera: true
        };

        html5QrCode.start({ deviceId: { exact: cameraId} }, config, qrCodeSuccessCallback).catch((err) => {
            stopAnimateBodyTitle();
            // get the new camera list
            updateCameraOptions();
            alert("Failed to start camera. You may need to select a different camera, or refresh the page.");
            return;
        });
        
        // animate the body title
        animateBodyTitle();
    }
}

async function resumeCameraScanning() {
    const stateInd = await html5QrCode.getState();
    if (!stateInd || stateInd.length === 0) {
        console.log(err);
        handlePermission();
    }
    const stateMembers = { "NOT_STARTED": 1, "PAUSED": 3, "SCANNING": 2, "UNKNOWN": 0 };
    const state = Object.keys(stateMembers).find(key => stateMembers[key] === stateInd);
    
    if (state === "PAUSED") {
        collapseInfoPanel();
        await html5QrCode.resume();
        animateBodyTitle();
    }
    else if (state === "SCANNING") {
        return;
    }
    else {
        // try to start the camera
        collapseInfoPanel();
        getPreferredCameraAspectRatio();
        await startCamera();
    }
}





// ----- ISBN Stuff ----- //
const ISBN = window.ISBN;


async function handleBookInfo(parsedISBN) {
    const itemInfoContainer = document.getElementById('item-info-container');
    itemInfoContainer.style.display = 'none';


    // Change #qr-code-content to hyphenated ISBN
    const qrCodeContent = document.getElementById('qr-code-content');
    qrCodeContent.innerHTML = parsedISBN.isIsbn13 ? parsedISBN.isbn13h : parsedISBN.isbn10h;

    // change book cover to placeholder
    const bookCover = document.getElementById('book-cover');
    bookCover.src = "./assets/TankobonCoverMissing.webp";

    const isbn = parsedISBN.isIsbn13 ? parsedISBN.isbn13 : parsedISBN.isbn10;
    const isbnh = parsedISBN.isIsbn13 ? parsedISBN.isbn13h : parsedISBN.isbn10h;

    // Fetch book info from OpenLibrary API: https://openlibrary.org/isbn/{isbn}.json
    const openLibraryAPIroute = `https://openlibrary.org/isbn/${isbn}.json`;

    const bookInfo = await fetch(openLibraryAPIroute).catch((err) => {
        console.log(err);
        return;
    });
    if (!bookInfo || bookInfo.status !== 200) {
        return;
    }
    const bookInfoJSON = await bookInfo.json().catch((err) => {
        console.log(err);
        return;
    });
    if (!bookInfoJSON) {
        return;
    }


    // Update the book name
    const bookName = document.getElementById('book-name');
    bookName.innerHTML = "";
    let title = bookInfoJSON.title;
    // if there is subtitle, add it to the title as title: subtitle
    if (bookInfoJSON.subtitle) {
        title += `: ${bookInfoJSON.subtitle}`;
    }
    bookName.innerHTML = title;

    // Update the book cover
    if (bookInfoJSON.covers) {
        // get the first cover id
        const coverid = bookInfoJSON.covers[0];
        if (coverid == -1) {
            bookCover.src = "./assets/TankobonCoverMissing.webp";
        }
        else {
            bookCover.src = `https://covers.openlibrary.org/b/id/${coverid}-L.jpg`;
        }
    }

    // Update the authors
    const authors = document.getElementById('authors');
    authors.innerHTML = "";
    let authorNames = [];

    if (bookInfoJSON.authors) {
        for (let i = 0; i < bookInfoJSON.authors.length; i++) {
            let authorKey = bookInfoJSON.authors[i].key;
            authorKey = authorKey[0] === '/' ? authorKey.slice(1) : authorKey;
            const authorInfo = await fetch(`https://openlibrary.org/${authorKey}.json`).catch((err) => {
                console.log(err);
                return;
            });
            if (!authorInfo || authorInfo.status !== 200) {
                continue;
            }
            const authorInfoJSON = await authorInfo.json().catch((err) => {
                return;
            });
            if (!authorInfoJSON) {
                continue;
            }
            authorNames.push(authorInfoJSON.name);
        }

        authors.innerHTML = authorNames.join(", ");
    }



    const searchListContainer = document.getElementById('search-list-container');
    searchListContainer.innerHTML = "";

    // If there is a logo, use the logo and the span is ignored, otherwise, img is the icon and span is the name
    for (let i = 0; i < BOOKSITES.length; i++) {
        const bookSite = BOOKSITES[i];
        const searchListItem = document.createElement('a');
        searchListItem.href = bookSite
            .searchQuery
            .replace("{{isbn}}", isbn)
            .replace("{{name}}", title);

        searchListItem.target = "_blank";
        searchListItem.className = "search-list-item";
        searchListItem.style.backgroundColor = bookSite.backgroundColor;
        if (bookSite.borderColor !== "none") {
            searchListItem.style.border = `2px solid ${bookSite.borderColor}`;
        }
        else {
            searchListItem.style.border = "none";
        }

        if (bookSite.logo) {
            searchListItem.innerHTML = `<img src="${bookSite.logo}" alt="" class="search-list-item-logo">`;
        }
        else {
            searchListItem.innerHTML = `<img src="${bookSite.icon}" alt="" class="search-list-item-logo">`;
            
            // if there is no logo, add a span with the name
            const searchListItemText = document.createElement('span');
            searchListItemText.className = "search-list-item-text";
            searchListItemText.innerHTML = bookSite.name;
            searchListItem.appendChild(searchListItemText);
        }
        searchListContainer.appendChild(searchListItem);
    }



    // show the item-info-container
    itemInfoContainer.style.display = 'block';
}









// ----- ON PAGE LOAD --> READY APP ----- //

window.onload = async () => {
    CAMERA_LIST = await updateCameraOptions().catch((err) => {
        handlePermission();
    });

    if (!CAMERA_LIST || CAMERA_LIST.length === 0) {
        return;
    }

    // Check localStorage for lastUsedCameraId, if it exists and that id is also in the camera list, select that camera
    let lastUsedCameraId = localStorage.getItem('HTML5_QRCODE_DATA');
    lastUsedCameraId = JSON.parse(lastUsedCameraId);
    lastUsedCameraId = lastUsedCameraId?.lastUsedCameraId || null;

    const availableCameraIds = CAMERA_LIST.map(camera => camera.id);
    if (lastUsedCameraId && availableCameraIds.includes(lastUsedCameraId)) {
        const lastUsedCameraIndex = availableCameraIds.indexOf(lastUsedCameraId);
        const lastUsedCameraRadio = document.querySelector(`input[name="camera_${lastUsedCameraIndex}"]`);
        lastUsedCameraRadio.checked = true;
        await startCamera();
    }
    else {
        // if no lastUsedCameraId or the id is not in the camera list, start the camera selection overlay
        openCameraSelectionOverlay();
    }


    // add class "loaded" to #loading-overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('loaded');
}