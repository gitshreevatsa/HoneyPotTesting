/**
 * Connect to GoPlus API
 */

const axios = require("axios");

const goPlus = axios.create({
    //change url
    baseURL: "https://goplus-api.herokuapp.com/",
    timeout: 10000,
});

module.exports = { goPlus };