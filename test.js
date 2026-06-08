require("dotenv").config();

const axios = require("axios");

axios.get(
  "https://graph.instagram.com/me",
  {
    params: {
      fields: "user_id,username",
      access_token: process.env.ACCESS_TOKEN
    }
  }
)
.then(res => {
  console.log(res.data);
})
.catch(err => {
  console.log(err.response?.data || err.message);
});