const path = require("path");

module.exports = (view) => {
    return path.join(__dirname, `../public/${view}.html`);
}