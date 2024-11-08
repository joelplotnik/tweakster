if Doorkeeper::Application.count.zero?
  Doorkeeper::Application.create!(name: 'Web Client', redirect_uri: '', scopes: '')
  Doorkeeper::Application.create!(name: 'iOS Client', redirect_uri: '', scopes: '')
end
# Clear existing data to avoid duplication and ensure a clean state
User.delete_all
Relationship.delete_all
Game.delete_all
Challenge.delete_all
AcceptedChallenge.delete_all
Comment.delete_all
Like.delete_all
Approval.delete_all
Difficulty.delete_all
Report.delete_all

# Delete all notifications
ActiveRecord::Base.connection.execute('DELETE FROM noticed_notifications')
ActiveRecord::Base.connection.execute('DELETE FROM noticed_events')

# Create Users
users = []
20.times do
  email = Faker::Internet.email
  next if User.exists?(email:)

  user = User.new(
    email:,
    password: 'Password11!!',
    username: Faker::Internet.username,
    url: Faker::Internet.url,
    bio: Faker::Lorem.paragraph_by_chars(number: 100)
  )

  avatar_url = Faker::Avatar.image(slug: user.username, size: '300x300', format: 'png')

  if avatar_url.present?
    begin
      user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')
    rescue StandardError => e
      puts "Error attaching avatar for #{user.username}: #{e.message}. Skipping this user."
    end
  else
    puts "No avatar URL generated for #{user.username}. Skipping avatar attachment."
  end

  begin
    user.save!
    users << user
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for #{user.username}: #{e.message}. Skipping this user."
  end
end

# Create Admin User
admin_email = 'superadmin@example.com'
unless User.exists?(email: admin_email)
  admin_user = User.new(
    email: admin_email,
    password: 'Password11!!',
    username: 'superadmin',
    role: 'admin',
    url: Faker::Internet.url,
    bio: Faker::Lorem.paragraph_by_chars(number: 100)
  )

  avatar_url = Faker::Avatar.image(slug: admin_user.username, size: '300x300', format: 'png')

  if avatar_url.present?
    begin
      admin_user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')
    rescue StandardError => e
      puts "Error attaching avatar for Admin User: #{e.message}. Skipping this user."
    end
  else
    puts 'No avatar URL generated for Admin User. Skipping avatar attachment.'
  end

  begin
    admin_user.save!
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Admin User: #{e.message}. Skipping this user."
  end
end

# Create Games
games = []
PLATFORMS = %w[PC Xbox PlayStation Nintendo Steam Mobile].freeze
20.times do
  name = Faker::Game.title
  next if Game.exists?(name:)

  begin
    game = Game.create!(
      name:,
      platform: PLATFORMS.sample,
      description: Faker::Lorem.paragraph(sentence_count: 3)
    )

    image_url = Faker::LoremFlickr.image(size: '300x300')
    if image_url.present?
      game.image.attach(io: URI.open(image_url), filename: 'game_image.png')
    else
      puts "No image URL generated for #{game.name}. Skipping image attachment."
    end

    games << game
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Game: #{e.message}. Skipping this game."
  rescue StandardError => e
    puts "Error attaching image for Game: #{e.message}. Skipping this game."
  end
end

# Create Challenges
challenges = []
40.times do
  title = Faker::Lorem.sentence(word_count: 3, supplemental: true).chomp('.')
  next if Challenge.exists?(title:)

  begin
    challenge = Challenge.create!(
      title:,
      description: Faker::Lorem.paragraph(sentence_count: 5),
      game: games.sample,
      user: users.sample
    )
    challenges << challenge
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Challenge: #{e.message}. Skipping this challenge."
  end
end

# Create Accepted Challenges
accepted_challenges = []
statuses = ['To Do', 'In Progress', 'Complete']

60.times do
  next if AcceptedChallenge.exists?(challenge: challenges.sample)

  status = statuses.sample # Sample status

  begin
    accepted_challenge = AcceptedChallenge.create!(
      challenge: challenges.sample,
      user: users.sample,
      status:,
      completed_at: status == 'Complete' ? Faker::Date.between(from: '2023-01-01', to: '2024-01-01') : nil
    )
    accepted_challenges << accepted_challenge
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Accepted Challenge: #{e.message}. Skipping this accepted challenge."
  end
end

# Create Relationships
users.each do |follower|
  relationships_count = rand(1..[users.size - 1, 3].min)
  followees = users.reject { |user| user == follower }.sample(relationships_count)

  followees.each do |followee|
    next if Relationship.exists?(follower_id: follower.id, followee_id: followee.id)

    begin
      Relationship.create!(
        follower_id: follower.id,
        followee_id: followee.id
      )
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Relationship: #{e.message}. Skipping this relationship."
    end
  end
end

# Create Comments on Challenges
challenges.each do |challenge|
  num_comments = rand(0..5)

  # Sample unique users to prevent duplicate user comments
  comment_users = users.sample(num_comments)

  comment_users.each do |comment_user|
    # Create a parent comment
    parent_comment = Comment.create!(
      message: Faker::Lorem.sentence,
      user: comment_user,
      commentable: challenge
    )

    next unless parent_comment.persisted? && comment_user != challenge.user

    CommentNotifier.with(record: parent_comment).deliver(challenge.user) if challenge.respond_to?(:user)

    # Create child comments (nested)
    num_child_comments = rand(0..3)
    child_comment_users = users.sample(num_child_comments).uniq

    child_comment_users.each do |child_comment_user|
      next if parent_comment.parent_id.present?

      child_comment = Comment.create!(
        message: Faker::Lorem.sentence,
        user: child_comment_user,
        commentable: challenge,
        parent_id: parent_comment.id
      )

      next unless child_comment.persisted? && child_comment_user != parent_comment.user

      # Notify the parent commenter
      CommentNotifier.with(record: child_comment).deliver(parent_comment.user) if parent_comment.respond_to?(:user)

      # Notify the challenge creator
      CommentNotifier.with(record: child_comment).deliver(challenge.user) if challenge.respond_to?(:user)
    end
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Comment: #{e.message}. Skipping this comment."
  end
end

# Create Comments on Accepted Challenges
accepted_challenges.each do |accepted_challenge|
  num_comments = rand(0..5)

  comment_users = users.sample(num_comments)

  comment_users.each do |comment_user|
    parent_comment = Comment.create!(
      message: Faker::Lorem.sentence,
      user: comment_user,
      commentable: accepted_challenge
    )

    next unless parent_comment.persisted? && comment_user != accepted_challenge.user

    if accepted_challenge.respond_to?(:user)
      CommentNotifier.with(record: parent_comment).deliver(accepted_challenge.user)
    end

    # Create child comments (nested)
    num_child_comments = rand(0..3)
    child_comment_users = users.sample(num_child_comments).uniq

    child_comment_users.each do |child_comment_user|
      next if parent_comment.parent_id.present?

      child_comment = Comment.create!(
        message: Faker::Lorem.sentence,
        user: child_comment_user,
        commentable: accepted_challenge,
        parent_id: parent_comment.id
      )

      next unless child_comment.persisted? && child_comment_user != parent_comment.user

      # Notify the parent commenter
      CommentNotifier.with(record: child_comment).deliver(parent_comment.user) if parent_comment.respond_to?(:user)

      # Notify the accepted_challenge creator
      if accepted_challenge.respond_to?(:user)
        CommentNotifier.with(record: child_comment).deliver(accepted_challenge.user)
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Comment: #{e.message}. Skipping this comment."
  end
end

# Create Likes on Challenges
challenges.each do |challenge|
  num_likes = rand(0..20)
  likers = users.sample(num_likes).uniq
  likers.each do |liker|
    next if Like.exists?(user: liker, likeable: challenge)

    begin
      Like.create!(
        user: liker,
        likeable: challenge
      )

    # # Notify the challenge creator about the like
    # LikeNotifier.with(record: like).deliver(challenge.user) if challenge.respond_to?(:user)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Like on Challenge: #{e.message}. Skipping this like."
    end
  end
end

# Create Likes on Comments
comments = Comment.all
comments.each do |comment|
  num_likes = rand(0..20)
  likers = users.sample(num_likes).uniq
  likers.each do |liker|
    next if Like.exists?(user: liker, likeable: comment)

    begin
      Like.create!(
        user: liker,
        likeable: comment
      )

      # Notify the comment creator about the like
      # LikeNotifier.with(record: like).deliver(comment.user) if comment.respond_to?(:user)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Like on Comment: #{e.message}. Skipping this like."
    end
  end
end

# Create Approvals on Accepted Challenges
accepted_challenges.each do |accepted_challenge|
  next unless accepted_challenge.status == 'Complete'

  num_approvals = rand(0..10)
  approvers = users.sample(num_approvals).uniq

  approvers.each do |approver|
    next if Approval.exists?(user: approver, accepted_challenge:)

    begin
      Approval.create!(
        user: approver,
        accepted_challenge:
      )

      # Notify the accepted challenge creator about the approval
      # ApprovalNotifier.with(record: approval).deliver(accepted_challenge.user) if accepted_challenge.respond_to?(:user)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Approval on Accepted Challenge: #{e.message}. Skipping this approval."
    end
  end
end

# Create Difficulties on Challenges
challenges.each do |challenge|
  num_difficulties = rand(1..6)
  difficulty_users = users.sample(num_difficulties).uniq

  difficulty_users.each do |difficulty_user|
    Difficulty.create!(
      challenge:,
      user: difficulty_user,
      rating: rand(1..5)
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Difficulty on Challenge: #{e.message}. Skipping this difficulty."
  end
end

# Define reasons for reporting
report_reasons = %w[spam inappropriate offensive harassing]

# Create Reports
users.each do |user|
  # Challenges
  challenges_to_report = Challenge.where.not(user_id: user.id)
  sampled_challenges = challenges_to_report.sample(rand(1..[10, challenges_to_report.count].min))
  sampled_challenges.each do |challenge|
    Report.create!(
      content_type: 'challenge',
      content_id: challenge.id,
      reporter_id: user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on Challenge: #{e.message}. Skipping this report."
  end

  # Comments
  comments_to_report = Comment.where.not(user_id: user.id)
  sampled_comments = comments_to_report.sample(rand(1..[10, comments_to_report.count].min))
  sampled_comments.each do |comment|
    Report.create!(
      content_type: 'comment',
      content_id: comment.id,
      reporter_id: user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on Comment: #{e.message}. Skipping this report."
  end

  # Users
  users_to_report = User.where.not(id: user.id)
  sampled_users = users_to_report.sample(rand(1..[10, users_to_report.count].min))
  sampled_users.each do |report_user|
    Report.create!(
      content_type: 'user',
      content_id: report_user.id,
      reporter_id: user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on User: #{e.message}. Skipping this report."
  end
end
