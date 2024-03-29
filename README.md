# Tweakster - API

Tweakster is an application that allows people to tweak each other's content pieces. This is the backend API for Tweakster. Tweakster is built using Rails 7 and serves as the backend for the Tweakster React frontend application.

## Requirements

Make sure you have the following software installed on your machine before proceeding with the setup:

- Ruby 3.1.2
- Rails 7.0.8 or higher
- MySQL 8.2.0 or higher

## Installation

Follow the steps below to set up the Tweakster Rails 7 API on your local machine:

1. Clone the repository:

```shell
   git clone git@github.com:joelplotnik/tweakster-api.git
```

2. Change into the project's directory:

```shell
cd tweakster-api
```

3. Install the required gems:

```shell
bundle install
```

4. Set up the database:

```shell
rails db:setup
```

5. Start the Rails server:

```shell
rails server
```

Note: The Rails server should be running on port 3000.

6. Open a new terminal window and navigate to the Tweakster React frontend directory.

7. Install the required dependencies for the frontend:

```shell
npm install
```

8. Start the React development server:

```shell
npm start
```

Note: When prompted, run the React application on port 3001.

You can now access the Tweakster application by visiting http://localhost:3001 in your browser.

## Configuration

The Tweakster API does not require any additional configuration beyond the standard Rails setup.

## Usage

Once the Tweakster API and Tweakster UI servers are running, you can use the Tweakster web application to perform various tasks. Refer to the Tweakster user interface and interaction guidelines for detailed instructions on how to use the application.

## Troubleshooting

If you encounter any issues during the setup or usage of the Tweakster Rails 7 API, consider the following troubleshooting steps:

- Make sure all the prerequisites are installed correctly.
- Verify that the Rails server is running on port 3000 and the React server on port 3001.
- Check the console logs for any error messages or exceptions.
- Ensure that the database is properly set up and migrated.
  If the issue persists, feel free to contact the application developer, Joel Plotnik, for further assistance.

## Author

- [@joelplotnik](https://www.github.com/joelplotnik)
