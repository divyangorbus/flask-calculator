# Flask Calculator

A simple web calculator built with Flask. The UI supports basic arithmetic, and calculations are performed on the server via a JSON API.

## Features

- Addition, subtraction, multiplication, and division
- Light and dark themes (preference saved in the browser)
- Server-side calculation through a REST endpoint

## Getting started

### Prerequisites

- Python 3.10+

### Install and run

```bash
pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

## API

**POST** `/api/calculate`

Request body:

```json
{
  "left": 10,
  "right": 5,
  "op": "+"
}
```

Supported operators: `+`, `-`, `*`, `/`

Response:

```json
{
  "ok": true,
  "result": 15,
  "display": "15"
}
```

## Project structure

```
flask-calculator/
├── app.py              # Flask app and API routes
├── requirements.txt
├── static/
│   ├── calculator.js   # Calculator UI logic
│   └── style.css       # Styles and themes
└── templates/
    └── index.html
```
