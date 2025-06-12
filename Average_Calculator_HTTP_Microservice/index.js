const express = require("express");
const axios = require("axios");

const app = express();
const WINSIZE = 10;
const PORT = 9876;


const VIDS = {
  p: "primes",
  f: "fibo",
  e: "even",
  r: "rand"
};

const API_BRL = "http://20.244.56.144/evaluation-service";
const BT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5NzA1MDgzLCJpYXQiOjE3NDk3MDQ3ODMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkwODViN2YxLTdiMDctNDk4Mi1iODc5LTg3MDdkODhmMmY1MiIsInN1YiI6Im1hbGVyaXNoaWtyZWRkeUBnbWFpbC5jb20ifSwiZW1haWwiOiJtYWxlcmlzaGlrcmVkZHlAZ21haWwuY29tIiwibmFtZSI6Im1hbGUgcmlzaGlrIHJlZGR5Iiwicm9sbE5vIjoiMjIwM2E1MTI0NCIsImFjY2Vzc0NvZGUiOiJNVkd3RUYiLCJjbGllbnRJRCI6IjkwODViN2YxLTdiMDctNDk4Mi1iODc5LTg3MDdkODhmMmY1MiIsImNsaWVudFNlY3JldCI6ImJuQ3Z5TlZzUW5YemJLVlcifQ.MAelB_T65pO83OUfrrdAP7Vp6uYJfO8c-u8GNqAqF_w";
let WinStore = [];

async function fetchNumbersFromAPI(type) {
  try {
    const res = await axios.get(`${API_BRL}/${type}`, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${BT}`
      }
    });
    return res.data.numbers || [];
  } catch (err) {
    console.error("Error fetching numbers:", err.message);
    return [];
  }
}

function changeWindow(newNumbers) {
  const uniqueNew = newNumbers.filter((n) => !WinStore.includes(n));
  const newWindow = [...WinStore];

  for (const num of uniqueNew) {
    if (newWindow.length >= WINSIZE) {
      newWindow.shift(); 
    }
    newWindow.push(num);
  }

  return newWindow;
}

function calAVG(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / arr.length).toFixed(2));
}

app.get("/numbers/:numberid", async (req, res) => {
  const id = req.params.numberid;

  if (!VIDS[id]) {
    return res.status(400).json({ error: "Invalid number ID. Use 'p', 'f', 'e', or 'r'." });
  }

  const apiType = VIDS[id];

  const WPS = [...WinStore];

  const newNumbers = await fetchNumbersFromAPI(apiType);
  WinStore = changeWindow(newNumbers);

  const response = {
    WPS,
    WCS: [...WinStore],
    numbers: newNumbers,
    avg: calAVG(WinStore)
  };

  res.status(200).json(response);
});

app.listen(PORT, () => {
  console.log(`Average Calculator Microservice running at http://localhost:${PORT}`);
});