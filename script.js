//input-ul cu care preluam imaginea
const imageLoaderInput = document.getElementById("imageLoaderInput");

//canvas-ul unde este afisata imaginea
const canvasImage = document.getElementById("imageCanvas");
const ctx = canvasImage.getContext("2d");

//butoanele din meniul principal
const selectButton = document.getElementById("selectButton");
const cropButton = document.getElementById("cropButton");
const textButton = document.getElementById("textButton");
const effectButton = document.getElementById("effectButton");
const cutButton = document.getElementById("cutButton");
const saveButton = document.getElementById("saveButton");
const removeImageButton = document.getElementById("removeImageButton");

// variabile pentru meniul secundar
const textInput = document.getElementById("textInput");
const textInputDiv = document.getElementById("textInputDiv");
const fontSize = document.getElementById("fontSize");
const addTextButton = document.getElementById("addTextButton");
const colorTextInput = document.getElementById("colorTextInput");
const effectPanel = document.getElementById("effectPanel");

// dreptunghiul pentru selectie
let selectionRectangle = document.getElementById("selector");

// variabile utile
const widthMax = 800;
const heightMax = 600;
let clickX;
let clickY;

//functie de incarcare a imaginii in canvas
function loadImage(e) {
  const reader = new FileReader();
  reader.onload = function (ev) {
    const image = new Image();
    image.onload = function () {
      let widthImage = image.width;
      let heightImage = image.height;
      // daca imaginea este tip landscape (latimea este mai mare decat inaltimea)
      if (widthImage > heightImage) {
        // daca imaginea depaseste latimea maxima a canvas-ului, va trebui sa o micsoram conform formulelor de mai jos
        if (widthImage > widthMax) {
          heightImage *= widthMax / widthImage;
          widthImage = widthMax;
        }
      } else {
        // daca imaginea este de tip portret (inaltimea este mai mare decat latimea)
        //daca inaltimea imaginii depaseste inaltimea maxima setata, imaginea va fi micsorata folosind formulele de mai jos
        if (heightImage > heightMax) {
          widthImage *= heightMax / heightImage;
          heightImage = heightMax;
        }
      }
      // setam latimea si inaltimea canvas-ului cu latimea si inaltimea imaginii
      canvasImage.width = widthImage;
      canvasImage.height = heightImage;
      // desenam imaginea (image) in canvas la coordonatele (0, 0), cu dimensiunea widthImage x heightImage
      ctx.drawImage(image, 0, 0, widthImage, heightImage);

      // pentru aspect, atunci cand incarcam o imagine, vom ascunde input-ul cu care alegem imaginea si afisam canvas-ul ce contine imaginea selectata
      // setam atributul "display" al canvas-ului cu imaginea cu valoarea "flex"
      canvasImage.style.display = "flex";
      // ascundem input-ul pe care l-am folosit la alegerea si incarcarea imaginii
      imageLoaderInput.style.display = "none";
    };
    image.src = ev.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
  // golim e.target.value deoarece aceasta functie este de tip "change"
  // daca nu resetam valoarea event-ului, nu vom putea incarca aceeasi imagine de 2 ori consecutiv
  e.target.value = "";
}

imageLoaderInput.addEventListener("change", loadImage, false);

// buton ce "sterge" imaginea curenta din canvas
removeImageButton.addEventListener("click", () => {
  // ascunde selectorul (dreptunghiul generat dinamic - pentru selectie)
  selectionRectangle.style.display = "none";
  // ascunde canvas-ul cu imaginea
  canvasImage.style.display = "none";
  // afiseaza input-ul pentru selectarea unei noi imagini
  imageLoaderInput.style.display = "flex";
});

//functie ce salveaza imaginea curenta din canvas
function save() {
  let image = canvasImage.toDataURL("image/png", 1.0);
  downloadImage(image, "image.jpeg");
}

function downloadImage(data, name = "image.jpeg") {
  let a = document.createElement("a");
  a.href = data;
  a.download = name;
  document.body.appendChild(a);
  a.click();
}

// formam un array ce contine toate butoanele din meniul principal
const menuButtons = Array.from(document.querySelectorAll(".menuButton"));

// verificam ce buton a fost apasat (in functie de id) si apelam functia corespunzatoare
menuButtons.forEach((buttons) => {
  buttons.addEventListener("click", () => {
    switch (buttons.id) {
      case "selectButton":
        selection();
        break;
      case "cropButton":
        crop();
        break;
      case "cutButton":
        cut();
        break;
      case "effectButton":
        effect();
        break;
      case "textButton":
        showHideTextMenu();
        break;
      case "saveButton":
        save();
        break;
    }
  });
});

// functia de selectie
function selection() {
  // afisam div-ul pentru selectie
  selectionRectangle.style.display = "block";
  // setam position = "absolute" pentru a putea muta dreptunghiul pentru selectie
  selectionRectangle.style.position = "absolute";
  // initial, dreptunghiul pentru selectia va avea dimensiunea canvas-ului ce retine imaginea
  selectionRectangle.style.left = canvasImage.offsetLeft + "px";
  selectionRectangle.style.top = canvasImage.offsetTop + "px";
  selectionRectangle.style.width = canvasImage.width + "px";
  selectionRectangle.style.height = canvasImage.height + "px";

  //selectare portiune imagine
  canvasImage.addEventListener("mousedown", mousedown);
  canvasImage.addEventListener("mouseup", mouseup);
  canvasImage.addEventListener("mousemove", mousemove);

  // variabila hold este de tip boolean si este folosita pentru a stii daca utilizatorul inca tine butonul mouse-ului apasat
  let hold = false;
  // rectangle retine coordonatele selectiei
  let rectangle = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0,
  };

  // cand utilizatorul apasa click, variabila de hold devine true (butonul mouse-ului este inca apasat)
  function mousedown(e) {
    hold = true;
    // coordonatele punctului din coltul sus-stanga va lua coordonatele click-ului initial
    rectangle.x0 = e.clientX;
    rectangle.y0 = e.clientY;
    // coordonatele punctului unde a fost facut click sunt retinute in variabilele globale clickX si clickY pentru a fi folosite mai tarziu (in restul functiilor)
    clickX = e.layerX;
    clickY = e.layerY;
  }

  // daca utilizatorul inca tine butonul mouse-ului apasat, coordonatele punctului din coltul jos-dreapta al dreptunghiului de selectie
  // se vor modifica odata cu modificarea coordonatelor cursorului
  function mousemove(e) {
    if (hold) {
      rectangle.x1 = e.clientX;
      rectangle.y1 = e.clientY;
      // in tot acest timp, afisam dreptunghiul de selectie
      showRect();
    }
  }

  // cand ridicam degetul de pe butonul mouse-ului, variabila hold va deveni false si dreptunghiul de selectie va ramane la ultimele dimensiuni inregistrate
  function mouseup(e) {
    hold = false;
  }

  function showRect() {
    // afisam dreptunghiul de selectie
    selectionRectangle.style.display = "block";
    selectionRectangle.style.position = "absolute";
    // calculam dimensiunile acestuia in functie de coordonatele calculate
    selectionRectangle.style.left = rectangle.x0 + "px";
    selectionRectangle.style.top = rectangle.y0 + "px";
    selectionRectangle.style.width = rectangle.x1 - rectangle.x0 + "px";
    selectionRectangle.style.height = rectangle.y1 - rectangle.y0 + "px";
  }
}

// functia de crop interactiv folosind dimensiunuile dreptunghiului de selectie
function crop() {
  // redesenam imaginea in canvas
  // clickX si clickY reprezinta coordonatele punctului unde a fost facut click initial (coltul stanga-sus al dreptunghiului de selectie)
  // selectionRectangle.offsetWidth si selectionRectangle.offsetHeight reprezinta dimensiunea dreptunghiului de selectie (ce arie din poza sa fie taiata)
  // 0 si 0 reprezinta punctele coordonatei din stanga-sus de unde va fi desenata imaginea
  // canvasImage.width si canvasImage.height reprezinta dimensiunile in care va fi desenata noua imagine (cea caruia i-a fost aplicata efectul de crop)
  ctx.drawImage(
    canvasImage,
    clickX,
    clickY,
    selectionRectangle.offsetWidth,
    selectionRectangle.offsetHeight,
    0,
    0,
    canvasImage.width,
    canvasImage.height
  );
}

// functie de stergere pixeli
function cut() {
  // preluam intr-o constanta datele imagini cu suprafata egala cu cea a dreptunghiului de selectie
  const imageSectionData = ctx.getImageData(
    clickX,
    clickY,
    selectionRectangle.offsetWidth,
    selectionRectangle.offsetHeight
  );
  const imageData = imageSectionData.data;
  // parcurgem zona selectata si setam pixelii zonei la valoarea 255 (alb)
  for (let i = 0; i < imageData.length; i++) {
    imageData[i] = 255; // alb
  }
  // setam portiunea selectata din imagine cu datele modificate (alb)
  ctx.putImageData(
    imageSectionData,
    clickX,
    clickY,
    0,
    0,
    selectionRectangle.offsetWidth,
    selectionRectangle.offsetHeight
  );
}

// functie ce se ocupa de aplicarea efectelor asupra imaginii
// variabila i este incrementata la fiecare apasare a butonului
// variabila i este folosita pentru a afisa/ascunde meniul de aplicare a efectului ales
let i = 0;
function effect() {
  // daca i este par, vom afisa meniul pentru efecte
  if (i % 2 === 0) {
    effectPanel.style.display = "flex";
    // luam imaginea initiala din canvas si o salvam intr-o variabila de tip imagine
    // pentru a o putea folosi la aplicarea efectului "original"
    const image = new Image();
    image.src = canvasImage.toDataURL();

    // salvam toate butoanele meniului pentru efecte intr-un array
    const effectsMenuButtons = Array.from(
      document.querySelectorAll(".effectButton")
    );

    // parcurgem array-ul de butoane
    effectsMenuButtons.forEach((buttons) => {
      // cand un buton este apasat, luam id-ul butonului apasat si il comparam cu id-urile celorlalte butoane pana gasim butonul care a fost apasat,
      // dupa care aplicam functia necesara
      buttons.addEventListener("click", () => {
        switch (buttons.id) {
          case "grayscaleButton":
            grayscale();
            break;
          case "invertedButton":
            inverted();
            break;
          case "originalButton":
            original();
            break;
        }
      });
    });

    // functie ce aplica efectul de grayscale pe portiunea de imagine selectata
    function grayscale() {
      // luam portiunea selectata din imagine
      const imageSectionData = ctx.getImageData(
        // clickX, clickY reprezinta coordonatele punctului unde a fost facut click initial
        clickX,
        clickY,
        // variabilele urmatoare reprezinta lungimea si latimea selectiei
        selectionRectangle.offsetWidth,
        selectionRectangle.offsetHeight
      );
      // preluam datele selectiei din imagine
      const imageData = imageSectionData.data;
      // parcurgem datele imaginii ca pe un vector (iterand pe pixeli)
      // parcurgerea se face din 4 in 4 pixeli, cate un pixel pentru fiecare culoare + transparenta (RGBA)
      for (let i = 0; i < imageData.length; i += 4) {
        // calculam valoarea medie a valorilor culorilor din pixelii curenti pentru a obtine tonuri de gri
        let avgerage = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
        // setam cei 3 pixeli cu valoarea medie
        imageData[i] = avgerage; // rosu
        imageData[i + 1] = avgerage; // green
        imageData[i + 2] = avgerage; // blue
      }
      // inlocuim portiunea selectata din imagine cu varianta acestia in grayscale
      ctx.putImageData(
        imageSectionData,
        clickX,
        clickY,
        0,
        0,
        selectionRectangle.offsetWidth,
        selectionRectangle.offsetHeight
      );
    }

    // desenam imaginea initiala peste imaginea ce a fost modificata
    function original() {
      ctx.drawImage(image, 0, 0);
    }

    // functie ce aplica efectul inverted
    function inverted() {
      const imageSectionData = ctx.getImageData(
        clickX,
        clickY,
        selectionRectangle.offsetWidth,
        selectionRectangle.offsetHeight
      );
      const imageData = imageSectionData.data;
      for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = 255 - imageData[i]; // rosu
        imageData[i + 1] = 255 - imageData[i + 1]; // verde
        imageData[i + 2] = 255 - imageData[i + 2]; // albastru
      }
      ctx.putImageData(
        imageSectionData,
        clickX,
        clickY,
        0,
        0,
        selectionRectangle.offsetWidth,
        selectionRectangle.offsetHeight
      );
    }

    i++;
  } else {
    effectPanel.style.display = "none";
    i++;
  }
}

// functie ce afiseaza/ascunde meniul pentru adaugarea textului
// variabila j este incrementata la fiecare apasare a butonului
// variabila j este folosita pentru a afisa/ascunde meniul de adaugare a textului
let j = 0;
function showHideTextMenu() {
  // daca j este par, afisam meniul, altfel il ascundem
  if (j % 2 === 0) {
    textInputDiv.style.display = "block";
    j++;
  } else {
    textInputDiv.style.display = "none";
    j++;
  }
}

// functie de adaugare text
addTextButton.addEventListener("click", () => {
  // luam valoarea text data ca parametru de catre utilizator
  const text = textInput.value;
  // setam culoarea textului folosind valoarea returnata din color picker
  ctx.fillStyle = colorTextInput.value;
  // setam dimensiunea si fontul de baza al textului
  ctx.font = fontSize.value + "px Arial";
  // la final, adaugam textul in canvas
  ctx.fillText(text, clickX, clickY);
});
