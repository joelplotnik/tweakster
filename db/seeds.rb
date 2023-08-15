# Create Users
users = []
20.times do
  user = User.create!(
    email: Faker::Internet.email,
    password: 'Password11!!',
    username: Faker::Internet.username
  )
  
  # Attach an avatar image to the user
  avatar_url = Faker::Avatar.image(slug: user.username, size: '300x300', format: 'png')
  user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')
  
  users << user
end

# Create Admin User
admin_user = User.create!(
  email: 'superadmin@example.com',
  password: 'Password11!!',
  username: 'superadmin',
  role: 'admin'
)

avatar_url = Faker::Avatar.image(slug: admin_user.username, size: '300x300', format: 'png')
admin_user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')

users << admin_user

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

# Create Comments
pieces = Piece.all
pieces.each do |piece|
  num_comments = rand(0..10) 
  users.sample(num_comments).each do |comment_user|
    parent_comment = piece.comments.sample if piece.comments.present? && rand(2).zero?

    comment = Comment.create!(
      message: Faker::Lorem.sentence,
      user_id: comment_user.id,
      piece_id: piece.id,
      parent_comment_id: parent_comment&.id
    )

    if parent_comment.present?
      parent_comment.child_comments << comment
      parent_comment.save
    else
      piece.comments << comment 
    end
  end
end


# Create Votes for Pieces
users.each do |user|
  voted_pieces = []
  num_votes = rand(5..10) 

  num_votes.times do
    piece = Piece.all.sample

    next if voted_pieces.include?(piece.id)

    voted_pieces << piece.id

    vote_type = [1, -1].sample

    Vote.create!(
      user_id: user.id,
      votable_type: 'Piece',
      votable_id: piece.id,
      vote_type: vote_type
    )
  end
end

# Create Votes for Comments
users.each do |user|
  voted_comments = []
  num_votes = rand(10..20) 

  num_votes.times do
    comment = Comment.all.sample

    next if voted_comments.include?(comment.id)

    voted_comments << comment.id

    vote_type = [1, -1].sample

    Vote.create!(
      user_id: user.id,
      votable_type: 'Comment',
      votable_id: comment.id,
      vote_type: vote_type
    )
  end
end

# Create Tweaks (50% chance)
pieces.each do |piece|
  if rand(2).zero? 
    parent_piece = pieces.sample
    piece.update(parent_piece_id: parent_piece.id)
  end
end


