# ANDOVERVIEW - Dynamic Website Version

This is the dynamic version of the ANDOVERVIEW student newspaper website, powered by a Node.js backend and a SQLite database.

This setup allows for dynamic features like article views, likes, and comments, while still allowing writers and editors to manage article content through simple text files.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- npm (comes bundled with Node.js)

## Setup

1.  **Clone the repository** or make sure you have all the project files.

2.  **Install dependencies**:
    Open your terminal in the project's root directory and run:
    ```sh
    npm install
    ```
    This will install Express, SQLite, and other necessary packages from `package.json`. It will also create a `package-lock.json` file and a `node_modules` directory.

## Running the Server

1.  **Start the server**:
    Once the dependencies are installed, you can start the local server with:
    ```sh
    npm start
    ```
    Alternatively, you can run the command directly:
    ```sh
    node backend/server.js
    ```

2.  **View the website**:
    You will see a message in your terminal:
    ```
    Database initialized successfully.
    Server is running at http://localhost:3000
    ```
    Open your web browser and navigate to **`http://localhost:3000`**.

The website will now be running locally, served by your own backend. Any dynamic data (likes, views) will be saved to the `backend/my-database.sqlite` file.