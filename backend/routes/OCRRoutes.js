const OCR_API = require("../controllers/OCRControllers");

function OCRRoutes(router) {

    router.post("/api/upload-id-card-img", OCR_API.uploadIDCard);

    router.get("/api/get-id-card-img-details", OCR_API.getIDCardImgDetails);

};

module.exports = OCRRoutes;