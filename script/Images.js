/*
  set images in slider from files,
  upload images,
  for export --> inline imageData into coffee/js template
*/

let sendImgDataCb = function(){};

/*----  Upload image  ----*/
const uploadImgBtn = $id('addImageButton');
uploadImgBtn.addEventListener('change', loadImage);

function loadImage() {
  let file = this.files[0];
  let reader = new FileReader();

  reader.onload = function (event) {
    let base64String = event.target.result;
    $id('preview').src = base64String;
    $id('preview').style.display = 'block';
    console.log(base64String);
  };

  reader.readAsDataURL(file);
};

let imgData = [];
const imageCanvas = document.createElement('canvas');
imageCanvas.style.imageRendering = 'pixelated';
imageCanvas.width = imageCanvas.height = 256;
const imageCanvasCtx = imageCanvas.getContext("2d", { willReadFrequently: true });

/*----  Extract image data  ----*/
function getPixelDataFromImage(img, resolution = 256) {
  imageCanvas.width = imageCanvas.height = resolution;
  imageCanvasCtx.clearRect(0, 0, resolution, resolution);
  imageCanvasCtx.imageSmoothingEnabled = false;

  const aspectRatio = img.width / img.height;
  let newWidth, newHeight;
  if (aspectRatio > 1) {
    newWidth = resolution;
    newHeight = resolution / aspectRatio;
  } else {
    newWidth = resolution * aspectRatio;
    newHeight = resolution;
  }

  const x = (resolution - newWidth) / 2;
  const y = (resolution - newHeight) / 2;

  imageCanvasCtx.drawImage(img, x, y, newWidth, newHeight);

  const imageData = imageCanvasCtx.getImageData(0, 0, resolution, resolution);
  const pixels = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push(imageData.data[i]);     // Red
    pixels.push(imageData.data[i + 1]); // Green
    pixels.push(imageData.data[i + 2]); // Blue
  }

  return pixels;
}


// Init
const imgPath = './img/';

const imageUrls = [
  imgPath + 'colors.jpg',
  imgPath + 'eraserhead.jpg',
  imgPath + 'drop.jpg',
  imgPath + 'lennaFull.jpg',
  imgPath + 'lenna.png',
  imgPath + 'toxie.jpg',
];

const imageViewEl = $id('imageDataView');

function loadImageAndGetData(url, index) {
  return new Promise((resolve) => {
    const imgEl = new Image();
    imgEl.src = url;
    imgEl.onload = function () {
      addImgHTML( imgEl, index );
      imgData[index] = getPixelDataFromImage(imgEl);
      resolve();
    };
  });
}

function addImgHTML( imgEl, i ){
  const containerEl = document.createElement('div');
  containerEl.classList.add('imgWrap');
  const h4El = document.createElement('h4');
  const delBtnEl = document.createElement('button');
  delBtnEl.onclick = function(e){
    imageViewEl.removeChild(containerEl);
    //refreshImgData();
  }
  h4El.innerText = i;
  containerEl.appendChild( delBtnEl );
  containerEl.appendChild( h4El );
  containerEl.appendChild( imgEl );
  imageViewEl.appendChild( containerEl );
}

async function init() {
  imgData = []; // Reset imgData
  const promises = imageUrls.map((url, index) => loadImageAndGetData(url, index));
  await Promise.all(promises);
  sendImgDataCb( imgData );
}

async function refreshImgData( scale = 0 ) {
  const resolution = 1<<(8-scale);
  const imgEls = imageViewEl.getElementsByTagName('img');
  for (let i = 0; i < imgEls.length; i++) {
    const el = imgEls[i];
    imgData[i] = getPixelDataFromImage(el, resolution);
  }
  sendImgDataCb( imgData );
}


const Images = {
  init: function( sendImgDataCbNew, resolution ){
    sendImgDataCb = sendImgDataCbNew
    return init();
  },
  refreshImgData: refreshImgData
};

export default Images;
