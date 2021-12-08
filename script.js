//input-ul cu care preluam imaginea
const image_loader_input = document.getElementById("image_loader_input");

//canvas-ul unde este afisata imaginea
const canvas_image = document.getElementById("image_canvas");
const ctx = canvas_image.getContext("2d");

//butoanele din meniu
const save_button = document.getElementById("saveButton");
const select_button = document.getElementById("selectButton");
const undoButton = document.getElementById("undoButton");
const remove_image_button = document.getElementById("removeImageButton");
const cropImageButton = document.getElementById("cropImageButton");
const cropButton = document.getElementById("cropButton");
const effect_button = document.getElementById("effectButton");
const cut_button = document.getElementById("cutImageButton");

//functie de incarcare a imaginii in canvas
function loadImage(e) {
  const reader = new FileReader();
  reader.onload = function (ev) {
    const image = new Image();
    image.onload = function () {
      canvas_image.height = canvas_image.width * (image.height / image.width);

      // step 1 - resize to 50%
      var oc = document.createElement("canvas"),
        octx = oc.getContext("2d");

      oc.width = image.width * 0.5;
      oc.height = image.height * 0.5;
      octx.drawImage(image, 0, 0, oc.width, oc.height);

      // step 2
      octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

      // step 3, resize to final size
      ctx.drawImage(
        oc,
        0,
        0,
        oc.width * 0.5,
        oc.height * 0.5,
        0,
        0,
        canvas_image.width,
        canvas_image.height
      );

      // canvas_image.width = image.width;
      // canvas_image.height = image.height;
      // ctx.drawImage(image, 0, 0);

      canvas_image.style.display = "flex";
      image_loader_input.style.display = "none";
    };
    image.src = ev.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
  e.target.value = "";
}

image_loader_input.addEventListener("change", loadImage, false);

remove_image_button.addEventListener("click", () => {
  selector.style.display = "none";
  canvas_image.style.display = "none";
  image_loader_input.style.display = "flex";
});

//functie ce salveaza imaginea curenta din canvas
save_button.addEventListener("click", () => {
  var image = canvas_image.toDataURL("image/png", 1.0);
  downloadImage(image, "my-canvas.jpeg");
});

function downloadImage(data, filename = "untitled.jpeg") {
  var a = document.createElement("a");
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

//==================================================

var rect = {
  x0: 0,
  y0: 0,
  x1: 0,
  y1: 0,
};

var rectDiv = document.getElementById("selector");
var x;
var y;
select_button.addEventListener("click", () => {
  selector.style.display = "block";
  rectDiv.style.display = "block";
  rectDiv.style.position = "absolute";
  rectDiv.style.left = canvas_image.offsetLeft + "px";
  rectDiv.style.top = canvas_image.offsetTop + "px";
  rectDiv.style.width = canvas_image.width + "px";
  rectDiv.style.height = canvas_image.height + "px";

  //selectare portiune imagine
  canvas_image.addEventListener("mousedown", mousedown);
  canvas_image.addEventListener("mouseup", mouseup);
  canvas_image.addEventListener("mousemove", mousemove);

  var grab = false;

  function mousedown(e) {
    grab = true;
    rect.x0 = e.clientX;
    rect.y0 = e.clientY;
    const rect2 = canvas_image.getBoundingClientRect();
    x = e.layerX;
    // alert(x);
    y = e.layerY;
  }

  function mousemove(e) {
    if (grab) {
      rect.x1 = e.clientX;
      rect.y1 = e.clientY;
      showRect();
    }
  }

  function mouseup(e) {
    grab = false;
  }

  function showRect() {
    var rectDiv = document.getElementById("selector");
    rectDiv.style.display = "block";
    rectDiv.style.position = "absolute";
    rectDiv.style.left = rect.x0 + "px";
    rectDiv.style.top = rect.y0 + "px";
    rectDiv.style.width = rect.x1 - rect.x0 + "px";
    rectDiv.style.height = rect.y1 - rect.y0 + "px";
  }
});

//functia de crop interactiv
cropButton.addEventListener("click", () => {
  const image = new Image();
  image.src = canvas_image.toDataURL();
  ctx.drawImage(
    canvas_image,
    //TO DO: see how you can solve this shit
    x,
    y,
    rectDiv.offsetWidth,
    rectDiv.offsetHeight,
    0,
    0,
    canvas_image.width,
    canvas_image.height
  );
});

//sterge selectia
// const cut_button = document.getElementById("cutImageButton");
// cut_button.addEventListener("click", () => {

// })

const menuButtons = Array.from(document.querySelectorAll(".menuButton"));

menuButtons.forEach((buttons) => {
  buttons.addEventListener("click", () => {
    menuButtons.forEach((buttons) => {
      buttons.classList.remove("active");
    });
    buttons.classList.add("active");
  });
});

//salvare imagine

//crop image

//stergere pixeli
cut_button.addEventListener("click", () => {
  const imageData = ctx.getImageData(
    x,
    y,
    rectDiv.offsetWidth,
    rectDiv.offsetHeight
  );
  const data = imageData.data;
  for (var i = 0; i < data.length; i++) {
    data[i] = 255; // red
  }
  ctx.putImageData(
    imageData,
    x,
    y,
    0,
    0,
    rectDiv.offsetWidth,
    rectDiv.offsetHeight
  );
});

//effects

const effect_panel = document.getElementById("effect_panel");
var i = 0;
effect_button.addEventListener("click", () => {
  if (i % 2 === 0) {
    effect_panel.style.display = "flex";
    const image = new Image();
    image.src = canvas_image.toDataURL();

    const sepia_button = document.getElementById("sepia_button");
    const grayscale_button = document.getElementById("grayscale_button");
    const inverted_button = document.getElementById("inverted_button");
    const original_button = document.getElementById("original_button");

    var offsets = rectDiv.getBoundingClientRect();

    grayscale_button.addEventListener("click", () => {
      const imageData = ctx.getImageData(
        x,
        y,
        rectDiv.offsetWidth,
        rectDiv.offsetHeight
      );
      // alert(x + "," + y);
      const data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      ctx.putImageData(
        imageData,
        x,
        y,
        0,
        0,
        rectDiv.offsetWidth,
        rectDiv.offsetHeight
      );
    });

    original_button.addEventListener("click", () => {
      ctx.drawImage(image, 0, 0);
    });

    inverted_button.addEventListener("click", () => {
      const imageData = ctx.getImageData(
        x,
        y,
        rectDiv.offsetWidth,
        rectDiv.offsetHeight
      );
      const data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]; // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
      }
      ctx.putImageData(
        imageData,
        x,
        y,
        0,
        0,
        rectDiv.offsetWidth,
        rectDiv.offsetHeight
      );
    });

    i++;
  } else {
    effect_panel.style.display = "none";
    i++;
  }
});

//text
const textButton = document.getElementById("textButton");
const text_input = document.getElementById("text_input");
const text_input_div = document.getElementById("text_input_div");
const x_coordinate_text = document.getElementById("x_coordinate_text");
const y_coordinate_text = document.getElementById("y_coordinate_text");
const submit_text_button = document.getElementById("submit_text_button");
let j = 0;
textButton.addEventListener("click", () => {
  if (j % 2 === 0) {
    text_input_div.style.display = "block";
    j++;
  } else {
    text_input_div.style.display = "none";
    j++;
  }

  // alert(text);
});
const text = text_input.value;
submit_text_button.addEventListener("click", () => {
  ctx.fillText(text, x, y);
});
