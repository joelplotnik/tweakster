# Create Users
users = []
20.times do
  begin
    user = User.create!(
      email: Faker::Internet.email,
      password: 'Password11!!',
      username: Faker::Internet.username,
      url: Faker::Internet.url,
      bio: Faker::Lorem.paragraph_by_chars(number: 100),
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
  role: 'admin',
  url: Faker::Internet.url,
  bio: Faker::Lorem.paragraph_by_chars(number: 100),
)

avatar_url = Faker::Avatar.image(slug: admin_user.username, size: '300x300', format: 'png')
admin_user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')

users << admin_user

# Create Channels
channels = []
subscriptions = []
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

    # Create a subscription for the user who created the channel
    subscriptions << Subscription.create!(
      user_id: user.id,
      channel_id: channel.id
    )
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

# Create Relationships 
relationships_count = 5

users.each do |follower|
  relationships_count.times do
    followee = users.reject { |user| user == follower }.sample

    next if Relationship.exists?(follower_id: follower.id, followee_id: followee.id)

    Relationship.create!(
      follower_id: follower.id,
      followee_id: followee.id
    )
  end
end


# Assign Pieces to Users and Channels
piece_count = 100
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
  num_comments = rand(0..20)
  users.sample(num_comments).each do |comment_user|
    if piece.comments.where(parent_comment_id: nil).exists? && rand(2).zero?
      parent_comment = piece.comments.where(parent_comment_id: nil).sample
    else
      parent_comment = nil
    end

    comment = Comment.create!(
      message: Faker::Lorem.sentence,
      user: comment_user,
      piece: piece, 
      parent_comment_id: parent_comment&.id 
    )

    if comment.persisted? && comment_user != piece.user
      CommentOnPieceNotifier.with(record: comment).deliver(piece.user)
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

# Create Tweaks (50% chance)
total_pieces = pieces.count
desired_tweak_count = (total_pieces * 0.25).to_i 
tweak_count = 0

pieces.each do |piece|
  break if tweak_count >= desired_tweak_count  
  
  parent_candidates = Piece.where(channel_id: piece.channel_id, parent_piece_id: nil).where.not(id: piece.id)
  
  next if parent_candidates.empty? 
  
  parent_piece = parent_candidates.sample
  success = piece.update(parent_piece_id: parent_piece.id)
  
  if success && parent_piece.user != piece.user
    TweakOfPieceNotifier.with(record: piece).deliver(parent_piece.user)
    tweak_count += 1
  end
end


# Create Reports
users.each do |user|
  # Pieces
  pieces_to_report = Piece.where.not(user_id: user.id)
  pieces_to_report.sample(rand(1..5)).each do |piece|
    Report.create!(
      content_type: 'piece',
      content_id: piece.id,
      reporter_id: user.id,
      reason: ['spam', 'inappropriate'].sample
    )
  end

  # Comments
  comments_to_report = Comment.where.not(user_id: user.id)
  comments_to_report.sample(rand(1..5)).each do |comment|
    Report.create!(
      content_type: 'comment',
      content_id: comment.id,
      reporter_id: user.id,
      reason: ['spam', 'inappropriate'].sample
    )
  end

  # Channels
  channels_to_report = Channel.where.not(user_id: user.id)
  channels_to_report.sample(rand(1..5)).each do |channel|
    Report.create!(
      content_type: 'channel',
      content_id: channel.id,
      reporter_id: user.id,
      reason: ['spam', 'inappropriate'].sample
    )
  end

  # Users
  users_to_report = User.where.not(id: user.id)
  users_to_report.sample(rand(1..5)).each do |report_user|
    Report.create!(
      content_type: 'user',
      content_id: report_user.id,
      reporter_id: user.id,
      reason: ['spam', 'inappropriate'].sample
    )
  end
end
