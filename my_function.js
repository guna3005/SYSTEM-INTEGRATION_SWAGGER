// code in aws lambda index.mjs function 

export async function handler(event) {
  let keyword = event.queryStringParameters.keyword;
  console.log(`Guna Pranith says ${keyword}`)
  return {
      statusCode: 200,
      body: `Guna Pranith says ${keyword}`,
  };
}

//code in server.js in digital ocearn droplet 

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/say', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const response = await axios.get(`https://yy256sjli3.execute-api.us-east-2.amazonaws.com/say?keyword=${keyword}`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
