const config = require("../config/config.json");

module.exports.IDChecker = (idData, idType) => {
  try {
    let response;

    switch (idType) {
      case "panCard":
        const panCardNumber = idData.match(config.regex.panCard.panCardNumber);

        // const regex = /([A-Z\s]+)\s([A-Z\s]+)/gi;
        // const match = regex.exec(idData);
        const name = idData.match(/([A-Z\s]+)/g)[0];
        const fatherName = idData.match(/([A-Z\s]+)/g)[1];

        const dateOfBirth = idData.match(config.regex.panCard.dateOfBirth);

        response = {
          idType: idType,
          idNumber: panCardNumber[0],
          info: {
            name: name.trim(),
            fatherName: fatherName.trim(),
            dob: dateOfBirth[0],
          },
        };
        break;
      case "aadhaarCard":
        break;
    }

    return response;
  } catch (error) {
    return error;
  }
};
