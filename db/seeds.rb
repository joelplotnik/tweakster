# Create Users
users = []
10.times do
  users << User.create!(
    email: Faker::Internet.email,
    password: 'Password11!!',
    username: Faker::Internet.username
  )
end

# Create Channels
channels = []
20.times do
  user = users.sample
  channel_name = ''
  loop do
    channel_name = Faker::Hipster.unique.word
    break if channel_name.length >= 3
  end
  channel = Channel.create!(
    name: channel_name,
    url: Faker::Internet.url,
    summary: Faker::Lorem.paragraph_by_chars(number: 100),
    protocol: Faker::Lorem.paragraph_by_chars(number: 100),
    user_id: user.id
  )
  channels << channel
end

# Create Subscriptions
subscriptions_count = 50
subscriptions_count.times do
  user = users.sample
  channel = channels.sample

  # Check if the subscription already exists
  next if Subscription.exists?(user_id: user.id, channel_id: channel.id)

  Subscription.create!(
    user_id: user.id,
    channel_id: channel.id
  )
end


# Assign Pieces to Users and Channels
piece_count = 50
piece_count.times do
  user = users.sample
  channel = channels.sample
  Piece.create!(
    title: Faker::Book.title,
    content: Faker::Lorem.paragraph(sentence_count: 35),
    user_id: user.id,
    channel_id: channel.id
  )
end
