source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.2.2'

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem 'rails', '~> 7.0.8'

# Whitelist frontend React application
gem 'rack-cors'

# Use mysql as the database for Active Record
gem 'mysql2', '~> 0.5.5'

# Use the Puma web server [https://github.com/puma/puma]
gem 'puma', '~> 6.4'

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem 'bcrypt', '~> 3.1.7'

# Pagination library
gem 'will_paginate', '~> 3.3'

# Library for generating fake data
gem 'faker'

# Flexible authentication solution for Rails
gem 'devise'

# Provides token-based authentication
gem 'devise-api', '~> 0.2.0'

# An OmniAuth strategy for Twitch
gem 'omniauth-twitch'

# Slugging and permalink plugins for Active Record
gem 'friendly_id', '~> 5.5.0'

# Integrates Vite.js for modern JavaScript asset management.
gem 'vite_rails', '~> 3.0'

# Notification system for Rails applications.
gem 'noticed', '~> 2.3'

# AWS S3 integration for file storage.
gem 'aws-sdk-s3', require: false

# Error tracking and reporting tool for production applications.
gem 'bugsnag'

# Framework for serializing and deserializing JSON API data
gem 'jsonapi-serializer', '~> 2.2'

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem 'image_processing', '~> 1.2'

# Ruby static code analyzer (a.k.a. linter) and code formatter
gem 'rubocop', require: false

# Keeps the app stable while ensuring compatibility with Rails 7.0.x.
# Upgrading to Rails 7.1 would fix the issue here as well
gem 'concurrent-ruby', '1.3.4'

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
  gem 'debug', platforms: %i[mri mingw x64_mingw]
end

group :development do
  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end
