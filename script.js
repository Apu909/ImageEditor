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

//functie de incarcare a imaginii in canvas
function loadImage(e) {
  const reader = new FileReader();
  reader.onload = function (ev) {
    const image = new Image();
    image.onload = function () {
      canvas_image.width = image.width;
      canvas_image.height = image.height;
      ctx.drawImage(image, 0, 0);

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
select_button.addEventListener("click", () => {
  rectDiv.style.display = "block";
  rectDiv.style.position = "absolute";
  rectDiv.style.left = canvas_image.offsetLeft + "px";
  rectDiv.style.top = canvas_image.offsetTop + "px";
  rectDiv.style.width = 700 + "px";
  rectDiv.style.height = 700 + "px";

  //selectare portiune imagine
  canvas_image.addEventListener("mousedown", mousedown);
  canvas_image.addEventListener("mouseup", mouseup);
  canvas_image.addEventListener("mousemove", mousemove);

  var grab = false;

  function mousedown(e) {
    grab = true;
    rect.x0 = e.clientX;
    rect.y0 = e.clientY;
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
  ctx.drawImage(
    canvas_image,
    rect.x0 - 600,
    rect.y0 - 100,
    rectDiv.offsetWidth,
    rectDiv.offsetHeight,
    0,
    0,
    canvas_image.width,
    canvas_image.height
  );
});

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
