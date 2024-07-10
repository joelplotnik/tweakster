source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.2"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.0.8"

#  Use Rack CORS for handling Cross-Origin Resource Sharing (CORS), making cross-origin AJAX possible # # Whitelist frontend React application
gem 'rack-cors'

# Use mysql as the database for Active Record
gem 'mysql2', '~> 0.5.5'

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", "~> 6.4"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"

# Pagination library
gem "will_paginate", "~> 3.3"

# Library for generating fake data
gem "faker"

# Flexible authentication solution for Rails
gem "devise"

# JSON Web Token authentication for Devise
gem "devise-jwt"

# Authorization gem for defining and managing user permissions
gem 'cancancan'

# Framework for serializing and deserializing JSON API data
gem "jsonapi-serializer", "~> 2.2"

# Ruby HTML and CSS sanitizer
gem 'sanitize'

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem "image_processing", "~> 1.2"

# Build JSON APIs with ease [https://github.com/rails/jbuilder]
# gem "jbuilder"

# Use Redis adapter to run Action Cable in production
# gem "redis", "~> 4.0"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use sqlite3 as the database for Active Record
# gem "sqlite3", "~> 1.4"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
end

group :development do
  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end

gem "vite_rails", "~> 3.0"

gem "noticed", "~> 2.3"

gem "aws-sdk-s3", require: false
