const canvas = document.getElementById('preview');
const fileInput = document.querySelector('input[type="file"');
const asciiImage = document.getElementById('ascii');

const context = canvas.getContext('2d');

const greyScaleImage = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

// Convert an image to its grey scale version
const convertToGrayScales = (context, width, height) => {
    // Start at the top left corner, end at the bottom right corner.
    const imageData = context.getImageData(0, 0, width, height);

    const grayScales = [];

    for (let i = 0 ; i < imageData.data.length ; i += 4) {
        // Turn each piece of the image's RGB data into its black and white form.
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const grayScale = greyScaleImage(r, g, b);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

        // 
        grayScales.push(grayScale);
    }

    context.putImageData(imageData, 0, 0);

    return grayScales;
};

// Keep the image in proportion with the size of the font

    // Getting the font ratios (so that it's modular)
const getFontRatio = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = ' ';

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);

    return height / width;
};

const fontRatio = getFontRatio();

    // Making the image fit with the ratio of the font, and making it have a maximum width and height.
        // Default values
let maxWidth = 80; 
let maxHeight = 80;

const proportionalizeImage = (width, height) => {
    const proportionateWidth = Math.floor(getFontRatio() * width);

    // Check for height being too large
    if (height > maxHeight) {
        const reducedWidth = Math.floor(proportionateWidth * maxHeight / height);
        return [reducedWidth, maxHeight];
    }

    if (width > maxWidth) {
        const reducedHeight = Math.floor(height * maxWidth / proportionateWidth);
        return [maxWidth, reducedHeight];
    }

    // Fetched as an array --> const [width, height]
    return [proportionateWidth, height];
};

// --> const asciiImage = document.getElementById('ascii'); | <pre> ascii output block

// The ascii letter for each grey value
let greyValues = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

// Turn each pixel into an ascii character
const pixelToASCII = grayScale => greyValues[Math.ceil((greyValues.length - 1) * grayScale / 255)];

const imgToASCII = (grayScales, width) => {

    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = pixelToASCII(grayScale);
        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    asciiImage.textContent = ascii;

    document.getElementById("finalSettings").innerText = `Grey ramp: ${greyValues} \nMax Width: ${maxWidth} \nMax height: ${maxHeight} \nASCII length: ${ascii.length} \n(Also printed to console)`;

};

// Draw the clamped image
fileInput.onchange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            const [width, height] = proportionalizeImage(image.width, image.height);

            canvas.width = width;
            canvas.height = height;

            context.drawImage(image, 0, 0, width, height);
            const grayScales = convertToGrayScales(context, width, height);

            // fileInput.style.display = 'none'; // <-- make it so that the file input disappears once an image is chosen (OPTIONAL)
            imgToASCII(grayScales, width);

            // Draw the original image onto the "original" canvas
            let ogCanvas = document.getElementById("original");
            ogCanvas.width = image.width;
            ogCanvas.height = image.height;
            ogCanvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
        }

        image.src = event.target.result;
    };

    document.getElementById("outputDiv").style.display = "inline-block";
    document.getElementById("originalDiv").style.display = "inline-block";

    reader.readAsDataURL(file);
    fileInput.value = null;
};



const imageGreyRamp = document.getElementById("greyRamp");
const imageMaxWidth = document.getElementById("imageMaxWidth");
const imageMaxHeight = document.getElementById("imageMaxHeight");

const saveSettingsButton = document.getElementById("saveSettings");

saveSettingsButton.onclick = _ => {
    greyValues = imageGreyRamp.value;
    maxWidth = parseInt(imageMaxWidth.value);
    maxHeight = parseInt(imageMaxHeight.value);

    console.log(`Grey ramp: ${greyValues} \nMax Width: ${maxWidth} \nMax height: ${maxHeight}`);
};