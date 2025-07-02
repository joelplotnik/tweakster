# Clear existing data to avoid duplication and ensure a clean state
Like.delete_all
Comment.where.not(parent_id: nil).delete_all
Comment.where(parent_id: nil).delete_all
Approval.delete_all
Attempt.delete_all
Difficulty.delete_all
Report.delete_all
Relationship.delete_all
UserGame.delete_all
Vote.delete_all
Challenge.delete_all
Game.delete_all
User.delete_all

# Delete all notifications
ActiveRecord::Base.connection.execute('DELETE FROM noticed_notifications')
ActiveRecord::Base.connection.execute('DELETE FROM noticed_events')

# Create Users
users = []
while users.size < 20
  email = Faker::Internet.email
  next if User.exists?(email:)

  user = User.new(
    email:,
    password: 'Password11!!',
    username: Faker::Internet.username,
    bio: Faker::Lorem.paragraph_by_chars(number: 150)
  )

  avatar_url = Faker::Avatar.image(slug: user.username, size: '300x300', format: 'png')

  if avatar_url.present?
    begin
      user.avatar.attach(io: URI.open(avatar_url), filename: 'avatar.png')
    rescue StandardError => e
      puts "Error attaching avatar for #{user.username}: #{e.message}. Skipping this user."
      next
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
    bio: Faker::Lorem.paragraph_by_chars(number: 150)
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
    users << admin_user
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Admin User: #{e.message}. Skipping this user."
  end
end

# Create Relationships
users.each do |follower|
  relationships_count = rand(1..[users.size - 1, 3].min)
  followees = users.reject { |follower_user| follower_user == follower }.sample(relationships_count)

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

# Create Games
puts 'Starting import of games from IGDB...'
Igdb::GameImporterService.new.import_one_batch
games = Game.all
puts 'IGDB games import completed.'

# Create UserGames
if games.any?
  User.all.each do |game_user|
    game = games.sample
    begin
      UserGame.create!(user: game_user, game:)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error assigning game to user #{game_user.name}: #{e.message}. Skipping this user."
    rescue StandardError => e
      puts "Error assigning game to user #{game_user.name}: #{e.message}. Skipping this user."
    end
  end
else
  puts 'No games available to assign to users.'
end

# Create Challenges
categories = [
  'Perfectionist',
  'Strategic Planning',
  'Meticulous Collection',
  'Precision-Based',
  'Resource Management',
  'Puzzle and Logic',
  'Time-Efficiency',
  'Skill Mastery',
  'Completionist',
  'Self-Improvement'
]

challenges = []
40.times do
  title = Faker::Lorem.sentence(word_count: 3, supplemental: true).chomp('.')
  next if Challenge.exists?(title:)

  begin
    challenge = Challenge.create!(
      title:,
      description: Faker::Lorem.paragraph(sentence_count: rand(5..15)),
      game: games.sample,
      user: users.sample,
      category: categories.sample
    )

    image_url = Faker::LoremFlickr.image(size: '400x300', search_terms: ['challenges'])

    if image_url.present?
      begin
        challenge.image.attach(io: URI.open(image_url), filename: 'challenge_image.png')
      rescue StandardError => e
        puts "Error attaching image for challenge #{challenge.title}: #{e.message}. Skipping this challenge."
      end
    else
      puts "No image URL generated for challenge #{challenge.title}. Skipping image attachment."
    end

    challenges << challenge
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Challenge: #{e.message}. Skipping this challenge."
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

# Create Votes on Challenges
challenges.each do |challenge|
  num_votes = rand(1..users.size)

  voters = users.sample(num_votes).uniq

  voters.each do |voter|
    next if Vote.exists?(user: voter, challenge:)

    vote_type = [1, -1].sample

    begin
      Vote.create!(
        user: voter,
        challenge:,
        vote_type:
      )
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Vote: #{e.message}. Skipping this vote."
    end
  end
end

# Create Attempts
attempts = []
statuses = %w[Pending Complete]

users.each do |attempt_user|
  num_attempts = rand(20..40)

  sampled_challenges = challenges.sample(num_attempts)

  first_attempt = true

  sampled_challenges.each do |challenge|
    next if Attempt.exists?(user_id: attempt_user.id, challenge_id: challenge.id)

    status = if first_attempt
               first_attempt = false
               'In Progress'
             else
               statuses.sample
             end

    begin
      attempt = Attempt.create!(
        challenge:,
        user: attempt_user,
        status:,
        completed_at: status == 'Complete' ? Faker::Date.between(from: '2023-01-01', to: '2024-01-01') : nil
      )
      attempts << attempt
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Attempt: #{e.message}. Skipping this attempt."
    end
  end
end

# Create Approvals on Attempts
attempts.each do |attempt|
  next unless attempt.status == 'Complete'

  num_approvals = rand(0..5)
  approvers = users.sample(num_approvals).uniq

  approvers.each do |approver|
    next if Approval.exists?(user: approver, attempt:)

    begin
      Approval.create!(
        user: approver,
        attempt:
      )

      # Notify the attempt creator about the approval
      # ApprovalNotifier.with(record: approval).deliver(attempt.user) if attempt.respond_to?(:user)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Approval on Attempt: #{e.message}. Skipping this approval."
    end
  end
end

# Create Comments on Challenges
challenges.each do |challenge|
  num_comments = rand(0..4)

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
    num_child_comments = rand(0..2)
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

# Create Comments on Attempts
attempts.each do |attempt|
  num_comments = rand(0..4)

  comment_users = users.sample(num_comments)

  comment_users.each do |comment_user|
    parent_comment = Comment.create!(
      message: Faker::Lorem.sentence,
      user: comment_user,
      commentable: attempt
    )

    next unless parent_comment.persisted? && comment_user != attempt.user

    CommentNotifier.with(record: parent_comment).deliver(attempt.user) if attempt.respond_to?(:user)

    # Create child comments (nested)
    num_child_comments = rand(0..2)
    child_comment_users = users.sample(num_child_comments).uniq

    child_comment_users.each do |child_comment_user|
      next if parent_comment.parent_id.present?

      child_comment = Comment.create!(
        message: Faker::Lorem.sentence,
        user: child_comment_user,
        commentable: attempt,
        parent_id: parent_comment.id
      )

      next unless child_comment.persisted? && child_comment_user != parent_comment.user

      # Notify the parent commenter
      CommentNotifier.with(record: child_comment).deliver(parent_comment.user) if parent_comment.respond_to?(:user)

      # Notify the attempt creator
      CommentNotifier.with(record: child_comment).deliver(attempt.user) if attempt.respond_to?(:user)
    end
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Comment: #{e.message}. Skipping this comment."
  end
end

# Create Likes on Comments
comments = Comment.all
comments.each do |comment|
  num_likes = rand(0..10)
  likers = users.sample(num_likes).uniq
  likers.each do |liker|
    next if Like.exists?(user: liker, comment_id: comment.id)

    begin
      Like.create!(
        user: liker,
        comment_id: comment.id
      )

      # Optionally, notify the comment creator about the like
      # LikeNotifier.with(record: like).deliver(comment.user) if comment.respond_to?(:user)
    rescue ActiveRecord::RecordInvalid => e
      puts "Validation error for Like on Comment: #{e.message}. Skipping this like."
    end
  end
end

# Create Reports
report_reasons = %w[spam inappropriate offensive harassing]
users.each do |report_user|
  # Challenges
  challenges_to_report = Challenge.where.not(user_id: report_user.id)
  sampled_challenges = challenges_to_report.sample(rand(1..[10, challenges_to_report.count].min))
  sampled_challenges.each do |challenge|
    Report.create!(
      content_type: 'challenge',
      content_id: challenge.id,
      reporter_id: report_user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on Challenge: #{e.message}. Skipping this report."
  end

  # Attempts
  attempts_to_report = Attempt.where.not(user_id: report_user.id)
  sampled_attempts = attempts_to_report.sample(rand(1..[10, attempts_to_report.count].min))
  sampled_attempts.each do |attempt|
    Report.create!(
      content_type: 'attempt',
      content_id: attempt.id,
      reporter_id: report_user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on Attempt: #{e.message}. Skipping this report."
  end

  # Comments
  comments_to_report = Comment.where.not(user_id: report_user.id)
  sampled_comments = comments_to_report.sample(rand(1..[10, comments_to_report.count].min))
  sampled_comments.each do |comment|
    Report.create!(
      content_type: 'comment',
      content_id: comment.id,
      reporter_id: report_user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on Comment: #{e.message}. Skipping this report."
  end

  # Users
  users_to_report = User.where.not(id: report_user.id)
  sampled_users = users_to_report.sample(rand(1..[10, users_to_report.count].min))
  sampled_users.each do |reported_user|
    Report.create!(
      content_type: 'user',
      content_id: reported_user.id,
      reporter_id: report_user.id,
      reason: report_reasons.sample
    )
  rescue ActiveRecord::RecordInvalid => e
    puts "Validation error for Report on User: #{e.message}. Skipping this report."
  end
end
