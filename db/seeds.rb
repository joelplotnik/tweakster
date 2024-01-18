# Create Users
users = []
20.times do
  begin
    user = User.create!(
      email: Faker::Internet.email,
      password: 'Password11!!',
      username: Faker::Internet.username
    )
  
    # Attach an avatar image to the user
    avatar_url = Faker::Avatar.image(slug: user.username, size: '300x300', format: 'png')
    user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')
  
    users << user
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error: #{e.message}. Skipping this user."
    # Log or handle the validation error as needed
  end
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
  begin
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

    # Attach a visual representation to the channel
    visual_url = Faker::LoremFlickr.image(size: '300x300')
    channel.visual.attach(io: URI.open(visual_url), filename: 'channel_visual.png')
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Channel: #{e.message}. Skipping this channel."
    # Log or handle the validation error as needed
  end
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
youtube_urls = [
  "https://www.youtube.com/watch?v=C0DPdy98e4c",
  "https://www.youtube.com/watch?v=sZtCF_9pee4",
  "https://www.youtube.com/watch?v=IIqtuupvdWg"
]

piece_count.times do |index|
  user = users.sample
  channel = channels.sample
  youtube_url = youtube_urls.sample

  # Generate random image URLs with non-square dimensions
  image_urls = []
  rand(1..3).times do
    width = rand(300..800)
    height = rand(300..800)
    image_urls << Faker::LoremFlickr.image(size: "#{width}x#{height}")
  end

  piece = Piece.new(
    title: Faker::Book.title,
    user_id: user.id,
    channel_id: channel.id
  )

  if index.even?
    # Apply variations for half of the pieces (even index)
    attributes = [:images, :youtube_url, :content].sample

    case attributes
    when :images
      image_urls.each do |image_url|
        piece.images.attach(io: URI.open(image_url), filename: 'image.png')
      end
    when :youtube_url
      piece.youtube_url = youtube_url
    when :content
      piece.content = Faker::Lorem.paragraph(sentence_count: 50)
    end
  else
    # Apply all attributes for the other half of the pieces (odd index)
    piece.youtube_url = youtube_url
    image_urls.each do |image_url|
      piece.images.attach(io: URI.open(image_url), filename: 'image.png')
    end
    piece.content = Faker::Lorem.paragraph(sentence_count: 50)
  end

  # Validate that at least one attribute is present
  unless piece.content.present? || piece.youtube_url.present? || piece.images.attached?
    piece.errors.add(:base, 'At least one attribute (content, youtube_url, or images) must be present')
  end

  piece.save
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
  num_votes = rand(10..20) 

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

# Create Tweaks (75% chance)
pieces.each do |piece|
  if rand(4) >= 1 
    parent_candidates = pieces.reject { |p| p == piece || p.parent_piece_id == piece.id }
    parent_piece = parent_candidates.sample
    piece.update(parent_piece_id: parent_piece.id) if parent_piece
  end
end
