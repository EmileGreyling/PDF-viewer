const url = "../docs/pdf.pdf";

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const scale = 1.5;
const canvas = document.querySelector("#pdf-render");
const ctx = canvas.getContext("2d");

// Function to render the page
const renderPage = (num) => {
  pageIsRendering = true;

  // Get page
  pdfDoc.getPage(num).then((page) => {
    // Set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renerCtx = {
      canvasContext: ctx,
      viewport,
    };

    page.render(renerCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    // Output current page
    document.querySelector("#page-num").textContent = num;
  });
};

// Check for pages rendering
const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show next page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

// Function to get the document
const input = document.getElementById("fileInput");
input.addEventListener("change", function () {
  pdfDoc = null;
  pageNum = 1;
  pageIsRendering = false;
  pageNumIsPending = null;
  // Get the selected file as a File object
  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function () {
    // Get the file content as an ArrayBuffer
    const arrayBuffer = reader.result;
    pdfjsLib.getDocument(arrayBuffer).promise.then((_pdfDoc) => {
      pdfDoc = _pdfDoc;

      document.querySelector("#page-count").textContent =
        pdfDoc._pdfInfo.numPages;

      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
});

pdfjsLib.getDocument(url).promise.then((_pdfDoc) => {
  pdfDoc = _pdfDoc;

  document.querySelector("#page-count").textContent = pdfDoc._pdfInfo.numPages;

  renderPage(pageNum);
});

// Button Events
document.querySelector("#prev-page").addEventListener("click", showPrevPage);
document.querySelector("#next-page").addEventListener("click", showNextPage);
