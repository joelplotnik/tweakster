# Tweakster

Tweakster gives gamers the tools to create, share, and take on custom
challenges, making every game experience unique and community-driven.

## 🛠️ Requirements

Make sure you have the following software installed on your machine before proceeding with the setup:

- Ruby 3.2.2
- Rails 7.0.8 or higher
- MySQL 9.0.1 or higher

## 📦 Installation

Follow the steps below to set up Tweakster on your local machine:

1. Clone the repository:

```shell
   git clone git@github.com:joelplotnik/tweakster.git
```

2. Change into the project's directory:

```shell
cd tweakster
```

3. Install the required gems:

```shell
bundle install
```

4. Install the required Node.js dependencies:

```shell
yarn install
```

5. Set up the database:

```shell
rails db:setup
```

6. Start the Rails server along with Vite:

```shell
yarn start
```

You can now access Tweakster by visiting http://localhost:5100 in your browser.

## ⚙️ Configuration

Tweakster requires minimal configuration beyond the standard Rails setup.

## 💻 Usage

Once the Tweakster server is running, you can use the Tweakster web application to perform various tasks. Refer to the Tweakster user interface and interaction guidelines for detailed instructions on how to use the application.

## ⚠️ Troubleshooting

If you encounter any issues during the setup or usage of Tweakster, consider the following troubleshooting steps:

- Make sure all the prerequisites are installed correctly.
- Verify that the development server is running on port 5100.
- Check the console logs for any error messages or exceptions.
- Ensure that the database is properly set up and migrated.

If the issue persists, feel free to contact the application developer, Joel Plotnik, for further assistance.

## ✍️ Author

- [@joelplotnik](https://www.github.com/joelplotnik)
