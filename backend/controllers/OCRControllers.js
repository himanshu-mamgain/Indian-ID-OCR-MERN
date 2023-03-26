const multer = require("multer");
const { createWorker } = require("tesseract.js");
const fs = require("fs");
const sharp = require("sharp");
const config = require("../config/config.json");
const { IDChecker } = require("../services/IDChecker");

const CLASS_NAME = "OCRControllers";

module.exports.uploadIDCard = async (req, res) => {
  try {
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    // Upload file
    upload.single("file")(req, res, async (error) => {
      const IDCardFile = req?.file;

      if (error) {
        console.error(`[${CLASS_NAME}] uploadIDCard`, error);

        res.status(500).send({
          error: "Error in uploading file",
        });
      } else {
        if (
          IDCardFile &&
          IDCardFile.size > 0 &&
          IDCardFile.mimetype.split("/")[0] === "image" &&
          config.ValidFileTypes.includes(IDCardFile.mimetype.split("/")[1])
        ) {
          fs.writeFile(
            `uploads/${config.staticFileName}`,
            IDCardFile.buffer,
            { encoding: "base64" },
            (error) => {
              if (error) {
                console.error(`[${CLASS_NAME}] Error in writing file`, error);

                res.status(500).send({
                  error: error.message,
                });
              } else {
                sharp(`uploads/${config.staticFileName}`)
                  .extract({ width: 280, height: 200, left: 10, top: 91 })
                  .resize({ width: 500 })
                  .sharpen()
                  .toFile(
                    `uploads/${IDCardFile.originalname}`,
                    (error, info) => {
                      if (error) {
                        console.error(
                          `[${CLASS_NAME}] uploadIDCard Error in image resizing`,
                          error
                        );

                        res.status(400).send({
                          error: "Error in image resizing",
                        });
                      } else {
                        console.info(
                          `[${CLASS_NAME}] uploadIDCard Image resized`,
                          info.size
                        );

                        fs.unlink(
                          `uploads/${config.staticFileName}`,
                          (error) => {
                            if (error) {
                              console.error(
                                `[${CLASS_NAME}] uploadIDCard error in file deletion`,
                                error
                              );
                            } else {
                              console.info(
                                `[${CLASS_NAME}] uploadIDCard static file deleted successfully`
                              );

                              const uploadedFile = fs.readFileSync(
                                `uploads/${IDCardFile.originalname}`
                              );

                              if (uploadedFile) {
                                res.status(200).send({
                                  message: "File uploaded successfully",
                                });
                              } else {
                                console.error(
                                  `[${CLASS_NAME}] uploadIDCard Error in file uploading`
                                );

                                res.status(400).send({
                                  error: "Error in file uploading",
                                });
                              }
                            }
                          }
                        );
                      }
                    }
                  );
              }
            }
          );
        } else {
          console.error(`[${CLASS_NAME}] uploadIDCard Error in file data`);

          res.status(400).send({
            error: "Error in file",
          });
        }
      }
    });
  } catch (error) {
    console.error(`[${CLASS_NAME}] uploadIDCard`, error);

    res.status(500).send({
      error: "Error in uploading ID Card",
    });
  }
};

module.exports.getIDCardImgDetails = async (req, res) => {
  try {
    const { fileName, idType } = req?.query;

    if (fileName) {
      const idCardFile = fs.readFileSync(`uploads/${fileName}`);

      const worker = await createWorker();

      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const idCardDetails = await worker.recognize(idCardFile);

      await worker.terminate();

      // const idCardDetails = await Tesseract.recognize(idCardFile, "eng");

      if (idCardDetails) {
        const response = IDChecker(idCardDetails.data.text.replace("\n", " - "), idType);

        fs.unlink(`uploads/${fileName}`, (error) => {
          if (error) {
            console.error(`[${CLASS_NAME}] error in file deletion`, error);
          } else {
            console.info(`[${CLASS_NAME}] file deleted successfully`);
            fs.unlinkSync("eng.traineddata");
          }
        });

        if (response) {
          res.status(200).send({
            message: response,
            data: idCardDetails.data.text.split("\n"),
          });
        } else {
          res.status(400).send({
            error: "Upload ID card is not a valid government id",
          });
        }
      } else {
        console.error(`[${CLASS_NAME}] getIDCardImgDetails OCR Error`);

        res.status(400).send({
          error: "OCR Error",
        });
      }
    } else {
      console.error(`[${CLASS_NAME}] getIDCardImgDetails Bad Argument`);

      res.status(400).send({
        error: "Bad Argument",
      });
    }
  } catch (error) {
    console.error(`[${CLASS_NAME}] getIDCardImgDetails`, error.message);

    res.status(500).send({
      error: "Error in getting ID Card Image details",
    });
  }
};
