/*
  set images in slider from files,
  upload images,
  for export --> inline imageData into coffee/js template
*/

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

/*----  Ectract image data  ----*/
let imgData = [];
const imageCanvas = document.createElement('canvas');
imageCanvas.width = imageCanvas.height = 256;
const imageCanvasCtx = imageCanvas.getContext("2d", { willReadFrequently: true });

function getPixelDataFromImage( img ) {

  imageCanvasCtx.fillStyle = "black";
  imageCanvasCtx.fillRect(0, 0, 256, 256);
  // Calculate the new size while maintaining aspect ratio
  const aspectRatio = img.width / img.height;
  let newWidth, newHeight;
  if (aspectRatio > 1) {
    newWidth = 256;
    newHeight = 256 / aspectRatio;
  } else {
    newWidth = 256 * aspectRatio;
    newHeight = 256;
  }
  // Center the image on the canvas
  const x = (256 - newWidth) / 2;
  const y = (256 - newHeight) / 2;
  // Draw the image on the canvas
  imageCanvasCtx.drawImage(img, x, y, newWidth, newHeight);
  // Get the pixel data
  const imageData = imageCanvasCtx.getImageData(0, 0, 256, 256);
  const pixels = [];
  // Extract RGB data from the pixel data
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push(imageData.data[i]); // Red
    pixels.push(imageData.data[i + 1]); // Green
    pixels.push(imageData.data[i + 2]); // Blue
  }

  return pixels;
}

// init

const imgPath = './img/'

const imageUrls = [
  imgPath+'colors.jpg',
  imgPath+'drop.jpg',
  imgPath+'eraserhead.jpg',
  imgPath+'lenna.png',
  imgPath+'toxie.jpg'
]

const imageViewEl = $id('imageDataView');

let allDone = -1;
let allDoneCb = function(){};
function setImageDataDelayed( imgEl, i){
  setTimeout( (function(){
    imgData[i] = getPixelDataFromImage( imgEl );
    allDone--;
    if( allDone==0 ){ allDoneCb(); }
  }), 10*i );
}

function init( cb ){
  allDoneCb = cb;
  allDone = 0;
  imageUrls.forEach((url, i) => {
    allDone++;
    const containerEl = document.createElement('div');
    const imgEl = document.createElement('img');
    const h4El = document.createElement('h4');
    const delBtnEl = document.createElement('button');
    delBtnEl.innerText = 'X';
    imgEl.src = url;
    imgEl.alt = url;
    h4El.innerText = i;
    containerEl.appendChild( delBtnEl );
    containerEl.appendChild( h4El );
    containerEl.appendChild( imgEl );
    imageViewEl.appendChild( containerEl );
    imgData[i] = getPixelDataFromImage( imgEl );
    setImageDataDelayed( imgEl, i );
  });

}



const Images = {
  init: init,
  getImageData: function(){
    return imgData;
  },
};

export default Images;
